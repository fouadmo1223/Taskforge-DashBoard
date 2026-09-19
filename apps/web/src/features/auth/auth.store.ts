import { create } from 'zustand';
import type { AuthUser } from '@flowdesk/types';
import { api, ApiError, configureApiClient } from '@/lib/api/client';

interface AuthState {
  status: 'loading' | 'authenticated' | 'anonymous';
  user: AuthUser | null;
  accessToken: string | null;
  /** epoch ms when the access token expires */
  expiresAt: number | null;

  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

function applySession(token: string, expiresIn: number): void {
  useAuth.setState({ accessToken: token, expiresAt: Date.now() + expiresIn * 1000 });
}

/** This app is admin-only — a valid login from a non-platform-admin account is
 * rejected right here rather than letting them hit a wall of 403s on every request. */
function requirePlatformAdmin(user: AuthUser): void {
  if (!user.isPlatformAdmin) {
    throw new ApiError(403, { code: 'forbidden', message: 'This account does not have platform admin access.' });
  }
}

let bootstrapPromise: Promise<void> | null = null;
let refreshPromise: Promise<boolean> | null = null;

export const useAuth = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,
  accessToken: null,
  expiresAt: null,

  bootstrap: () => {
    bootstrapPromise ??= (async () => {
      const ok = await get().refresh();
      if (!ok) {
        set({ status: 'anonymous', user: null });
        return;
      }
      try {
        const me = await api.get<{ user: AuthUser }>('/auth/me');
        requirePlatformAdmin(me.user);
        set({ status: 'authenticated', user: me.user });
      } catch {
        set({ status: 'anonymous', user: null, accessToken: null, expiresAt: null });
      }
    })().finally(() => {
      bootstrapPromise = null;
    });
    return bootstrapPromise;
  },

  login: async (email, password) => {
    const res = await api.post<{
      user: AuthUser;
      tokens: { accessToken: string; expiresIn: number };
    }>('/auth/login', { email, password }, { anonymous: true });
    if (!res.user.isPlatformAdmin) {
      // A real session was issued (refresh cookie included) — don't leave it
      // dangling for an account this app will never let in.
      applySession(res.tokens.accessToken, res.tokens.expiresIn);
      await api.post('/auth/logout').catch(() => undefined);
      set({ accessToken: null, expiresAt: null });
      requirePlatformAdmin(res.user);
      return;
    }
    applySession(res.tokens.accessToken, res.tokens.expiresIn);
    set({ status: 'authenticated', user: res.user });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore network errors on logout */
    }
    set({ status: 'anonymous', user: null, accessToken: null, expiresAt: null });
  },

  refresh: () => {
    refreshPromise ??= (async () => {
      try {
        const res = await api.post<{ accessToken: string; expiresIn: number }>('/auth/refresh', undefined, {
          anonymous: true,
        });
        applySession(res.accessToken, res.expiresIn);
        return true;
      } catch (err) {
        if (err instanceof ApiError && err.isAuth) {
          set({ status: 'anonymous', user: null, accessToken: null, expiresAt: null });
        }
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  },
}));

configureApiClient({
  getToken: () => useAuth.getState().accessToken,
  onRefresh: () => useAuth.getState().refresh(),
});
