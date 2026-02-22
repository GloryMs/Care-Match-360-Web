// src/features/landing/LandingPage.jsx
import { useTranslation }              from 'react-i18next';
import { Link }                        from 'react-router-dom';
import {
  Heart, Shield, Sparkles, Users, Globe2, CreditCard,
  ChevronRight, CheckCircle2, Star, ArrowRight, HeartHandshake,
  Activity, MapPin, Phone
} from 'lucide-react';
import LanguageSwitcher                from '../../components/common/LanguageSwitcher';
import ThemeSwitcher                   from '../../components/common/ThemeSwitcher';

/* ─── Floating decorative blobs ──────────────────────────────────────────── */
function Blob({ className }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
    />
  );
}

/* ─── Stats bar ─────────────────────────────────────────────────────────── */
function StatItem({ value, label }) {
  return (
    <div className="text-center px-4 py-3">
      <p className="text-2xl md:text-3xl font-serif font-bold" style={{ color: 'var(--primary-600)' }}>
        {value}
      </p>
      <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

/* ─── Feature card ──────────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, delay }) {
  return (
    <div
      className={`card group hover:scale-[1.02] transition-all duration-300 animate-fade-up delay-${delay}`}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}
      >
        <Icon size={22} />
      </div>
      <h3 className="font-serif font-bold text-lg mb-2" style={{ color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {desc}
      </p>
    </div>
  );
}

/* ─── Step card ─────────────────────────────────────────────────────────── */
function StepCard({ number, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-serif font-bold text-white mb-4 shadow-md"
        style={{ background: 'var(--primary-600)' }}
      >
        {number}
      </div>
      <h4 className="font-serif font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  );
}

/* ─── Pricing card ──────────────────────────────────────────────────────── */
function PlanCard({ tier, popular, t }) {
  const key = tier.toLowerCase();
  const features = [];
  for (let i = 1; i <= 5; i++) {
    const f = t(`landing.plans.${key}.feature${i}`, { defaultValue: '' });
    if (f) features.push(f);
  }

  return (
    <div
      className={`card relative flex flex-col gap-5 transition-all duration-300 hover:scale-[1.02] ${
        popular ? 'ring-2 ring-[color:var(--primary-500)] shadow-lg' : ''
      }`}
    >
      {popular && (
        <div
          className="absolute -top-3 start-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow"
          style={{ background: 'var(--primary-600)', transform: 'translateX(-50%)' }}
        >
          {t('landing.plans.popular')}
        </div>
      )}

      <div>
        <h3 className="font-serif font-bold text-xl">{t(`landing.plans.${key}.name`)}</h3>
        <div className="flex items-end gap-1 mt-2">
          <span className="text-4xl font-serif font-bold" style={{ color: 'var(--primary-600)' }}>
            €{t(`landing.plans.${key}.price`)}
          </span>
          <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            {t('landing.plans.monthly')}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--primary-500)' }} />
            <span style={{ color: 'var(--text-main)' }}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/register"
        className="btn-primary w-full text-center"
      >
        {t('landing.plans.choosePlan')}
      </Link>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    { icon: Sparkles,     key: 'matching',     delay: 100 },
    { icon: Shield,       key: 'transparency', delay: 200 },
    { icon: HeartHandshake,key: 'offers',      delay: 300 },
    { icon: Activity,     key: 'secure',       delay: 400 },
    { icon: Globe2,       key: 'multilingual', delay: 500 },
    { icon: CreditCard,   key: 'billing',      delay: 600 },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>

      {/* ── NAVBAR ────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ background: 'color-mix(in srgb, var(--bg-card) 85%, transparent)', borderColor: 'var(--border)' }}
      >
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--primary-600)' }}
            >
              <Heart size={16} className="text-white" />
            </span>
            <span className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>
              Care<span style={{ color: 'var(--primary-600)' }}>Match</span>360
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {['features', 'howItWorks', 'plans'].map((key) => (
              <a
                key={key}
                href={`#${key}`}
                className="text-sm font-medium transition-colors hover:text-[color:var(--primary-600)]"
                style={{ color: 'var(--text-muted)' }}
              >
                {t(`nav.${key}`)}
              </a>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <div className="hidden sm:flex items-center gap-2 ms-2">
              <Link to="/login" className="btn-ghost text-sm py-2 px-3">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                {t('nav.register')}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <Blob className="w-96 h-96 -top-20 -start-20 bg-[color:var(--primary-300)]" />
        <Blob className="w-80 h-80 top-40 end-0 bg-[color:var(--primary-200)]" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 flex flex-col items-center text-center gap-8">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border animate-fade-up"
            style={{ background: 'var(--primary-50)', borderColor: 'var(--primary-200)', color: 'var(--primary-700)' }}
          >
            <Star size={14} fill="currentColor" />
            {t('landing.hero.badge')}
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight max-w-4xl animate-fade-up delay-100">
            {t('landing.hero.title')}{' '}
            <span
              className="relative inline-block"
              style={{ color: 'var(--primary-600)' }}
            >
              {t('landing.hero.titleAccent')}
              {/* Underline decoration */}
              <svg
                className="absolute -bottom-1 start-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9 C50 3, 100 11, 150 6 C200 1, 250 10, 298 5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl max-w-2xl leading-relaxed animate-fade-up delay-200"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('landing.hero.subtitle')}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up delay-300">
            <Link
              to="/register"
              className="btn-primary flex items-center gap-2 text-base py-3 px-6"
            >
              <Heart size={18} />
              {t('landing.hero.ctaPatient')}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/register"
              className="btn-ghost flex items-center gap-2 text-base py-3 px-6"
            >
              <Users size={18} />
              {t('landing.hero.ctaProvider')}
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="mt-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 rounded-2xl border overflow-hidden animate-fade-up delay-400 w-full max-w-2xl"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <StatItem value="850+" label={t('landing.hero.stats.providers')} />
            <StatItem value="12k+" label={t('landing.hero.stats.matches')} />
            <StatItem value="2.5k+" label={t('landing.hero.stats.families')} />
            <StatItem value="98%" label={t('landing.hero.stats.satisfaction')} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              {t('landing.features.title')}{' '}
              <span style={{ color: 'var(--primary-600)' }}>{t('landing.features.subtitle')}</span>
            </h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              {t('landing.features.description')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon, key, delay }) => (
              <FeatureCard
                key={key}
                icon={icon}
                title={t(`landing.features.items.${key}.title`)}
                desc={t(`landing.features.items.${key}.desc`)}
                delay={delay}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="howItWorks" className="py-20" style={{ background: 'var(--bg-subtle)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-14">
            {t('landing.howItWorks.title')}
          </h2>

          {/* Connector line (desktop only) */}
          <div className="relative">
            <div
              className="absolute top-7 start-[12.5%] end-[12.5%] h-0.5 hidden md:block"
              style={{ background: 'var(--border)' }}
            />
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 relative">
              {[1, 2, 3, 4].map((n) => (
                <StepCard
                  key={n}
                  number={n}
                  title={t(`landing.howItWorks.steps.${n}.title`)}
                  desc={t(`landing.howItWorks.steps.${n}.desc`)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANS ────────────────────────────────────────────────────── */}
      <section id="plans" className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              {t('landing.plans.title')}
            </h2>
            <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
              {t('landing.plans.subtitle')}
            </p>
            <p
              className="mt-1 text-sm font-semibold inline-flex items-center gap-1"
              style={{ color: 'var(--primary-600)' }}
            >
              <CheckCircle2 size={14} />
              {t('landing.plans.trial')}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mt-10">
            <PlanCard tier="BASIC"   popular={false} t={t} />
            <PlanCard tier="PRO"     popular={true}  t={t} />
            <PlanCard tier="PREMIUM" popular={false} t={t} />
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'var(--bg-subtle)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div
            className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-6 mx-auto animate-pulse-ring"
            style={{ background: 'var(--primary-100)' }}
          >
            <Heart size={28} style={{ color: 'var(--primary-600)' }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
            {t('landing.cta.title')}
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
            {t('landing.cta.subtitle')}
          </p>
          <Link
            to="/register"
            className="btn-primary inline-flex items-center gap-2 text-base py-3 px-8"
          >
            {t('landing.cta.button')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer
        className="border-t py-10"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: 'var(--primary-600)' }}
              >
                <Heart size={14} className="text-white" />
              </span>
              <span className="font-serif font-bold" style={{ color: 'var(--text-main)' }}>
                Care<span style={{ color: 'var(--primary-600)' }}>Match</span>360
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              <a href="#" className="hover:text-[color:var(--primary-600)] transition">{t('landing.footer.privacy')}</a>
              <a href="#" className="hover:text-[color:var(--primary-600)] transition">{t('landing.footer.terms')}</a>
              <a href="#" className="hover:text-[color:var(--primary-600)] transition">{t('landing.footer.contact')}</a>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher compact />
              <ThemeSwitcher />
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-faint)' }}>
            {t('common.copyRight')} · {t('landing.footer.rights')}
          </p>
        </div>
      </footer>
    </div>
  );
}