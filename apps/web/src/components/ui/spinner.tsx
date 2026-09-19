import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }): React.ReactElement {
  return <Loader2 className={cn('animate-spin', className)} />;
}
