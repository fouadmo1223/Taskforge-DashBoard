import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArchiveRestore, ArrowLeft, Archive as ArchiveIcon } from 'lucide-react';
import { errorText } from '@/lib/api/errors';
import { PageHeader } from '@/components/layout/page-header';
import { Badge, Button, ErrorState, FullPageSpinner, confirm, toast } from '@/components/ui';
import { RelativeTime } from '@/components/ui/relative-time';
import { useAdminProject, useSetProjectArchived } from './projects.api';

function StatRow({ label, value }: { label: string; value: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text">{value}</span>
    </div>
  );
}

export function ProjectDetailPage(): React.ReactElement {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const project = useAdminProject(id);
  const setArchived = useSetProjectArchived(id ?? '');

  if (project.isLoading) return <FullPageSpinner />;
  if (project.isError || !project.data) {
    return <ErrorState message={t('errors.loadFailed')} onRetry={() => void project.refetch()} retryLabel={t('common.retry')} />;
  }
  const p = project.data;

  const toggleArchive = async (): Promise<void> => {
    const next = !p.archived;
    if (next) {
      const ok = await confirm({ title: t('projects.archive'), body: p.name });
      if (!ok) return;
    }
    try {
      await setArchived.mutateAsync(next);
      toast.success(next ? t('projects.archiveSuccess') : t('projects.restoreSuccess'));
    } catch (e) {
      toast.error(errorText(e, t));
    }
  };

  return (
    <div>
      <Link to="/projects" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="size-3.5 rtl:rotate-180" />
        {t('common.back')}
      </Link>

      <PageHeader
        title={p.name}
        subtitle={`${p.key} · ${p.workspaceName ?? '—'}`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={p.archived ? <ArchiveRestore className="size-3.5" /> : <ArchiveIcon className="size-3.5" />}
            loading={setArchived.isPending}
            onClick={() => void toggleArchive()}
          >
            {p.archived ? t('projects.restore') : t('projects.archive')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">{t('projects.profile')}</h2>
          <div className="mb-4 flex items-center gap-2">
            <Badge tone={p.archived ? 'neutral' : 'success'}>{p.archived ? t('projects.archived') : t('projects.active')}</Badge>
            <Badge>{t(`projects.status_${p.status}`)}</Badge>
            <Badge tone="primary">{t(`projects.visibility_${p.visibility}`)}</Badge>
          </div>
          <p className="mb-1 text-xs font-medium text-text-subtle">{t('projects.description')}</p>
          <p className="mb-4 text-sm text-text">{p.description || t('projects.noDescription')}</p>
          <StatRow label={t('projects.workspace')} value={p.workspaceName ?? '—'} />
          <StatRow label={t('projects.created')} value={<RelativeTime value={p.createdAt} />} />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">{t('projects.stats')}</h2>
          <StatRow label={t('projects.members')} value={p.memberCount} />
          <StatRow label={t('projects.boards')} value={p.boardCount} />
          <StatRow label={t('projects.tasks')} value={p.taskCount} />
          <StatRow label={t('projects.completedTasks')} value={p.completedTaskCount} />
        </div>
      </div>
    </div>
  );
}
