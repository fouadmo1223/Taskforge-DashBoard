import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, Input, type DataTableColumn } from '@/components/ui';
import { RelativeTime } from '@/components/ui/relative-time';
import { useAdminWorkspaces, type AdminWorkspaceListItem } from './workspaces.api';

export function WorkspacesListPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const query = useAdminWorkspaces({ page, pageSize: 20, search });

  const columns: DataTableColumn<AdminWorkspaceListItem>[] = [
    {
      key: 'name',
      header: t('workspaces.name'),
      render: (w) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-text">{w.name}</p>
          <p className="truncate text-xs text-text-subtle">/{w.slug}</p>
        </div>
      ),
    },
    { key: 'owner', header: t('workspaces.owner'), render: (w) => w.ownerName ?? '—' },
    { key: 'members', header: t('workspaces.members'), render: (w) => w.memberCount },
    { key: 'projects', header: t('workspaces.projects'), render: (w) => w.projectCount },
    { key: 'created', header: t('workspaces.created'), render: (w) => <RelativeTime value={w.createdAt} /> },
  ];

  return (
    <div>
      <PageHeader title={t('workspaces.title')} subtitle={t('workspaces.subtitle')} />
      <div className="mb-4">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t('workspaces.searchPlaceholder')}
          leading={<Search className="size-4" />}
          className="w-full max-w-xs"
        />
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.items ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        emptyTitle={t('workspaces.empty')}
        page={page}
        pageSize={20}
        total={query.data?.total ?? 0}
        onPageChange={setPage}
        onRowClick={(w) => navigate(`/workspaces/${w.id}`)}
      />
    </div>
  );
}
