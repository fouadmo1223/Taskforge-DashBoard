import { useQuery } from '@tanstack/react-query';
import type { OffsetPage } from '@flowdesk/types';
import { api } from '@/lib/api/client';

export interface AdminWorkspaceListItem {
  id: string;
  name: string;
  slug: string;
  ownerUserId: string;
  ownerName: string | null;
  memberCount: number;
  projectCount: number;
  createdAt: string;
}

export interface AdminWorkspaceDetail extends AdminWorkspaceListItem {
  ownerEmail: string | null;
}

export interface AdminWorkspacesQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export function useAdminWorkspaces(query: AdminWorkspacesQuery) {
  return useQuery({
    queryKey: ['admin', 'workspaces', query],
    queryFn: () =>
      api.get<OffsetPage<AdminWorkspaceListItem>>('/admin/workspaces', {
        query: { page: query.page, pageSize: query.pageSize, search: query.search },
      }),
    placeholderData: (prev) => prev,
  });
}

export function useAdminWorkspace(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'workspaces', id ?? ''],
    queryFn: () => api.get<AdminWorkspaceDetail>(`/admin/workspaces/${id}`),
    enabled: Boolean(id),
  });
}
