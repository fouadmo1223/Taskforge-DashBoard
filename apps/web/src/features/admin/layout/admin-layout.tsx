import { Outlet, useLocation } from 'react-router';
import { AnimatePresence } from 'motion/react';
import { PageTransition } from '@/components/layout/page-transition';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';

export function AdminLayout(): React.ReactElement {
  const location = useLocation();
  return (
    <div className="flex h-dvh w-full bg-bg">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
