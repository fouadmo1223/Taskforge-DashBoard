import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { errorText } from '@/lib/api/errors';
import { useAuth } from '@/features/auth/auth.store';
import { Button, Field, Input } from '@/components/ui';

export function LoginPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/', { replace: true });
    } catch (err) {
      setError(errorText(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh items-center justify-center bg-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-pop"
      >
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-contrast">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="text-lg font-semibold text-text">{t('auth.signIn')}</h1>
          <p className="text-sm text-text-muted">{t('auth.signInSubtitle')}</p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-3">
          <Field label={t('auth.email')}>
            <Input type="email" autoComplete="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={t('auth.password')} error={error ?? undefined}>
            <Input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              trailing={
                <button type="button" onClick={() => setShowPw((v) => !v)} className="pointer-events-auto text-text-subtle hover:text-text">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />
          </Field>
          <Button type="submit" loading={submitting} className="mt-1 w-full">
            {t('auth.signIn')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
