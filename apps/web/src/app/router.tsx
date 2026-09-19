import { createBrowserRouter } from 'react-router';
import { RequireAdmin, RedirectIfAuthed } from '@/features/auth/guards';
import { LoginPage } from '@/features/auth/pages/login-page';
import { AdminLayout } from '@/features/admin/layout/admin-layout';
import { DashboardPage } from '@/features/admin/dashboard/dashboard-page';
import { UsersListPage } from '@/features/admin/users/users-list-page';
import { UserDetailPage } from '@/features/admin/users/user-detail-page';
import { WorkspacesListPage } from '@/features/admin/workspaces/workspaces-list-page';
import { WorkspaceDetailPage } from '@/features/admin/workspaces/workspace-detail-page';
import { ProjectsListPage } from '@/features/admin/projects/projects-list-page';
import { ProjectDetailPage } from '@/features/admin/projects/project-detail-page';
import { TasksListPage } from '@/features/admin/tasks/tasks-list-page';
import { TaskDetailPage } from '@/features/admin/tasks/task-detail-page';
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
      { path: 'workspaces', element: <WorkspacesListPage /> },
      { path: 'workspaces/:id', element: <WorkspaceDetailPage /> },
      { path: 'projects', element: <ProjectsListPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'tasks', element: <TasksListPage /> },
      { path: 'tasks/:id', element: <TaskDetailPage /> },
      { path: 'activity', element: <ComingSoonPage titleKey="nav.activity" /> },
      { path: 'settings', element: <ComingSoonPage titleKey="nav.settings" /> },
    ],
  },
]);
