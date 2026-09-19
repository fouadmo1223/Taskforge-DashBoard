import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CloudinaryAsset, OffsetPage } from '@flowdesk/types';
import { api } from '@/lib/api/client';

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  avatar: CloudinaryAsset | null;
  emailVerified: boolean;
  isSuspended: boolean;
  isPlatformAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminUserDetail extends AdminUserListItem {
  bannedAt: string | null;
  banReason: string | null;
  verifiedByAdminAt: string | null;
  updatedAt: string;
  stats: {
    workspacesOwned: number;
    memberships: number;
    projectsCreated: number;
    tasksCreated: number;
    tasksAssigned: number;
  };
}

export interface AdminUsersQuery {
  page: number;
  pageSize: number;
  search?: string;
  verification?: 'all' | 'verified' | 'unverified';
  status?: 'all' | 'active' | 'banned';
  platformAdmin?: boolean;
}

const usersKey = (q: AdminUsersQuery) => ['admin', 'users', q] as const;
const userKey = (id: string) => ['admin', 'users', id] as const;

export function useAdminUsers(query: AdminUsersQuery) {
  return useQuery({
    queryKey: usersKey(query),
    queryFn: () =>
      api.get<OffsetPage<AdminUserListItem>>('/admin/users', {
        query: {
          page: query.page,
          pageSize: query.pageSize,
          search: query.search,
          verification: query.verification === 'all' ? undefined : query.verification,
          status: query.status === 'all' ? undefined : query.status,
          platformAdmin: query.platformAdmin,
        },
      }),
    placeholderData: (prev) => prev,
  });
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: userKey(id ?? ''),
    queryFn: () => api.get<AdminUserDetail>(`/admin/users/${id}`),
    enabled: Boolean(id),
  });
}

function useUserMutation(id: string, path: string, body?: (arg: unknown) => unknown) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (arg?: unknown) => api.patch<AdminUserDetail>(`/admin/users/${id}/${path}`, body ? body(arg) : undefined),
    onSuccess: (user) => {
      qc.setQueryData(userKey(id), user);
      void qc.invalidateQueries({ queryKey: ['admin', 'users'], exact: false });
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useVerifyUser(id: string) {
  return useUserMutation(id, 'verify');
}

export function useBanUser(id: string) {
  return useUserMutation(id, 'ban', (reason) => ({ reason: reason || undefined }));
}

export function useUnbanUser(id: string) {
  return useUserMutation(id, 'unban');
}

export function useSetPlatformAdmin(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isPlatformAdmin: boolean) => api.patch<AdminUserDetail>(`/admin/users/${id}/platform-admin`, { isPlatformAdmin }),
    onSuccess: (user) => {
      qc.setQueryData(userKey(id), user);
      void qc.invalidateQueries({ queryKey: ['admin', 'users'], exact: false });
    },
  });
}
