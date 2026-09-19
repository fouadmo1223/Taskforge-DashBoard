import type { TFunction } from 'i18next';
import { ApiError } from './client';

/** Human text for any thrown error — use this for every toast. Always prefers the
 * server's own message (specific to what happened) over a generic translated line. */
export function errorText(err: unknown, t: TFunction): string {
  if (err instanceof ApiError) return err.message || t('errors.generic');
  if (err instanceof Error && err.name === 'AbortError') return t('errors.network');
  if (err instanceof TypeError) return t('errors.network');
  if (err instanceof Error) return err.message || t('errors.generic');
  return t('errors.generic');
}
