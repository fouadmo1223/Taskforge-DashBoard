import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OffsetPage } from '@flowdesk/types';
import { api } from '@/lib/api/client';

export interface AdminProjectListItem {
  id: string;
  key: string;
  name: string;
  status: string;
  visibility: string;
  workspaceId: string;
  workspaceName: string | null;
  memberCount: number;
  taskCount: number;
  archived: boolean;
  createdAt: string;
}

export interface AdminProjectDetail extends AdminProjectListItem {
  description: string;
  boardCount: number;
  completedTaskCount: number;
}

export interface AdminProjectsQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  visibility?: string;
}

const projectKey = (id: string) => ['admin', 'projects', id] as const;

export function useAdminProjects(query: AdminProjectsQuery) {
  return useQuery({
    queryKey: ['admin', 'projects', query],
    queryFn: () =>
      api.get<OffsetPage<AdminProjectListItem>>('/admin/projects', {
        query: { page: query.page, pageSize: query.pageSize, search: query.search, status: query.status, visibility: query.visibility },
      }),
    placeholderData: (prev) => prev,
  });
}

export function useAdminProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKey(id ?? ''),
    queryFn: () => api.get<AdminProjectDetail>(`/admin/projects/${id}`),
    enabled: Boolean(id),
  });
}

export function useSetProjectArchived(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (archived: boolean) => api.patch<AdminProjectDetail>(`/admin/projects/${id}/archived`, { archived }),
    onSuccess: (project) => {
      qc.setQueryData(projectKey(id), project);
      void qc.invalidateQueries({ queryKey: ['admin', 'projects'], exact: false });
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
