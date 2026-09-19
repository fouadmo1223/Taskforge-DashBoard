import { createBrowserRouter } from 'react-router';
import { RequireAdmin, RedirectIfAuthed } from '@/features/auth/guards';
import { LoginPage } from '@/features/auth/pages/login-page';
import { AdminLayout } from '@/features/admin/layout/admin-layout';
import { DashboardPage } from '@/features/admin/dashboard/dashboard-page';
import { UsersListPage } from '@/features/admin/users/users-list-page';
import { UserDetailPage } from '@/features/admin/users/user-detail-page';
import { ComingSoonPage } from '@/features/admin/coming-soon-page';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RedirectIfAuthed>
        <LoginPage />
      </RedirectIfAuthed>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UsersListPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'workspaces', element: <ComingSoonPage titleKey="nav.workspaces" /> },
      { path: 'projects', element: <ComingSoonPage titleKey="nav.projects" /> },
      { path: 'activity', element: <ComingSoonPage titleKey="nav.activity" /> },
      { path: 'settings', element: <ComingSoonPage titleKey="nav.settings" /> },
    ],
  },
]);
