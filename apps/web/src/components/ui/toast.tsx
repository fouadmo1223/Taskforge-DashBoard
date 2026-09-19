import { create } from 'zustand';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastState {
  items: ToastItem[];
}

const useToastStore = create<ToastState>(() => ({ items: [] }));
let nextId = 1;

function dismiss(id: number): void {
  useToastStore.setState((s) => ({ items: s.items.filter((i) => i.id !== id) }));
}

function push(type: ToastType, message: string): void {
  const id = nextId++;
  useToastStore.setState((s) => ({ items: [...s.items, { id, type, message }] }));
  setTimeout(() => dismiss(id), 4000);
}

export const toast = {
  success: (message: string): void => push('success', message),
  error: (message: string): void => push('error', message),
  warning: (message: string): void => push('warning', message),
  info: (message: string): void => push('info', message),
};

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};
const TONES: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-primary',
};

export function ToastHost(): React.ReactElement {
  const items = useToastStore((s) => s.items);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[300] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {items.map((item) => {
          const Icon = ICONS[item.type];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-auto flex max-w-sm items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm shadow-pop"
            >
              <Icon className={cn('size-4 shrink-0', TONES[item.type])} />
              <span className="text-text">{item.message}</span>
              <button onClick={() => dismiss(item.id)} className="ms-1 text-text-subtle hover:text-text">
                <X className="size-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
