import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Ban, CheckCircle2, FilePlus, FileEdit, Trash2, ShieldCheck, Archive as ArchiveIcon, ArchiveRestore } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { RelativeTime } from '@/components/ui/relative-time';
import { useAdminActivity, type AdminAuditLogView } from './activity.api';

const ACTION_ICON: Record<string, typeof ShieldCheck> = {
  'user.verified_by_admin': CheckCircle2,
  'user.banned': Ban,
  'user.unbanned': ShieldCheck,
  'project.archived_by_admin': ArchiveIcon,
  'project.restored_by_admin': ArchiveRestore,
  'project.create': FilePlus,
  'project.update': FileEdit,
  'project.delete': Trash2,
  'task.delete': Trash2,
};
const ACTION_TONE: Record<string, string> = {
  'user.verified_by_admin': 'bg-success-soft text-success',
  'user.banned': 'bg-danger-soft text-danger',
  'user.unbanned': 'bg-success-soft text-success',
  'project.archived_by_admin': 'bg-warning-soft text-warning',
  'project.restored_by_admin': 'bg-success-soft text-success',
  'project.create': 'bg-primary-soft text-primary',
  'project.update': 'bg-primary-soft text-primary',
  'project.delete': 'bg-danger-soft text-danger',
  'task.delete': 'bg-danger-soft text-danger',
};

/** Humanized fallback for any action string that doesn't have a translation yet
 * (e.g. a new AuditService.record() call added elsewhere in the app later) — "task.
 * create" becomes "Task create" instead of showing the raw dotted code to an admin. */
function humanizeAction(action: string): string {
  return action
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ActivityRow({ entry, index }: { entry: AdminAuditLogView; index: number }): React.ReactElement {
  const { t } = useTranslation();
  const Icon = ACTION_ICON[entry.action] ?? ShieldCheck;
  const label = t(`activity.action_${entry.action.replace(/\./g, '_')}`, { defaultValue: humanizeAction(entry.action) });
  const who = entry.actorName ?? entry.actorLabel ?? t('activity.system');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
      className="flex items-start gap-3 border-b border-border py-3 last:border-0"
    >
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${ACTION_TONE[entry.action] ?? 'bg-surface-sunken text-text-muted'}`}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text">{label}</p>
        <p className="text-xs text-text-subtle">
          {t('activity.by', { name: who })} · <RelativeTime value={entry.createdAt} />
        </p>
      </div>
    </motion.div>
  );
}

export function ActivityPage(): React.ReactElement {
  const { t } = useTranslation();
  const query = useAdminActivity();
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div>
      <PageHeader title={t('activity.title')} subtitle={t('activity.subtitle')} />
      <div className="rounded-2xl border border-border bg-surface p-5">
        {query.isError ? (
          <ErrorState message={t('errors.loadFailed')} onRetry={() => void query.refetch()} retryLabel={t('common.retry')} />
        ) : query.isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title={t('activity.empty')} />
        ) : (
          <>
            {items.map((entry, i) => (
              <ActivityRow key={entry.id} entry={entry} index={i} />
            ))}
            {query.hasNextPage && (
              <div className="pt-3 text-center">
                <Button variant="secondary" size="sm" loading={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>
                  {t('activity.loadMore')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
