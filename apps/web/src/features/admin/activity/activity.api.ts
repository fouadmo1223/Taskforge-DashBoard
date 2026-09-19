import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface AdminAuditLogView {
  id: string;
  workspaceId: string | null;
  actorName: string | null;
  actorLabel: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

interface AdminActivityPage {
  items: AdminAuditLogView[];
  nextCursor: string | null;
}

export function useAdminActivity() {
  return useInfiniteQuery({
    queryKey: ['admin', 'activity'],
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      api.get<AdminActivityPage>('/admin/activity', { query: { cursor: pageParam ?? undefined, limit: 30 } }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.items.length > 0 ? lastPage.nextCursor : null),
  });
}
