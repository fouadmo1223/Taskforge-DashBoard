import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Badge, DataTable, Input, Select, type DataTableColumn } from '@/components/ui';
import { RelativeTime } from '@/components/ui/relative-time';
import { useAdminTasks, type AdminTaskListItem } from './tasks.api';

const PRIORITY_TONE: Record<string, 'neutral' | 'primary' | 'warning' | 'danger'> = {
  none: 'neutral',
  low: 'neutral',
  medium: 'primary',
  high: 'warning',
  urgent: 'danger',
};

export function TasksListPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [completion, setCompletion] = useState<'all' | 'completed' | 'open'>('all');

  const query = useAdminTasks({
    page,
    pageSize: 20,
    search,
    priority: priority === 'all' ? undefined : priority,
    completion,
  });

  const columns: DataTableColumn<AdminTaskListItem>[] = [
    {
      key: 'title',
      header: t('projects.name'),
      render: (task) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-text">{task.title}</p>
          <p className="truncate text-xs text-text-subtle">{task.key}</p>
        </div>
      ),
    },
    { key: 'project', header: t('tasks.project'), render: (task) => task.projectName ?? '—' },
    {
      key: 'priority',
      header: t('tasks.priority'),
      render: (task) => <Badge tone={PRIORITY_TONE[task.priority] ?? 'neutral'}>{t(`tasks.priority_${task.priority}`)}</Badge>,
    },
    {
      key: 'assignees',
      header: t('tasks.assignees'),
      render: (task) => (task.assigneeNames.length ? task.assigneeNames.join(', ') : <span className="text-text-subtle">{t('tasks.unassigned')}</span>),
    },
    {
      key: 'status',
      header: t('users.status'),
      render: (task) => <Badge tone={task.completedAt ? 'success' : 'neutral'}>{task.completedAt ? t('tasks.completed') : t('tasks.open')}</Badge>,
    },
    { key: 'created', header: t('tasks.created'), render: (task) => <RelativeTime value={task.createdAt} /> },
  ];

  return (
    <div>
      <PageHeader title={t('tasks.title')} subtitle={t('tasks.subtitle')} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t('tasks.searchPlaceholder')}
          leading={<Search className="size-4" />}
          className="w-full max-w-xs"
        />
        <Select
          value={completion}
          onChange={(v) => {
            setCompletion(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: t('tasks.allTasks') },
            { value: 'open', label: t('tasks.open') },
            { value: 'completed', label: t('tasks.completed') },
          ]}
          className="w-36"
        />
        <Select
          value={priority}
          onChange={(v) => {
            setPriority(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: t('tasks.allPriorities') },
            { value: 'none', label: t('tasks.priority_none') },
            { value: 'low', label: t('tasks.priority_low') },
            { value: 'medium', label: t('tasks.priority_medium') },
            { value: 'high', label: t('tasks.priority_high') },
            { value: 'urgent', label: t('tasks.priority_urgent') },
          ]}
          className="w-40"
        />
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.items ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        emptyTitle={t('tasks.empty')}
        page={page}
        pageSize={20}
        total={query.data?.total ?? 0}
        onPageChange={setPage}
        onRowClick={(task) => navigate(`/tasks/${task.id}`)}
      />
    </div>
  );
}
