import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar as arLocale, enUS } from 'date-fns/locale';

export function RelativeTime({ value }: { value: string }): React.ReactElement {
  const { i18n } = useTranslation();
  const text = useMemo(
    () =>
      formatDistanceToNowStrict(new Date(value), {
        addSuffix: true,
        locale: i18n.resolvedLanguage === 'ar' ? arLocale : enUS,
      }),
    [value, i18n.resolvedLanguage],
  );
  return (
    <time dateTime={value} title={new Date(value).toLocaleString()}>
      {text}
    </time>
  );
}
