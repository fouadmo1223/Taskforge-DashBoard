import { create } from 'zustand';
import { Dialog } from './dialog';
import { Button } from './button';

interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions | null;
  resolve: ((v: boolean) => void) | null;
}

const useConfirmStore = create<ConfirmState>(() => ({ open: false, options: null, resolve: null }));

/** Imperative promise-based confirm — resolves true/false. Use for destructive actions. */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.setState({ open: true, options, resolve });
  });
}

export function ConfirmHost(): React.ReactElement {
  const { open, options, resolve } = useConfirmStore();
  const close = (result: boolean): void => {
    resolve?.(result);
    useConfirmStore.setState({ open: false, options: null, resolve: null });
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && close(false)}
      title={options?.title}
      description={options?.body}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => close(false)}>
            {options?.cancelLabel ?? 'Cancel'}
          </Button>
          <Button variant={options?.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
            {options?.confirmLabel ?? 'Confirm'}
          </Button>
        </>
      }
    >
      {null}
    </Dialog>
  );
}
