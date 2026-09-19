import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Avatar, Badge, DataTable, Input, Select, type DataTableColumn } from '@/components/ui';
import { RelativeTime } from '@/components/ui/relative-time';
import { useAdminUsers, type AdminUserListItem } from './users.api';

export function UsersListPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [verification, setVerification] = useState<'all' | 'verified' | 'unverified'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'banned'>('all');

  const query = useAdminUsers({ page, pageSize: 20, search, verification, status });

  const columns: DataTableColumn<AdminUserListItem>[] = [
    {
      key: 'name',
      header: t('users.name'),
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={u.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-text">{u.name}</p>
            <p className="truncate text-xs text-text-subtle">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'verification',
      header: t('users.verification'),
      render: (u) => <Badge tone={u.emailVerified ? 'success' : 'warning'}>{u.emailVerified ? t('users.verified') : t('users.unverified')}</Badge>,
    },
    {
      key: 'status',
      header: t('users.status'),
      render: (u) => <Badge tone={u.isSuspended ? 'danger' : 'success'}>{u.isSuspended ? t('users.banned') : t('users.active')}</Badge>,
    },
    {
      key: 'joined',
      header: t('users.joined'),
      render: (u) => <RelativeTime value={u.createdAt} />,
    },
    {
      key: 'lastLogin',
      header: t('users.lastLogin'),
      render: (u) => (u.lastLoginAt ? <RelativeTime value={u.lastLoginAt} /> : <span className="text-text-subtle">{t('users.never')}</span>),
    },
  ];

  return (
    <div>
      <PageHeader title={t('users.title')} subtitle={t('users.subtitle')} />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t('users.searchPlaceholder')}
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
            { value: 'all', label: t('users.allStatuses') },
            { value: 'active', label: t('users.active') },
            { value: 'banned', label: t('users.banned') },
          ]}
          className="w-40"
        />
        <Select
          value={verification}
          onChange={(v) => {
            setVerification(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: t('users.allVerification') },
            { value: 'verified', label: t('users.verified') },
            { value: 'unverified', label: t('users.unverified') },
          ]}
          className="w-44"
        />
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.items ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        emptyTitle={t('users.empty')}
        page={page}
        pageSize={20}
        total={query.data?.total ?? 0}
        onPageChange={setPage}
        onRowClick={(u) => navigate(`/users/${u.id}`)}
      />
    </div>
  );
}
