// src/features/auth/LoginPage.jsx
import { useState, useEffect }   from 'react';
import { useDispatch }            from 'react-redux';
import { Link, useNavigate }      from 'react-router-dom';
import { useTranslation }         from 'react-i18next';
import { useForm }                from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

import AuthLayout  from '../../components/layout/AuthLayout';
import Input       from '../../components/common/Input';
import Button      from '../../components/common/Button';
import { loginThunk, clearError } from './authSlice';
import { useAuth } from '../../hooks/useAuth';
import { useToast }from '../../hooks/useToast';

export default function LoginPage() {
  const { t }    = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast    = useToast();
  const { loading, error, isAuthenticated } = useAuth();

  const [showPass, setShowPass]     = useState(false);
  const [show2FA,  setShow2FA]      = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '', twoFactorCode: '' },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(t(error));
      dispatch(clearError());
    }
  }, [error]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(result)) {
      toast.success(t('auth.login.title') + ' ✓');
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout>
      <div className="card animate-fade-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--primary-100)' }}
          >
            <Lock size={24} style={{ color: 'var(--primary-600)' }} />
          </div>
          <h1 className="text-2xl font-serif font-bold">{t('auth.login.title')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('auth.login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label={t('auth.login.email')}
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
            autoComplete="email"
            {...register('email', {
              required: t('auth.errors.required'),
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('auth.errors.invalidEmail') },
            })}
          />

          <Input
            label={t('auth.login.password')}
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            autoComplete="current-password"
            iconRight={
              <button type="button" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register('password', {
              required: t('auth.errors.required'),
              minLength: { value: 4, message: t('auth.errors.weakPassword') },
            })}
          />

          {show2FA && (
            <Input
              label={t('auth.login.twoFactor')}
              type="text"
              placeholder="000000"
              icon={ShieldCheck}
              hint={t('auth.login.twoFactorHint')}
              maxLength={6}
              {...register('twoFactorCode')}
            />
          )}

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setShow2FA((v) => !v)}
              className="text-[color:var(--text-faint)] hover:text-[color:var(--primary-600)] transition"
            >
              {show2FA ? '− 2FA' : '+ 2FA'}
            </button>
            <Link
              to="/forgot-password"
              className="font-semibold text-[color:var(--primary-600)] hover:underline"
            >
              {t('auth.login.forgot')}
            </Link>
          </div>

          <Button type="submit" fullWidth loading={loading} className="mt-2">
            {t('auth.login.submit')}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="font-bold text-[color:var(--primary-600)] hover:underline">
            {t('auth.login.signUp')}
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}