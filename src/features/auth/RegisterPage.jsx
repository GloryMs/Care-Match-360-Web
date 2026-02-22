// src/features/auth/RegisterPage.jsx
import { useState, useEffect }      from 'react';
import { useDispatch }               from 'react-redux';
import { Link, useNavigate }         from 'react-router-dom';
import { useTranslation }            from 'react-i18next';
import { useForm }                   from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, UserCircle2, HeartHandshake } from 'lucide-react';

import AuthLayout     from '../../components/layout/AuthLayout';
import Input          from '../../components/common/Input';
import Select         from '../../components/common/Select';
import Button         from '../../components/common/Button';
import { registerThunk, clearError } from './authSlice';
import { useAuth }    from '../../hooks/useAuth';
import { useToast }   from '../../hooks/useToast';

const ROLE_OPTIONS = [
  'PATIENT', 'RELATIVE', 'RESIDENTIAL_PROVIDER', 'AMBULATORY_PROVIDER',
];

export default function RegisterPage() {
  const { t }    = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast    = useToast();
  const { loading, error, registered, registeredEmail } = useAuth();

  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [agreed,   setAgreed]     = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '', confirmPassword: '', role: '' },
  });

  const password = watch('password');

  // Navigate to verify email page after successful registration
  useEffect(() => {
    if (registered && registeredEmail) {
      navigate(`/verify-email?email=${encodeURIComponent(registeredEmail)}`);
    }
  }, [registered, registeredEmail, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(t(error));
      dispatch(clearError());
    }
  }, [error]);

  const onSubmit = async (data) => {
    if (!agreed) {
      toast.warning(t('auth.errors.required') + ' — Terms');
      return;
    }
    const result = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(result)) {
      toast.success(t('auth.register.submit') + ' ✓');
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
            <HeartHandshake size={24} style={{ color: 'var(--primary-600)' }} />
          </div>
          <h1 className="text-2xl font-serif font-bold">{t('auth.register.title')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('auth.register.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {/* Role */}
          <Select
            label={t('auth.register.role')}
            error={errors.role?.message}
            {...register('role', { required: t('auth.errors.required') })}
          >
            <option value="">{t('auth.register.role')}</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{t(`auth.register.roles.${r}`)}</option>
            ))}
          </Select>

          {/* Email */}
          <Input
            label={t('auth.register.email')}
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

          {/* Password */}
          <Input
            label={t('auth.register.password')}
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            icon={Lock}
            hint={t('auth.register.passwordHint')}
            error={errors.password?.message}
            autoComplete="new-password"
            iconRight={
              <button type="button" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register('password', {
              required: t('auth.errors.required'),
              minLength: { value: 8, message: t('auth.errors.weakPassword') },
            })}
          />

          {/* Confirm Password */}
          <Input
            label={t('auth.register.confirmPassword')}
            type={showConf ? 'text' : 'password'}
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
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

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[color:var(--primary-600)]"
            />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('auth.register.agreeToTerms')}{' '}
              <a href="#" className="font-semibold text-[color:var(--primary-600)] hover:underline">
                {t('auth.register.terms')}
              </a>{' '}
              {t('auth.register.and')}{' '}
              <a href="#" className="font-semibold text-[color:var(--primary-600)] hover:underline">
                {t('auth.register.privacy')}
              </a>
            </span>
          </label>

          <Button type="submit" fullWidth loading={loading} className="mt-2">
            {t('auth.register.submit')}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          {t('auth.register.hasAccount')}{' '}
          <Link to="/login" className="font-bold text-[color:var(--primary-600)] hover:underline">
            {t('auth.register.signIn')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}