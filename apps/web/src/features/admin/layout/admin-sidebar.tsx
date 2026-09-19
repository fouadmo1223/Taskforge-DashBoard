import { useState } from 'react';
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Activity,
  ChevronsLeft,
  ChevronsRight,
  FolderKanban,
  KanbanSquare,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const ITEMS = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard', end: true },
  { to: '/users', icon: Users, labelKey: 'nav.users' },
  { to: '/workspaces', icon: FolderKanban, labelKey: 'nav.workspaces' },
  { to: '/projects', icon: KanbanSquare, labelKey: 'nav.projects' },
  { to: '/activity', icon: Activity, labelKey: 'nav.activity' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
] as const;

export function AdminSidebar(): React.ReactElement {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('taskforge-admin.sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });

  const toggle = (): void => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem('taskforge-admin.sidebar-collapsed', next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 232 }}
      transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
      className="hidden shrink-0 flex-col border-e border-border bg-surface sm:flex"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-contrast">
          <ShieldCheck className="size-4" />
        </span>
        {!collapsed && <span className="truncate text-sm font-semibold text-text">{t('common.appName')}</span>}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            title={collapsed ? t(item.labelKey) : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary-soft text-primary' : 'text-text-muted hover:bg-surface-sunken hover:text-text',
              )
            }
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggle}
        className="m-2 flex items-center justify-center gap-2 rounded-lg p-2 text-text-subtle hover:bg-surface-sunken hover:text-text"
      >
        {collapsed ? <ChevronsRight className="size-4 rtl:rotate-180" /> : <ChevronsLeft className="size-4 rtl:rotate-180" />}
      </button>
    </motion.aside>
  );
}
