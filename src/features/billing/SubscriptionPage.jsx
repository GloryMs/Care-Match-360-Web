// src/features/billing/SubscriptionPage.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, CheckCircle2, Zap, Shield, Crown, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    tier: 'BASIC', price: 49.99, icon: Zap, color: '#6b7280',
    offers: 'Up to 10/month', support: 'Email',
    features: ['Basic profile visibility','Match score access','Email support','Up to 10 offers/month'],
  },
  {
    tier: 'PRO', price: 99.99, icon: Shield, color: 'var(--primary-600)', popular: true,
    offers: 'Unlimited', support: 'Priority email',
    features: ['Enhanced visibility','Analytics dashboard','Priority email support','Unlimited offers','Performance insights'],
  },
  {
    tier: 'PREMIUM', price: 199.99, icon: Crown, color: '#d97706',
    offers: 'Unlimited', support: '24/7 phone',
    features: ['Maximum visibility','Advanced analytics','24/7 phone support','Unlimited offers','Dedicated account manager','Custom integrations'],
  },
];

const CURRENT = { tier: 'PRO', status: 'ACTIVE', renewsOn: '2026-03-22', trialEnd: null };

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(CURRENT.tier);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background:'var(--bg-page)'}}>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-serif font-bold text-2xl" style={{color:'var(--text-main)'}}>{t('nav.subscription')}</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Manage your subscription plan</p>
      </div>
      {/* Current plan banner */}
      <div className="mb-8 p-5 rounded-2xl border animate-fade-in-up delay-100 flex flex-col md:flex-row md:items-center gap-4"
        style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-serif font-bold text-lg" style={{color:'var(--text-main)'}}>Current: {CURRENT.tier} Plan</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:'#f0fdf4',color:'#16a34a'}}>{CURRENT.status}</span>
          </div>
          <p className="text-sm" style={{color:'var(--text-muted)'}}>Renews on {CURRENT.renewsOn} · 14-day free trial for new subscribers</p>
        </div>
        <button className="px-5 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
          style={{borderColor:'#fca5a5',color:'#dc2626'}}>
          Cancel Subscription
        </button>
      </div>
      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {PLANS.map((plan,i) => {
          const Icon = plan.icon;
          const isCurrent = plan.tier === CURRENT.tier;
          const isSelected = plan.tier === selected;
          return (
            <div key={plan.tier}
              onClick={() => setSelected(plan.tier)}
              className={`animate-fade-in-up delay-${(i+1)*100} relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg`}
              style={{
                background: 'var(--bg-card)',
                borderColor: isSelected ? plan.color : 'var(--border)',
                transform: isSelected ? 'translateY(-4px)' : undefined,
                boxShadow: isSelected ? `0 8px 32px ${plan.color}25` : undefined,
              }}>
              {plan.popular && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{background:'var(--primary-600)'}}>
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-4 end-4">
                  <CheckCircle2 size={18} style={{color:'var(--primary-600)'}}/>
                </div>
              )}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{background:`${plan.color}18`}}>
                <Icon size={20} style={{color:plan.color}}/>
              </div>
              <h3 className="font-serif font-bold text-xl mb-1" style={{color:'var(--text-main)'}}>{plan.tier}</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-3xl font-bold" style={{color:'var(--text-main)'}}>€{plan.price}</span>
                <span className="text-sm mb-1" style={{color:'var(--text-muted)'}}>/mo</span>
              </div>
              <div className="flex flex-col gap-2 mb-6">
                {plan.features.map(f=>(
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={13} style={{color:plan.color, flexShrink:0}}/>
                    <span style={{color:'var(--text-muted)'}}>{f}</span>
                  </div>
                ))}
              </div>
              {isCurrent ? (
                <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold"
                  style={{background:'var(--primary-100)',color:'var(--primary-700)'}}>
                  Current Plan
                </div>
              ) : (
                <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{background:plan.color}}>
                  {plan.price > 99.99 ? 'Upgrade to Premium' : plan.price > 49.99 ? 'Upgrade to Pro' : 'Downgrade to Basic'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-center" style={{color:'var(--text-faint)'}}>
        All plans include a 14-day free trial. Cancel anytime. 3-day grace period after failed payment.
      </p>
    </div>
  );
}