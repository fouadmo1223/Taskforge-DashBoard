import type { ReactNode } from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './button';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-text-muted',
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }): React.ReactElement {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', TONES[tone])}>
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }): React.ReactElement {
  return <div className={cn('animate-pulse rounded-lg bg-surface-sunken', className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-surface-sunken text-text-subtle">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <p className="text-sm font-medium text-text">{title}</p>
      {description && <p className="max-w-sm text-xs text-text-subtle">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry, retryLabel }: { message: string; onRetry?: () => void; retryLabel?: string }): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-danger-soft/40 py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <AlertTriangle className="size-5" />
      </div>
      <p className="text-sm font-medium text-text">{message}</p>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          {retryLabel ?? 'Retry'}
        </Button>
      )}
    </div>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'xs' | 'sm' | 'md' }): React.ReactElement {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  const dims = size === 'xs' ? 'size-6 text-[10px]' : size === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm';
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary', dims)}>
      {initials || '?'}
    </span>
  );
}
