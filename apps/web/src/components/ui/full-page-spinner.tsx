import { Spinner } from './spinner';

export function FullPageSpinner(): React.ReactElement {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-bg">
      <Spinner className="size-6 text-text-subtle" />
    </div>
  );
}
