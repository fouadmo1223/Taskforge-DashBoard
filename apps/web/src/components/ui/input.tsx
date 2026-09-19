import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

const baseField =
  'h-9 w-full rounded-lg border bg-surface px-3 text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary disabled:cursor-not-allowed disabled:opacity-50';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, leading, trailing, className, ...rest },
  ref,
) {
  if (leading || trailing) {
    return (
      <div className={cn('relative flex items-center', className)}>
        {leading && <span className="pointer-events-none absolute start-3 text-text-subtle">{leading}</span>}
        <input
          ref={ref}
          className={cn(baseField, error ? 'border-danger' : 'border-border', leading && 'ps-9', trailing && 'pe-9')}
          {...rest}
        />
        {trailing && <span className="absolute end-3">{trailing}</span>}
      </div>
    );
  }
  return <input ref={ref} className={cn(baseField, error ? 'border-danger' : 'border-border', className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }>(
  function Textarea({ error, className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-20 w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-danger' : 'border-border',
          className,
        )}
        {...rest}
      />
    );
  },
);
