import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorState, FullPageSpinner } from '@/components/ui';
import { RelativeTime } from '@/components/ui/relative-time';
import { useAdminWorkspace } from './workspaces.api';

function StatRow({ label, value }: { label: string; value: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text">{value}</span>
    </div>
  );
}

export function WorkspaceDetailPage(): React.ReactElement {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const ws = useAdminWorkspace(id);

  if (ws.isLoading) return <FullPageSpinner />;
  if (ws.isError || !ws.data) {
    return <ErrorState message={t('errors.loadFailed')} onRetry={() => void ws.refetch()} retryLabel={t('common.retry')} />;
  }
  const w = ws.data;

  return (
    <div>
      <Link to="/workspaces" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="size-3.5 rtl:rotate-180" />
        {t('common.back')}
      </Link>
      <PageHeader title={w.name} subtitle={`/${w.slug}`} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">{t('workspaces.profile')}</h2>
          <StatRow label={t('workspaces.owner')} value={w.ownerName ? `${w.ownerName} (${w.ownerEmail})` : '—'} />
          <StatRow label={t('workspaces.created')} value={<RelativeTime value={w.createdAt} />} />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">{t('workspaces.stats')}</h2>
          <StatRow label={t('workspaces.members')} value={w.memberCount} />
          <StatRow label={t('workspaces.projects')} value={w.projectCount} />
        </div>
      </div>
    </div>
  );
}
