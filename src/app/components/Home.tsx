import { useState, useEffect } from 'react';
import { Plus, AlertCircle, Zap, CreditCard, MoreVertical, Wallet, Settings, Check, X, ArrowUp, PieChart, CalendarDays, Bell, List } from 'lucide-react';
import { useNavigate } from 'react-router';

import { getSummaryData, getSubscriptions, Subscription, markSubscriptionAsPaid, toggleHistoryMonth } from '../services/dataService';
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
    paymentHistory?: string[];
    cycle?: string;
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

// Helpers para el historial de pagos
const getChargeStatus = (dateStr: string) => {
  if (!dateStr) return { diffDays: 999, statusClass: 'bg-card border-border' };
  const chargeDate = new Date(dateStr + 'T12:00:00Z');
  const now = new Date();
  
  const cDate = new Date(chargeDate.getFullYear(), chargeDate.getMonth(), chargeDate.getDate());
  const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = cDate.getTime() - nDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { diffDays, statusClass: 'bg-red-500/10 border-red-500' };
  if (diffDays <= 3) return { diffDays, statusClass: 'bg-orange-500/10 border-orange-500' };
  return { diffDays, statusClass: 'bg-card border-border' };
};

const getLast5Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
};

export default function Home() {
  const navigate = useNavigate();
  const { formatCurrency, t, settings } = useSettings();
  const [mockData, setMockData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleMarkAsPaid = async (chargeId: string, currentNextChargeDate: string, cycle: string, currentHistory: string[]) => {
    const chargeDate = new Date(currentNextChargeDate + 'T12:00:00Z');
    const monthStr = `${chargeDate.getFullYear()}-${String(chargeDate.getMonth() + 1).padStart(2, '0')}`;
    try {
      const { newNextChargeDate, newHistory } = await markSubscriptionAsPaid(chargeId, monthStr, currentNextChargeDate, cycle, currentHistory);
      setMockData(prev => {
        if (!prev) return prev;
        const newCharges = prev.upcomingCharges.map(c => {
          if (c.id === chargeId) {
            return { ...c, date: newNextChargeDate, paymentHistory: newHistory };
          }
          return c;
        }).sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        return { ...prev, upcomingCharges: newCharges };
      });
    } catch (e) {
      console.error('Error marking as paid', e);
    }
  };

  const handleToggleHistory = async (chargeId: string, monthStr: string, currentHistory: string[]) => {
    try {
      const { newHistory } = await toggleHistoryMonth(chargeId, monthStr, currentHistory);
      setMockData(prev => {
        if (!prev) return prev;
        const newCharges = prev.upcomingCharges.map(c => {
          if (c.id === chargeId) {
            return { ...c, paymentHistory: newHistory };
          }
          return c;
        });
        return { ...prev, upcomingCharges: newCharges };
      });
    } catch(e) {
      console.error('Error toggling history', e);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 120; // 120px offset for the sticky header
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 font-sans relative" style={{ fontFamily: 'var(--font-heading)' }}>
      {/* Sticky Header */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b-2 border-border shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 ${
          showSticky && mockData ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="px-4 py-2 md:px-8 max-w-7xl mx-auto flex flex-col gap-2">
          {/* Top Row: Totals */}
          <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-xs opacity-80 mb-0.5">{t('monthlyCommitment')}</p>
              <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                {mockData ? formatCurrency(mockData.monthlyCommitment) : ''}
              </p>
            </div>
            <div className="hidden sm:flex gap-3 items-center">
              <span className="text-sm opacity-80" style={{ fontFamily: 'var(--font-mono)' }}>
                {t('breakdownYo')}: {mockData ? formatCurrency(mockData.breakdown.yo) : ''}
              </span>
            </div>
          </div>
          
          {/* Bottom Row: Navigation */}
          <nav className="flex justify-between items-center w-full border-t-2 border-border/20 pt-2 pb-1">
            <button onClick={() => scrollToSection('resumen-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
              <PieChart className="h-4 w-4" />
              <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>RESUMEN</span>
            </button>
            <button onClick={() => scrollToSection('proximos-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
              <CalendarDays className="h-4 w-4" />
              <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>PRÓXIMOS</span>
            </button>
            <button onClick={() => scrollToSection('alertas-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
              <Bell className="h-4 w-4" />
              <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>ALERTAS</span>
            </button>
            <button onClick={() => scrollToSection('suscripciones-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
              <List className="h-4 w-4" />
              <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>TODAS</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className="border-b-2 border-border bg-background px-4 py-6 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              SubZero
            </h1>
            <p className="text-sm text-foreground/70">
              {settings.language === 'en' ? 'Summary of' : 'Resumen de'} {monthYear}
            </p>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
            <button onClick={() => scrollToSection('resumen-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
              <PieChart className="h-5 w-5" />
              <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>RESUMEN</span>
            </button>
            <button onClick={() => scrollToSection('proximos-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
              <CalendarDays className="h-5 w-5" />
              <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>PRÓXIMOS</span>
            </button>
            <button onClick={() => scrollToSection('alertas-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
              <Bell className="h-5 w-5" />
              <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>ALERTAS</span>
            </button>
            <button onClick={() => scrollToSection('suscripciones-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
              <List className="h-5 w-5" />
              <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>TODAS</span>
            </button>
          </nav>

          <div className="flex items-center justify-end gap-2 flex-1">
            <button
              onClick={() => navigate('/payment-methods')}
              className="flex items-center gap-2 bg-card px-4 py-2 border-2 border-border hover:bg-secondary transition-colors text-sm cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden lg:inline">{t('paymentMethods')}</span>
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

        {/* Mobile Navigation */}
        <nav className="flex md:hidden justify-between items-center w-full max-w-lg mx-auto mt-6 pt-4 border-t-2 border-border/20">
          <button onClick={() => scrollToSection('resumen-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
            <PieChart className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>RESUMEN</span>
          </button>
          <button onClick={() => scrollToSection('proximos-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
            <CalendarDays className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>PRÓXIMOS</span>
          </button>
          <button onClick={() => scrollToSection('alertas-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
            <Bell className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>ALERTAS</span>
          </button>
          <button onClick={() => scrollToSection('suscripciones-heading')} className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity active:scale-95">
            <List className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-1 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>TODAS</span>
          </button>
        </nav>
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
                {mockData.upcomingCharges.map((charge) => {
                  const { statusClass } = getChargeStatus(charge.date);
                  const historyMonths = getLast5Months();
                  const pHistory = charge.paymentHistory || [];

                  return (
                    <li key={charge.id} className={`p-4 transition-colors border-l-4 ${statusClass}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="mb-1 text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                            {charge.name}
                          </p>
                          <p className="text-sm text-foreground/60 mb-2">
                            {charge.paymentMethod} · {charge.sharedWith}
                          </p>
                          {/* Mini Historial */}
                          <div className="flex items-center gap-1 mt-2">
                            {historyMonths.map((mStr, idx) => {
                              const isPaid = pHistory.includes(mStr);
                              return (
                                <button
                                  key={mStr}
                                  onClick={() => handleToggleHistory(String(charge.id), mStr, pHistory)}
                                  title={mStr}
                                  className={`flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs transition-colors hover:opacity-80 ${
                                    isPaid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                  }`}
                                >
                                  {isPaid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                </button>
                              );
                            })}
                            <span className="text-xs text-foreground/50 ml-2">Últimos 5 meses</span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex flex-col items-start sm:items-end justify-between">
                          <div>
                            <p
                              className="mb-1 text-xl font-bold"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {formatCurrency(charge.amount)}
                            </p>
                            <p
                              className="text-sm font-semibold"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {charge.date}
                            </p>
                          </div>
                          <button
                            onClick={() => handleMarkAsPaid(String(charge.id), charge.date, charge.cycle || 'Mensual', pHistory)}
                            className="mt-3 flex w-full items-center justify-center gap-2 bg-transparent text-foreground px-4 py-2 text-sm font-bold border-2 border-border hover:bg-secondary transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none sm:w-auto"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            <Check className="h-4 w-4" />
                            Registrar pago
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
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

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed right-6 flex h-14 w-14 items-center justify-center bg-card text-foreground border-[3px] border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-secondary hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer z-40 ${
          showSticky ? 'bottom-[100px] opacity-100' : 'bottom-6 opacity-0 pointer-events-none'
        }`}
        aria-label="Volver arriba"
      >
        <ArrowUp className="h-6 w-6" />
      </button>

      {/* Floating Add Button */}
      <button
        onClick={() => navigate('/subscription/new')}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 border-[3px] border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">{t('addSubscription')}</span>
      </button>
    </main>
  );
}
