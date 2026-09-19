import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { ConfirmHost, FullPageSpinner, ToastHost } from '@/components/ui';
import { useAuth } from '@/features/auth/auth.store';
import { router } from './router';
import '@/lib/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export function App(): React.ReactElement {
  const status = useAuth((s) => s.status);
  const bootstrap = useAuth((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (status === 'loading') return <FullPageSpinner />;

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastHost />
      <ConfirmHost />
    </QueryClientProvider>
  );
}
