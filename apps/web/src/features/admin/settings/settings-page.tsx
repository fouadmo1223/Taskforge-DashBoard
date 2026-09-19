import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { errorText } from '@/lib/api/errors';
import { useAuth } from '@/features/auth/auth.store';
import { PageHeader } from '@/components/layout/page-header';
import { Avatar, Badge, Button, EmptyState, Input, Skeleton, confirm, toast } from '@/components/ui';
import { useAdminUsers, useSetPlatformAdmin, type AdminUserListItem } from '../users/users.api';

function GrantRow({ user }: { user: AdminUserListItem }): React.ReactElement {
  const { t } = useTranslation();
  const setAdmin = useSetPlatformAdmin(user.id);

  const grant = async (): Promise<void> => {
    try {
      await setAdmin.mutateAsync(true);
      toast.success(t('settings.grantSuccess'));
    } catch (e) {
      toast.error(errorText(e, t));
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-surface-sunken">
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar name={user.name} size="xs" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text">{user.name}</p>
          <p className="truncate text-xs text-text-subtle">{user.email}</p>
        </div>
      </div>
      {user.isPlatformAdmin ? (
        <Badge tone="primary">{t('users.admin')}</Badge>
      ) : (
        <Button size="sm" variant="secondary" icon={<ShieldCheck className="size-3.5" />} loading={setAdmin.isPending} onClick={() => void grant()}>
          {t('settings.grant')}
        </Button>
      )}
    </div>
  );
}

function AdminRow({ user, isSelf }: { user: AdminUserListItem; isSelf: boolean }): React.ReactElement {
  const { t } = useTranslation();
  const setAdmin = useSetPlatformAdmin(user.id);

  const revoke = async (): Promise<void> => {
    const ok = await confirm({ title: t('settings.revokeConfirmTitle'), body: t('settings.revokeConfirmBody'), danger: true });
    if (!ok) return;
    try {
      await setAdmin.mutateAsync(false);
      toast.success(t('settings.revokeSuccess'));
    } catch (e) {
      toast.error(errorText(e, t));
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar name={user.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text">
            {user.name} {isSelf && <span className="text-text-subtle">({t('settings.you')})</span>}
          </p>
          <p className="truncate text-xs text-text-subtle">{user.email}</p>
        </div>
      </div>
      {!isSelf && (
        <Button size="sm" variant="danger" icon={<ShieldOff className="size-3.5" />} loading={setAdmin.isPending} onClick={() => void revoke()}>
          {t('settings.revoke')}
        </Button>
      )}
    </div>
  );
}

export function SettingsPage(): React.ReactElement {
  const { t } = useTranslation();
  const myId = useAuth((s) => s.user?.id);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const searchResults = useAdminUsers({ page: 1, pageSize: 5, search });
  const admins = useAdminUsers({ page: 1, pageSize: 100, platformAdmin: true });

  return (
    <div>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text">{t('settings.adminsTitle')}</h2>
          <p className="mt-1 text-xs text-text-subtle">{t('settings.adminsSubtitle')}</p>

          <div className="mt-4">
            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={t('settings.searchToGrant')} leading={<Search className="size-4" />} />
            {search && (
              <div className="mt-2 flex flex-col gap-0.5">
                {searchResults.isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (searchResults.data?.items.length ?? 0) === 0 ? (
                  <p className="px-2 py-2 text-xs text-text-subtle">{t('settings.noResults')}</p>
                ) : (
                  searchResults.data!.items.map((u) => <GrantRow key={u.id} user={u} />)
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">{t('users.admin')}</h2>
          {admins.isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (admins.data?.items.length ?? 0) === 0 ? (
            <EmptyState title={t('settings.noResults')} />
          ) : (
            admins.data!.items.map((u) => <AdminRow key={u.id} user={u} isSelf={u.id === myId} />)
          )}
        </div>
      </div>
    </div>
  );
}
