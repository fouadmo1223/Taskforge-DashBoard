import { useQuery } from '@tanstack/react-query';
import type { OffsetPage } from '@flowdesk/types';
import { api } from '@/lib/api/client';

export interface AdminTaskListItem {
  id: string;
  key: string;
  title: string;
  priority: string;
  projectId: string;
  projectName: string | null;
  assigneeNames: string[];
  reporterName: string | null;
  completedAt: string | null;
  dueDate: string | null;
  createdAt: string;
}

export interface AdminTaskDetail extends AdminTaskListItem {
  description: string;
  commentCount: number;
  attachmentCount: number;
  subtaskCount: number;
  subtaskDoneCount: number;
}

export interface AdminTasksQuery {
  page: number;
  pageSize: number;
  search?: string;
  priority?: string;
  completion?: 'all' | 'completed' | 'open';
}

export function useAdminTasks(query: AdminTasksQuery) {
  return useQuery({
    queryKey: ['admin', 'tasks', query],
    queryFn: () =>
      api.get<OffsetPage<AdminTaskListItem>>('/admin/tasks', {
        query: {
          page: query.page,
          pageSize: query.pageSize,
          search: query.search,
          priority: query.priority,
          completion: query.completion === 'all' ? undefined : query.completion,
        },
      }),
    placeholderData: (prev) => prev,
  });
}

export function useAdminTask(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'tasks', id ?? ''],
    queryFn: () => api.get<AdminTaskDetail>(`/admin/tasks/${id}`),
    enabled: Boolean(id),
  });
}
