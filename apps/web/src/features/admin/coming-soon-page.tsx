import { useTranslation } from 'react-i18next';
import { Hammer } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui';

export function ComingSoonPage({ titleKey }: { titleKey: string }): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t(titleKey)} />
      <EmptyState icon={<Hammer className="size-5" />} title="Coming soon" description="This section is being built out in a later phase." />
    </div>
  );
}
