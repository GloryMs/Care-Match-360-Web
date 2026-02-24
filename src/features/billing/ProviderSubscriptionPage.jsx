// src/features/billing/ProviderSubscriptionPage.jsx
// Real API — no mock data
import { useState, useEffect } from 'react';
import {
  CreditCard, CheckCircle2, Star, Zap, Crown,
  Loader2, AlertCircle, RefreshCw, XCircle,
  ArrowUpCircle, ArrowDownCircle, Clock,
} from 'lucide-react';
import { billingAPI }         from '../../api/billingService';
import { providerProfileAPI } from '../../api/profileService';
import { useToast } from '../../hooks/useToast';

// ─── Plan definitions (matches API Subscription Plans Reference) ──────────────
const PLANS = [
  {
    tier: 'BASIC',
    name: 'Basic',
    price: '49.99',
    icon: Star,
    color: '#6b7280',
    features: ['Up to 10 offers/month', 'Basic profile visibility', 'Email support'],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    price: '99.99',
    icon: Zap,
    color: 'var(--primary-600)',
    popular: true,
    features: ['Unlimited offers', 'Enhanced visibility', 'Analytics dashboard', 'Priority email support'],
  },
  {
    tier: 'PREMIUM',
    name: 'Premium',
    price: '199.99',
    icon: Crown,
    color: '#d97706',
    features: ['Unlimited offers', 'Maximum visibility', 'Advanced analytics', 'Dedicated account manager', '24/7 phone support'],
  },
];

const STATUS_CONFIG = {
  ACTIVE:    { color: '#16a34a', bg: '#f0fdf4', label: 'Active'    },
  TRIALING:  { color: '#4a7a8a', bg: '#f0f6f8', label: 'Trial'     },
  PAUSED:    { color: '#d97706', bg: '#fffbeb', label: 'Paused'    },
  CANCELLED: { color: '#9ca3af', bg: '#f9fafb', label: 'Cancelled' },
  PAST_DUE:  { color: '#dc2626', bg: '#fef2f2', label: 'Past Due'  },
};

// ─── Active Subscription Card ────────────────────────────────────────────────
function ActiveSubscriptionCard({ sub, onUpgrade, onCancel, onRefresh }) {
  const cfg  = STATUS_CONFIG[sub.status] || STATUS_CONFIG.ACTIVE;
  const plan = PLANS.find(p => p.tier === sub.tier);
  const Icon = plan?.icon || CreditCard;

  const daysLeft = sub.trialEnd
    ? Math.max(0, Math.ceil((new Date(sub.trialEnd) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--primary-100)' }}>
            <Icon size={22} style={{ color: plan?.color || 'var(--primary-600)' }} />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold" style={{ color: 'var(--text-main)' }}>
              {sub.planInfo?.name ?? sub.tier} Plan
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              €{sub.planInfo?.price ?? plan?.price}/month
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-semibold"
          style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>
      </div>

      {sub.status === 'TRIALING' && daysLeft !== null && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2"
          style={{ background: '#f0f6f8', color: '#4a7a8a' }}>
          <Clock size={15} />
          <span className="text-sm font-medium">
            {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining in your free trial
          </span>
        </div>
      )}

      {sub.status === 'PAST_DUE' && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2"
          style={{ background: '#fef2f2', color: '#dc2626' }}>
          <AlertCircle size={15} />
          <span className="text-sm font-medium">Payment failed — please update your payment method</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Current Period Start', value: new Date(sub.currentPeriodStart).toLocaleDateString() },
          { label: 'Current Period End',   value: new Date(sub.currentPeriodEnd).toLocaleDateString() },
          sub.trialEnd && { label: 'Trial Ends', value: new Date(sub.trialEnd).toLocaleDateString() },
          sub.cancelledAt && { label: 'Cancelled At', value: new Date(sub.cancelledAt).toLocaleDateString() },
        ].filter(Boolean).map(({ label, value }) => (
          <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-main)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      {(sub.planInfo?.features ?? plan?.features ?? []).length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>INCLUDED</p>
          <div className="flex flex-col gap-1.5">
            {(sub.planInfo?.features ?? plan?.features).map(f => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span className="text-sm" style={{ color: 'var(--text-main)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button onClick={onUpgrade}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--primary-600)', color: '#fff' }}>
          <ArrowUpCircle size={15} />
          Change Plan
        </button>
        {sub.status !== 'CANCELLED' && (
          <button onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: '#dc2626', color: '#dc2626', background: '#fef2f2' }}>
            <XCircle size={15} />
            Cancel
          </button>
        )}
        <button onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}>
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>
    </div>
  );
}

// ─── Plan Selection Cards ─────────────────────────────────────────────────────
function PlanCards({ currentTier, onSelect, selecting }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PLANS.map(plan => {
        const Icon      = plan.icon;
        const isCurrent = currentTier === plan.tier;
        return (
          <div key={plan.tier}
            className="relative rounded-2xl border p-5 transition-all"
            style={{
              background:   isCurrent ? 'var(--primary-50)' : 'var(--bg-card)',
              borderColor:  isCurrent ? 'var(--primary-400)' : plan.popular ? 'var(--primary-300)' : 'var(--border)',
              boxShadow:    plan.popular && !isCurrent ? '0 0 0 1px var(--primary-200)' : 'none',
            }}>
            {plan.popular && !isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: 'var(--primary-600)' }}>
                Most Popular
              </div>
            )}
            {isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: '#16a34a' }}>
                Current Plan
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <Icon size={18} style={{ color: plan.color }} />
              <h3 className="font-serif font-bold" style={{ color: 'var(--text-main)' }}>{plan.name}</h3>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>€{plan.price}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/month</span>
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{f}</span>
                </div>
              ))}
            </div>
            {!isCurrent && (
              <button
                onClick={() => onSelect(plan.tier)}
                disabled={selecting === plan.tier}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                style={{ background: 'var(--primary-600)', color: '#fff' }}>
                {selecting === plan.tier ? <Loader2 size={15} className="animate-spin" /> : null}
                Select Plan
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProviderSubscriptionPage() {
  const toast = useToast();

  const [providerId,  setProviderId]  = useState(null);
  const [sub,         setSub]         = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showPlans,   setShowPlans]   = useState(false);
  const [selecting,   setSelecting]   = useState(null);
  const [cancelling,  setCancelling]  = useState(false);

  useEffect(() => {
    providerProfileAPI.getMyProfile()
      .then(r => setProviderId(r.data.data.id))
      .catch(() => setError('Failed to load provider profile'));
  }, []);

  const loadSubscription = async () => {
    if (!providerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await billingAPI.getProviderSubscription(providerId);
      setSub(res.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setSub(null);  // No subscription yet
      } else {
        setError(err.response?.data?.error?.message || 'Failed to load subscription');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (providerId) loadSubscription(); }, [providerId]);

  const handleSelectPlan = async (tier) => {
    setSelecting(tier);
    try {
      if (sub) {
        // Upgrade/downgrade existing
        await billingAPI.updateSubscription(sub.id, { newTier: tier });
        toast.success('Plan updated successfully');
      } else {
        // New subscription
        await billingAPI.createSubscription({ providerId, tier });
        toast.success('Subscription created — 14-day trial started!');
      }
      await loadSubscription();
      setShowPlans(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update plan');
    } finally {
      setSelecting(null);
    }
  };

  const handleCancel = async () => {
    if (!sub || !confirm('Are you sure you want to cancel your subscription?')) return;
    setCancelling(true);
    try {
      await billingAPI.cancelSubscription(sub.id);
      toast.success('Subscription cancelled. You can use the platform until the end of your billing period.');
      await loadSubscription();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-serif font-bold" style={{ color: 'var(--text-main)' }}>
          Subscription
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage your CareMatch360 subscription plan
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={32} style={{ color: '#dc2626' }} />
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button onClick={loadSubscription}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--primary-600)', color: '#fff' }}>Retry</button>
        </div>
      ) : sub ? (
        <div className="flex flex-col gap-6">
          <div className="animate-fade-in-up delay-100">
            <ActiveSubscriptionCard
              sub={sub}
              onUpgrade={() => setShowPlans(true)}
              onCancel={handleCancel}
              onRefresh={loadSubscription}
            />
          </div>
          {showPlans && (
            <div className="animate-fade-in-up delay-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-bold" style={{ color: 'var(--text-main)' }}>
                  Change Plan
                </h2>
                <button onClick={() => setShowPlans(false)}
                  className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  ✕ Close
                </button>
              </div>
              <PlanCards currentTier={sub.tier} onSelect={handleSelectPlan} selecting={selecting} />
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in-up delay-100">
          <div className="text-center mb-8 p-6 rounded-2xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <CreditCard size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <h2 className="text-lg font-serif font-bold mb-2" style={{ color: 'var(--text-main)' }}>
              No Active Subscription
            </h2>
            <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Choose a plan to start matching with patients. All plans include a 14-day free trial.
            </p>
          </div>
          <PlanCards currentTier={null} onSelect={handleSelectPlan} selecting={selecting} />
        </div>
      )}
    </div>
  );
}