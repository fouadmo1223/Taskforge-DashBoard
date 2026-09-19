import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Ban, CheckCircle2, ShieldCheck } from 'lucide-react';
import { errorText } from '@/lib/api/errors';
import { PageHeader } from '@/components/layout/page-header';
import { Avatar, Badge, Button, Dialog, ErrorState, Field, FullPageSpinner, Textarea, confirm, toast } from '@/components/ui';
import { RelativeTime } from '@/components/ui/relative-time';
import { useAdminUser, useBanUser, useUnbanUser, useVerifyUser } from './users.api';

function StatRow({ label, value }: { label: string; value: number }): React.ReactElement {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text">{value}</span>
    </div>
  );
}

export function UserDetailPage(): React.ReactElement {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const user = useAdminUser(id);
  const verify = useVerifyUser(id ?? '');
  const ban = useBanUser(id ?? '');
  const unban = useUnbanUser(id ?? '');
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState('');

  if (user.isLoading) return <FullPageSpinner />;
  if (user.isError || !user.data) {
    return <ErrorState message={t('errors.loadFailed')} onRetry={() => void user.refetch()} retryLabel={t('common.retry')} />;
  }
  const u = user.data;

  const handleVerify = async (): Promise<void> => {
    const ok = await confirm({ title: t('users.verifyConfirmTitle'), body: t('users.verifyConfirmBody') });
    if (!ok) return;
    try {
      await verify.mutateAsync(undefined);
      toast.success(t('users.verifySuccess'));
    } catch (e) {
      toast.error(errorText(e, t));
    }
  };

  const handleUnban = async (): Promise<void> => {
    const ok = await confirm({ title: t('users.unbanConfirmTitle') });
    if (!ok) return;
    try {
      await unban.mutateAsync(undefined);
      toast.success(t('users.unbanSuccess'));
    } catch (e) {
      toast.error(errorText(e, t));
    }
  };

  const handleBan = async (): Promise<void> => {
    try {
      await ban.mutateAsync(banReason);
      toast.success(t('users.banSuccess'));
      setBanOpen(false);
      setBanReason('');
    } catch (e) {
      toast.error(errorText(e, t));
    }
  };

  return (
    <div>
      <Link to="/users" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="size-3.5 rtl:rotate-180" />
        {t('common.back')}
      </Link>

      <PageHeader
        title={u.name}
        subtitle={u.email}
        actions={
          <div className="flex items-center gap-2">
            {!u.emailVerified && (
              <Button variant="secondary" size="sm" icon={<CheckCircle2 className="size-3.5" />} loading={verify.isPending} onClick={() => void handleVerify()}>
                {t('users.verify')}
              </Button>
            )}
            {u.isSuspended ? (
              <Button variant="secondary" size="sm" icon={<ShieldCheck className="size-3.5" />} loading={unban.isPending} onClick={() => void handleUnban()}>
                {t('users.unban')}
              </Button>
            ) : (
              <Button variant="danger" size="sm" icon={<Ban className="size-3.5" />} onClick={() => setBanOpen(true)}>
                {t('users.ban')}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">{t('users.profile')}</h2>
          <div className="flex items-center gap-3">
            <Avatar name={u.name} size="md" />
            <div>
              <p className="font-medium text-text">{u.name}</p>
              <p className="text-sm text-text-subtle">{u.email}</p>
            </div>
            {u.isPlatformAdmin && <Badge tone="primary">{t('users.admin')}</Badge>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-text-subtle">{t('users.verification')}</p>
              <Badge tone={u.emailVerified ? 'success' : 'warning'}>{u.emailVerified ? t('users.verified') : t('users.unverified')}</Badge>
            </div>
            <div>
              <p className="text-text-subtle">{t('users.status')}</p>
              <Badge tone={u.isSuspended ? 'danger' : 'success'}>{u.isSuspended ? t('users.banned') : t('users.active')}</Badge>
            </div>
            <div>
              <p className="text-text-subtle">{t('users.joined')}</p>
              <p className="text-text">
                <RelativeTime value={u.createdAt} />
              </p>
            </div>
            <div>
              <p className="text-text-subtle">{t('users.lastLogin')}</p>
              <p className="text-text">{u.lastLoginAt ? <RelativeTime value={u.lastLoginAt} /> : t('users.never')}</p>
            </div>
            {u.verifiedByAdminAt && (
              <div>
                <p className="text-text-subtle">{t('users.verifiedByAdminAt')}</p>
                <p className="text-text">
                  <RelativeTime value={u.verifiedByAdminAt} />
                </p>
              </div>
            )}
            {u.isSuspended && (
              <>
                <div>
                  <p className="text-text-subtle">{t('users.bannedAt')}</p>
                  <p className="text-text">{u.bannedAt ? <RelativeTime value={u.bannedAt} /> : '—'}</p>
                </div>
                {u.banReason && (
                  <div className="col-span-2">
                    <p className="text-text-subtle">{t('users.banReasonLabel')}</p>
                    <p className="text-text">{u.banReason}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <h2 className="mb-1 mt-6 text-xs font-semibold uppercase tracking-wide text-danger">{t('users.danger')}</h2>
          <p className="mb-3 text-xs text-text-subtle">
            {u.isSuspended ? t('users.unbanConfirmTitle') : t('users.banConfirmBody')}
          </p>
          {u.isSuspended ? (
            <Button variant="secondary" size="sm" loading={unban.isPending} onClick={() => void handleUnban()}>
              {t('users.unban')}
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setBanOpen(true)}>
              {t('users.ban')}
            </Button>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">{t('users.stats')}</h2>
          <StatRow label={t('users.workspacesOwned')} value={u.stats.workspacesOwned} />
          <StatRow label={t('users.memberships')} value={u.stats.memberships} />
          <StatRow label={t('users.projectsCreated')} value={u.stats.projectsCreated} />
          <StatRow label={t('users.tasksCreated')} value={u.stats.tasksCreated} />
          <StatRow label={t('users.tasksAssigned')} value={u.stats.tasksAssigned} />
        </div>
      </div>

      <Dialog
        open={banOpen}
        onOpenChange={setBanOpen}
        title={t('users.banConfirmTitle')}
        description={t('users.banConfirmBody')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBanOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" loading={ban.isPending} onClick={() => void handleBan()}>
              {t('users.ban')}
            </Button>
          </>
        }
      >
        <Field label={t('users.banReason')}>
          <Textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} rows={3} />
        </Field>
      </Dialog>
    </div>
  );
}
