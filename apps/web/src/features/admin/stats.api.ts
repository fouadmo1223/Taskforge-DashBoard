import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface AdminDashboardStats {
  users: { total: number; verified: number; unverified: number; banned: number; newLast7Days: number };
  workspaces: { total: number };
  projects: { total: number; archived: number };
  tasks: { total: number; completed: number };
}

export const statsKey = ['admin', 'stats'];

export function useAdminStats() {
  return useQuery({
    queryKey: statsKey,
    queryFn: () => api.get<AdminDashboardStats>('/admin/stats'),
    staleTime: 30_000,
  });
}
