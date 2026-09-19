import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Badge, DataTable, Input, Select, type DataTableColumn } from '@/components/ui';
import { RelativeTime } from '@/components/ui/relative-time';
import { useAdminProjects, type AdminProjectListItem } from './projects.api';

const STATUS_TONE: Record<string, 'neutral' | 'primary' | 'success' | 'warning'> = {
  planning: 'neutral',
  active: 'primary',
  on_hold: 'warning',
  completed: 'success',
  archived: 'neutral',
};

export function ProjectsListPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [visibility, setVisibility] = useState('all');

  const query = useAdminProjects({
    page,
    pageSize: 20,
    search,
    status: status === 'all' ? undefined : status,
    visibility: visibility === 'all' ? undefined : visibility,
  });

  const columns: DataTableColumn<AdminProjectListItem>[] = [
    {
      key: 'name',
      header: t('projects.name'),
      render: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-text">{p.name}</p>
          <p className="truncate text-xs text-text-subtle">{p.key}</p>
        </div>
      ),
    },
    { key: 'workspace', header: t('projects.workspace'), render: (p) => p.workspaceName ?? '—' },
    {
      key: 'status',
      header: t('projects.status'),
      render: (p) => <Badge tone={STATUS_TONE[p.status] ?? 'neutral'}>{t(`projects.status_${p.status}`)}</Badge>,
    },
    { key: 'visibility', header: t('projects.visibility'), render: (p) => t(`projects.visibility_${p.visibility}`) },
    { key: 'members', header: t('projects.members'), render: (p) => p.memberCount },
    { key: 'tasks', header: t('projects.tasks'), render: (p) => p.taskCount },
    { key: 'created', header: t('projects.created'), render: (p) => <RelativeTime value={p.createdAt} /> },
  ];

  return (
    <div>
      <PageHeader title={t('projects.title')} subtitle={t('projects.subtitle')} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t('projects.searchPlaceholder')}
          leading={<Search className="size-4" />}
          className="w-full max-w-xs"
        />
        <Select
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: t('projects.allStatuses') },
            { value: 'planning', label: t('projects.status_planning') },
            { value: 'active', label: t('projects.status_active') },
            { value: 'on_hold', label: t('projects.status_on_hold') },
            { value: 'completed', label: t('projects.status_completed') },
            { value: 'archived', label: t('projects.status_archived') },
          ]}
          className="w-40"
        />
        <Select
          value={visibility}
          onChange={(v) => {
            setVisibility(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: t('projects.allVisibility') },
            { value: 'workspace', label: t('projects.visibility_workspace') },
            { value: 'team', label: t('projects.visibility_team') },
            { value: 'private', label: t('projects.visibility_private') },
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
        emptyTitle={t('projects.empty')}
        page={page}
        pageSize={20}
        total={query.data?.total ?? 0}
        onPageChange={setPage}
        onRowClick={(p) => navigate(`/projects/${p.id}`)}
      />
    </div>
  );
}
