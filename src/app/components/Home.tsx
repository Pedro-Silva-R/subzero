import { useState, useEffect } from 'react';
import { Plus, AlertCircle, Zap, CreditCard, MoreVertical, Wallet, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';

import { getSummaryData, getSubscriptions, Subscription } from '../services/dataService';
import { useSettings } from '../context/SettingsContext';

interface DashboardData {
  monthlyCommitment: number;
  yearlyEquivalent: number;
  breakdown: { yo: number; pareja: number; familia: number };
  alerts: { trials: number; zombies: number; activeCards: number };
  upcomingCharges: {
    id: number | string;
    date: string;
    name: string;
    amount: number;
    paymentMethod: string;
    sharedWith: string;
  }[];
  subscriptions: Subscription[];
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-muted border-2 border-border animate-pulse ${className}`} />
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    ACTIVA: 'bg-[#1E8E4D] text-white dark:bg-emerald-600 dark:text-white',
    TRIAL: 'bg-[#FCD34D] text-black dark:bg-yellow-400 dark:text-black',
    ZOMBIE: 'bg-[#D7263D] text-white dark:bg-rose-600 dark:text-white',
    PAUSADA: 'bg-gray-400 text-white dark:bg-zinc-600 dark:text-white',
  };

  return (
    <span
      className={`px-3 py-1 border-2 border-border font-mono text-xs tracking-wider ${
        styles[status as keyof typeof styles] || styles.ACTIVA
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { formatCurrency, t, settings } = useSettings();
  const [mockData, setMockData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [subs, summary] = await Promise.all([
          getSubscriptions(),
          getSummaryData()
        ]);
        setMockData({
          ...summary,
          subscriptions: subs,
        });
      } catch (error) {
        console.error('Error loading data', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const currentDate = new Date();
  const monthYear = currentDate.toLocaleDateString(settings.language === 'en' ? 'en-US' : 'es-ES', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 font-sans" style={{ fontFamily: 'var(--font-heading)' }}>
      {/* Header */}
      <header className="border-b-2 border-border bg-background px-4 py-6 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              SubZero
            </h1>
            <p className="text-sm text-foreground/70">
              {settings.language === 'en' ? 'Summary of' : 'Resumen de'} {monthYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/payment-methods')}
              className="flex items-center gap-2 bg-card px-4 py-2 border-2 border-border hover:bg-secondary transition-colors text-sm cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">{t('paymentMethods')}</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              aria-label={t('settings')}
              className="flex items-center gap-2 bg-card p-2 border-2 border-border hover:bg-secondary transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 md:px-8">
        {isLoading || !mockData ? (
          <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <Skeleton className="h-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
              <Skeleton className="h-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
              <Skeleton className="h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
              <Skeleton className="h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
              <Skeleton className="h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
              <Skeleton className="h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Grid Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Commitment Summary */}
          <section aria-labelledby="resumen-heading" className="lg:col-span-1">
            <h2 id="resumen-heading" className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('monthlyCommitment')}
            </h2>
            <div
              className="bg-accent-light border-[3px] border-border p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <p className="mb-2 text-sm opacity-80">{t('monthlyCommitmentSub')}</p>
              <p
                className="mb-6 text-4xl md:text-5xl"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {formatCurrency(mockData.monthlyCommitment)}
              </p>
              <p className="mb-4 text-sm opacity-80" style={{ fontFamily: 'var(--font-mono)' }}>
                {t('yearlyEquivalent')}: {formatCurrency(mockData.yearlyEquivalent)}
              </p>
              <div className="flex flex-wrap gap-3">
                <span
                  className="rounded border-2 border-border bg-card px-3 py-1 text-sm"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {t('breakdownYo')}: {formatCurrency(mockData.breakdown.yo)}
                </span>
                <span
                  className="rounded border-2 border-border bg-card px-3 py-1 text-sm"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {t('breakdownPareja')}: {formatCurrency(mockData.breakdown.pareja)}
                </span>
                <span
                  className="rounded border-2 border-border bg-card px-3 py-1 text-sm"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {t('breakdownFamilia')}: {formatCurrency(mockData.breakdown.familia)}
                </span>
              </div>
            </div>
          </section>

          {/* Upcoming Charges */}
          <section aria-labelledby="proximos-heading" className="lg:col-span-1">
            <h2 id="proximos-heading" className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('upcomingCharges')}
            </h2>
            <div className="border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ul className="divide-y-2 divide-border">
                {mockData.upcomingCharges.map((charge) => (
                  <li key={charge.id} className="p-4 hover:bg-background transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                          {charge.name}
                        </p>
                        <p className="text-xs text-foreground/60">
                          {charge.paymentMethod} · {charge.sharedWith}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="mb-1 text-lg"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {formatCurrency(charge.amount)}
                        </p>
                        <p
                          className="text-xs text-foreground/60"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {charge.date}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Alerts and Zombies */}
        <section aria-labelledby="alertas-heading" className="mt-6 lg:mt-8">
          <h2 id="alertas-heading" className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('alerts')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#FCD34D]" />
                <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('alertTrials')}
                </span>
              </div>
              <p className="text-3xl" style={{ fontFamily: 'var(--font-mono)' }}>
                {mockData.alerts.trials}
              </p>
            </div>

            <div className="border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#D7263D]" />
                <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('alertZombies')}
                </span>
              </div>
              <p className="text-3xl" style={{ fontFamily: 'var(--font-mono)' }}>
                {mockData.alerts.zombies}
              </p>
            </div>

            <div
              onClick={() => navigate('/payment-methods')}
              className="border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer"
            >
              <div className="mb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-foreground" />
                <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('alertCards')}
                </span>
              </div>
              <p className="text-3xl" style={{ fontFamily: 'var(--font-mono)' }}>
                {mockData.alerts.activeCards}
              </p>
            </div>
          </div>
        </section>

        {/* Main Subscriptions List */}
        <section aria-labelledby="suscripciones-heading" className="mt-6 lg:mt-8">
          <h2 id="suscripciones-heading" className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('subscriptions')}
          </h2>
          <ul className="space-y-3">
            {mockData.subscriptions.map((sub, index) => (
              <li
                key={sub.id}
                onClick={() => navigate(`/subscription/${sub.id}`)}
                className={`border-2 border-border p-4 md:p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer ${
                  index % 2 === 0 ? 'bg-card' : 'bg-secondary'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left Column: Name and Category */}
                  <div className="flex-1">
                    <h3 className="mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                      {sub.name}
                    </h3>
                    <p className="text-sm text-foreground/60">
                      {sub.category} · {sub.sharedWith ? sub.sharedWith.join(' + ') : 'Yo'}
                    </p>
                  </div>

                  {/* Center Column: Amount and Payment */}
                  <div className="flex-1 sm:text-center">
                    <p className="mb-1 text-lg md:text-xl" style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(sub.amount, sub.currency)} / {sub.cycle}
                    </p>
                    <p className="text-xs text-foreground/60" style={{ fontFamily: 'var(--font-mono)' }}>
                      {sub.paymentMethodName}
                    </p>
                  </div>

                  {/* Right Column: Next Charge and Status */}
                  <div className="flex items-center justify-between gap-4 sm:flex-1 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="mb-2 text-sm text-foreground/60" style={{ fontFamily: 'var(--font-mono)' }}>
                        {sub.nextChargeDate}
                      </p>
                      <StatusBadge status={sub.status} />
                    </div>
                    <button
                      aria-label={`Opciones de suscripción ${sub.name}`}
                      className="p-2 hover:bg-foreground/10 rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
          </>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => navigate('/subscription/new')}
        className="fixed bottom-6 right-6 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 border-[3px] border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">{t('addSubscription')}</span>
      </button>
    </main>
  );
}
