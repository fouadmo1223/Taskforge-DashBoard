import type { ReactNode } from 'react';
import * as RDialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}): React.ReactElement {
  const maxWidth = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RDialog.Portal forceMount>
            <RDialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
              />
            </RDialog.Overlay>
            <RDialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 4 }}
                transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                className={cn(
                  'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col',
                  'rounded-2xl border border-border bg-surface-elevated shadow-pop',
                  maxWidth,
                )}
              >
                {title && (
                  <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
                    <div className="min-w-0">
                      <RDialog.Title className="text-base font-semibold text-text">{title}</RDialog.Title>
                      {description && <RDialog.Description className="mt-1 text-sm text-text-muted">{description}</RDialog.Description>}
                    </div>
                    <RDialog.Close className="rounded-lg p-1 text-text-subtle hover:bg-surface-sunken hover:text-text">
                      <X className="size-4" />
                    </RDialog.Close>
                  </div>
                )}
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">{children}</div>
                {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
              </motion.div>
            </RDialog.Content>
          </RDialog.Portal>
        )}
      </AnimatePresence>
    </RDialog.Root>
  );
}
