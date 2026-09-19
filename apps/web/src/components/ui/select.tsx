import * as RSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
}

export function Select<V extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: V | null;
  onChange: (v: V) => void;
  options: SelectOption<V>[];
  placeholder?: string;
  className?: string;
}): React.ReactElement {
  return (
    <RSelect.Root value={value ?? undefined} onValueChange={(v) => onChange(v as V)}>
      <RSelect.Trigger
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary',
          className,
        )}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon>
          <ChevronDown className="size-3.5 text-text-subtle" />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={4}
          className="z-[200] max-h-64 w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-xl border border-border bg-surface-elevated p-1 shadow-pop"
        >
          <RSelect.Viewport>
            {options.map((opt) => (
              <RSelect.Item
                key={opt.value}
                value={opt.value}
                className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm text-text outline-none data-[highlighted]:bg-surface-sunken"
              >
                <RSelect.ItemText>{opt.label}</RSelect.ItemText>
                <RSelect.ItemIndicator>
                  <Check className="size-3.5 text-primary" />
                </RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}
