// src/features/auth/VerifyEmailPage.jsx
import { useState, useEffect }   from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation }         from 'react-i18next';
import { MailCheck, RefreshCw, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

import AuthLayout    from '../../components/layout/AuthLayout';
import Button        from '../../components/common/Button';
import { useToast }  from '../../hooks/useToast';
import { authAPI }   from '../../api/identityService';

export default function VerifyEmailPage() {
  const { t }                   = useTranslation();
  const toast                   = useToast();
  const [params]                = useSearchParams();

  const email = params.get('email');
  const token = params.get('token');

  const [status, setStatus]       = useState('pending');   // pending | verifying | verified | error
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);

  // If token in URL → call real verify-email endpoint
  useEffect(() => {
    if (!token) return;
    setStatus('verifying');
    authAPI.verifyEmail(token)
      .then(() => setStatus('verified'))
      .catch(() => setStatus('error'));
  }, [token]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authAPI.resendVerification(decodeURIComponent(email));
      setResent(true);
      toast.success(t('auth.verify.resendSuccess'));
    } catch (err) {
      const msg = err.response?.data?.error?.message || t('auth.verify.resendSuccess');
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="card animate-fade-up text-center">
        {/* Verifying state */}
        {status === 'verifying' && (
          <>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'var(--primary-100)' }}
            >
              <RefreshCw size={26} style={{ color: 'var(--primary-600)' }} className="animate-spin" />
            </div>
            <h1 className="text-2xl font-serif font-bold">{t('auth.verify.verifying')}</h1>
          </>
        )}

        {/* Verified */}
        {status === 'verified' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100">
              <CheckCircle2 size={30} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-green-600 mb-2">
              {t('auth.verify.verified')}
            </h1>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
              {t('auth.verify.verifiedDesc')}
            </p>
            <Link to="/login">
              <Button fullWidth>{t('auth.verify.backToLogin')}</Button>
            </Link>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-100">
              <XCircle size={30} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-red-500 mb-2">
              {t('auth.verify.invalidToken')}
            </h1>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
              {t('auth.verify.instruction')}
            </p>
            <Link to="/login">
              <Button variant="ghost" fullWidth>{t('auth.verify.backToLogin')}</Button>
            </Link>
          </>
        )}

        {/* Pending — awaiting email click */}
        {status === 'pending' && (
          <>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'var(--primary-100)' }}
            >
              <MailCheck size={28} style={{ color: 'var(--primary-600)' }} />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-2">{t('auth.verify.title')}</h1>
            {email && (
              <p className="mb-1" style={{ color: 'var(--text-muted)' }}>
                {t('auth.verify.subtitle')}
              </p>
            )}
            {email && (
              <p className="font-bold mb-4" style={{ color: 'var(--primary-600)' }}>
                {decodeURIComponent(email)}
              </p>
            )}
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              {t('auth.verify.instruction')}
            </p>

            {/* Resend button */}
            {!resent ? (
              <Button
                variant="ghost"
                fullWidth
                loading={resending}
                onClick={handleResend}
              >
                <RefreshCw size={16} />
                {t('auth.verify.resend')}
              </Button>
            ) : (
              <div
                className="flex items-center justify-center gap-2 py-2 text-sm font-semibold"
                style={{ color: 'var(--primary-600)' }}
              >
                <CheckCircle2 size={16} />
                {t('auth.verify.resendSuccess')}
              </div>
            )}

            <div className="mt-6">
              <Link
                to="/login"
                className="text-sm flex items-center justify-center gap-1 transition hover:text-[color:var(--primary-600)]"
                style={{ color: 'var(--text-muted)' }}
              >
                <ArrowLeft size={14} />
                {t('auth.verify.backToLogin')}
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
