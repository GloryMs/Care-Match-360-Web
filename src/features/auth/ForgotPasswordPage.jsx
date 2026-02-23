// src/features/auth/ForgotPasswordPage.jsx
import { useState }              from 'react';
import { Link }                  from 'react-router-dom';
import { useTranslation }        from 'react-i18next';
import { useForm }               from 'react-hook-form';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

import AuthLayout    from '../../components/layout/AuthLayout';
import Input         from '../../components/common/Input';
import Button        from '../../components/common/Button';
import { useToast }  from '../../hooks/useToast';
import { authAPI }   from '../../api/identityService';

export default function ForgotPasswordPage() {
  const { t }    = useTranslation();
  const toast    = useToast();
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.info(t('auth.forgot.sent'));
    } catch (err) {
      const msg = err.response?.data?.error?.message || t('auth.errors.invalidEmail');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="card animate-fade-up">
        {!sent ? (
          <>
            <div className="mb-8 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--primary-100)' }}
              >
                <Mail size={24} style={{ color: 'var(--primary-600)' }} />
              </div>
              <h1 className="text-2xl font-serif font-bold">{t('auth.forgot.title')}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {t('auth.forgot.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <Input
                label={t('auth.forgot.email')}
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: t('auth.errors.required'),
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('auth.errors.invalidEmail') },
                })}
              />
              <Button type="submit" fullWidth loading={loading} className="mt-2">
                <Send size={16} />
                {t('auth.forgot.submit')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm flex items-center justify-center gap-1 hover:text-[color:var(--primary-600)] transition"
                style={{ color: 'var(--text-muted)' }}
              >
                <ArrowLeft size={14} />
                {t('auth.forgot.backToLogin')}
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100">
              <CheckCircle2 size={30} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-2">{t('auth.forgot.sent')}</h1>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>{t('auth.forgot.sentDesc')}</p>
            <Link to="/login">
              <Button variant="ghost" fullWidth>
                <ArrowLeft size={16} />
                {t('auth.forgot.backToLogin')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
