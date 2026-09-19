import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Badge, ErrorState, FullPageSpinner } from '@/components/ui';
import { RelativeTime } from '@/components/ui/relative-time';
import { useAdminTask } from './tasks.api';

function StatRow({ label, value }: { label: string; value: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text">{value}</span>
    </div>
  );
}

const PRIORITY_TONE: Record<string, 'neutral' | 'primary' | 'warning' | 'danger'> = {
  none: 'neutral',
  low: 'neutral',
  medium: 'primary',
  high: 'warning',
  urgent: 'danger',
};

export function TaskDetailPage(): React.ReactElement {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const task = useAdminTask(id);

  if (task.isLoading) return <FullPageSpinner />;
  if (task.isError || !task.data) {
    return <ErrorState message={t('errors.loadFailed')} onRetry={() => void task.refetch()} retryLabel={t('common.retry')} />;
  }
  const tk = task.data;

  return (
    <div>
      <Link to="/tasks" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="size-3.5 rtl:rotate-180" />
        {t('common.back')}
      </Link>
      <PageHeader title={tk.title} subtitle={`${tk.key} · ${tk.projectName ?? '—'}`} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">{t('tasks.profile')}</h2>
          <div className="mb-4 flex items-center gap-2">
            <Badge tone={tk.completedAt ? 'success' : 'neutral'}>{tk.completedAt ? t('tasks.completed') : t('tasks.open')}</Badge>
            <Badge tone={PRIORITY_TONE[tk.priority] ?? 'neutral'}>{t(`tasks.priority_${tk.priority}`)}</Badge>
          </div>
          <p className="mb-1 text-xs font-medium text-text-subtle">{t('tasks.description')}</p>
          <p className="mb-4 text-sm text-text">{tk.description || t('tasks.noDescription')}</p>
          <StatRow label={t('tasks.project')} value={tk.projectName ?? '—'} />
          <StatRow label={t('tasks.reporter')} value={tk.reporterName ?? '—'} />
          <StatRow label={t('tasks.assignees')} value={tk.assigneeNames.length ? tk.assigneeNames.join(', ') : t('tasks.unassigned')} />
          {tk.dueDate && <StatRow label={t('tasks.dueDate')} value={<RelativeTime value={tk.dueDate} />} />}
          <StatRow label={t('tasks.created')} value={<RelativeTime value={tk.createdAt} />} />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">{t('tasks.stats')}</h2>
          <StatRow label={t('tasks.comments')} value={tk.commentCount} />
          <StatRow label={t('tasks.attachments')} value={tk.attachmentCount} />
          <StatRow label={t('tasks.subtasks')} value={`${tk.subtaskDoneCount}/${tk.subtaskCount}`} />
        </div>
      </div>
    </div>
  );
}
