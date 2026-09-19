import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { DirectionProvider } from '@radix-ui/react-direction';
import { ConfirmHost, FullPageSpinner, ToastHost } from '@/components/ui';
import { useAuth } from '@/features/auth/auth.store';
import { isRtl } from '@/lib/i18n';
import { router } from './router';
import '@/lib/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export function App(): React.ReactElement {
  const { i18n } = useTranslation();
  const status = useAuth((s) => s.status);
  const bootstrap = useAuth((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (status === 'loading') return <FullPageSpinner />;

  // Radix primitives (Select, Dialog, Dropdown...) don't infer RTL from
  // `document.dir` on their own — their internal positioning and keyboard
  // navigation need an explicit direction context, or they silently behave
  // as if the page were LTR even though the visible layout is mirrored.
  return (
    <DirectionProvider dir={isRtl(i18n.resolvedLanguage ?? 'en') ? 'rtl' : 'ltr'}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastHost />
        <ConfirmHost />
      </QueryClientProvider>
    </DirectionProvider>
  );
}
