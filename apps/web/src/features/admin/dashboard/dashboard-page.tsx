import { useTranslation } from 'react-i18next';
import { Ban, CheckCircle2, Clock, FolderKanban, KanbanSquare, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatsCard } from '@/components/ui';
import { useAdminStats } from '../stats.api';

export function DashboardPage(): React.ReactElement {
  const { t } = useTranslation();
  const stats = useAdminStats();
  const d = stats.data;

  return (
    <div>
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatsCard label={t('dashboard.totalUsers')} value={d?.users.total ?? 0} icon={<Users className="size-4" />} tone="primary" loading={stats.isLoading} />
        <StatsCard label={t('dashboard.verifiedUsers')} value={d?.users.verified ?? 0} icon={<CheckCircle2 className="size-4" />} tone="success" loading={stats.isLoading} />
        <StatsCard label={t('dashboard.unverifiedUsers')} value={d?.users.unverified ?? 0} icon={<Clock className="size-4" />} tone="warning" loading={stats.isLoading} />
        <StatsCard label={t('dashboard.bannedUsers')} value={d?.users.banned ?? 0} icon={<Ban className="size-4" />} tone="danger" loading={stats.isLoading} />
        <StatsCard label={t('dashboard.newUsers7d')} value={d?.users.newLast7Days ?? 0} icon={<UserPlus className="size-4" />} loading={stats.isLoading} />
        <StatsCard label={t('dashboard.totalWorkspaces')} value={d?.workspaces.total ?? 0} icon={<ShieldCheck className="size-4" />} loading={stats.isLoading} />
        <StatsCard label={t('dashboard.totalProjects')} value={d?.projects.total ?? 0} icon={<FolderKanban className="size-4" />} tone="primary" loading={stats.isLoading} />
        <StatsCard label={t('dashboard.archivedProjects')} value={d?.projects.archived ?? 0} icon={<FolderKanban className="size-4" />} loading={stats.isLoading} />
        <StatsCard label={t('dashboard.totalTasks')} value={d?.tasks.total ?? 0} icon={<KanbanSquare className="size-4" />} tone="primary" loading={stats.isLoading} />
        <StatsCard label={t('dashboard.completedTasks')} value={d?.tasks.completed ?? 0} icon={<CheckCircle2 className="size-4" />} tone="success" loading={stats.isLoading} />
      </div>
    </div>
  );
}
