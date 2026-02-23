// src/features/auth/ResetPasswordPage.jsx
import { useState }                      from 'react';
import { Link, useSearchParams }         from 'react-router-dom';
import { useTranslation }                from 'react-i18next';
import { useForm }                       from 'react-hook-form';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

import AuthLayout    from '../../components/layout/AuthLayout';
import Input         from '../../components/common/Input';
import Button        from '../../components/common/Button';
import { useToast }  from '../../hooks/useToast';
import { authAPI }   from '../../api/identityService';

export default function ResetPasswordPage() {
  const { t }    = useTranslation();
  const toast    = useToast();
  const [params] = useSearchParams();
  const token    = params.get('token');

  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  if (!token) {
    return (
      <AuthLayout>
        <div className="card animate-fade-up text-center py-8">
          <XCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="font-bold text-lg">{t('auth.reset.invalidToken')}</p>
          <Link to="/forgot-password" className="mt-4 inline-block">
            <Button variant="ghost">{t('auth.forgot.submit')}</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const onSubmit = async ({ password: newPassword }) => {
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword });
      setSuccess(true);
      toast.success(t('auth.reset.success'));
    } catch (err) {
      const msg = err.response?.data?.error?.message || t('auth.reset.invalidToken');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="card animate-fade-up">
        {!success ? (
          <>
            <div className="mb-8 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--primary-100)' }}
              >
                <Lock size={24} style={{ color: 'var(--primary-600)' }} />
              </div>
              <h1 className="text-2xl font-serif font-bold">{t('auth.reset.title')}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {t('auth.reset.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <Input
                label={t('auth.reset.password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                error={errors.password?.message}
                iconRight={
                  <button type="button" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...register('password', {
                  required:  t('auth.errors.required'),
                  minLength: { value: 8, message: t('auth.errors.weakPassword') },
                })}
              />
              <Input
                label={t('auth.reset.confirmPassword')}
                type={showConf ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                error={errors.confirmPassword?.message}
                iconRight={
                  <button type="button" onClick={() => setShowConf((v) => !v)} tabIndex={-1}>
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...register('confirmPassword', {
                  required: t('auth.errors.required'),
                  validate: (v) => v === password || t('auth.errors.passwordMismatch'),
                })}
              />
              <Button type="submit" fullWidth loading={loading} className="mt-2">
                {t('auth.reset.submit')}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100">
              <CheckCircle2 size={30} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-2">{t('auth.reset.success')}</h1>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>{t('auth.reset.successDesc')}</p>
            <Link to="/login">
              <Button fullWidth>{t('auth.reset.backToLogin')}</Button>
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
