import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { Skeleton } from './misc';

export function StatsCard({
  label,
  value,
  icon,
  tone = 'neutral',
  loading,
}: {
  label: string;
  value: number | string;
  icon?: ReactNode;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}): React.ReactElement {
  const toneClass =
    tone === 'primary'
      ? 'bg-primary-soft text-primary'
      : tone === 'success'
        ? 'bg-success-soft text-success'
        : tone === 'warning'
          ? 'bg-warning-soft text-warning'
          : tone === 'danger'
            ? 'bg-danger-soft text-danger'
            : 'bg-surface-sunken text-text-muted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
    >
      {icon && <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', toneClass)}>{icon}</span>}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-text-subtle">{label}</p>
        {loading ? <Skeleton className="mt-1 h-6 w-14" /> : <p className="text-xl font-semibold text-text">{value}</p>}
      </div>
    </motion.div>
  );
}
