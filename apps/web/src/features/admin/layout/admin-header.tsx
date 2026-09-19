import { useTranslation } from 'react-i18next';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/features/auth/auth.store';
import { useTheme } from '@/lib/theme/theme.store';
import { Avatar, Select } from '@/components/ui';
import i18n, { SUPPORTED_LOCALES } from '@/lib/i18n';
import { useAdminUi } from './admin-ui.store';

export function AdminHeader(): React.ReactElement {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { resolved, setPreference } = useTheme();
  const setMobileNavOpen = useAdminUi((s) => s.setMobileNavOpen);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6">
      <button
        onClick={() => setMobileNavOpen(true)}
        className="flex size-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-sunken hover:text-text sm:hidden"
        aria-label={t('common.openMenu')}
      >
        <Menu className="size-4" />
      </button>
      <div className="hidden sm:block" />
      <div className="flex items-center gap-2">
        <Select
          value={i18n.resolvedLanguage ?? 'en'}
          onChange={(v) => void i18n.changeLanguage(v)}
          options={SUPPORTED_LOCALES.map((l) => ({ value: l, label: l === 'ar' ? 'العربية' : 'English' }))}
          className="w-28"
        />
        <button
          onClick={() => setPreference(resolved === 'dark' ? 'light' : 'dark')}
          className="flex size-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-sunken hover:text-text"
          aria-label={t('common.toggleTheme')}
          title={t('common.toggleTheme')}
        >
          {resolved === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        {user && (
          <div className="flex items-center gap-2 ps-2">
            <Avatar name={user.name} size="sm" />
            <span className="hidden text-sm font-medium text-text sm:inline">{user.name}</span>
          </div>
        )}
        <button
          onClick={() => void logout()}
          className="flex size-9 items-center justify-center rounded-lg text-text-muted hover:bg-danger-soft hover:text-danger"
          aria-label={t('common.logOut')}
          title={t('common.logOut')}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
