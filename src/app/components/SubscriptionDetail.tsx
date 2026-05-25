import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, CreditCard, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import { getSubscriptionById, saveSubscription, Subscription } from '../services/dataService';
import { useSettings } from '../context/SettingsContext';

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

export default function SubscriptionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { settings, formatCurrency, t } = useSettings();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const data = await getSubscriptionById(id);
        if (data) {
          setSubscription(data);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading subscription', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, navigate]);

  const monthlyAmount = subscription?.cycle === 'Mensual' ? subscription.amount : (subscription?.amount || 0) / 12;
  const annualAmount = subscription?.cycle === 'Anual' ? subscription.amount : (subscription?.amount || 0) * 12;

  return (
    <main className="min-h-screen bg-background text-foreground pb-12" style={{ fontFamily: 'var(--font-heading)' }}>
      {/* Header */}
      <header className="border-b-2 border-border bg-background px-4 py-6 md:px-8">
        <button
          onClick={() => navigate('/')}
          aria-label={settings.language === 'en' ? 'Back to subscriptions list' : 'Volver a la lista de suscripciones'}
          className="mb-4 flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t('back')}</span>
        </button>
        {isLoading || !subscription ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <h1 style={{ fontFamily: 'var(--font-heading)' }}>{subscription.name}</h1>
              <StatusBadge status={subscription.status} />
            </div>
            <p className="mt-2 text-sm text-foreground/70">{subscription.category}</p>
          </>
        )}
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 space-y-6">
        {isLoading || !subscription ? (
          <>
            <Skeleton className="h-48 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
            <Skeleton className="h-32 w-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
            <Skeleton className="h-48 w-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
          </>
        ) : (
          <>
        {/* Encabezado de la suscripción */}
        <section aria-labelledby="detalle-resumen-suscripcion">
          <h2 id="detalle-resumen-suscripcion" className="sr-only">
            {settings.language === 'en' ? 'Subscription summary' : 'Resumen de esta suscripción'}
          </h2>
          <div className="bg-accent-light border-[3px] border-border p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="mb-2 text-sm opacity-80">
              {settings.language === 'en' ? 'Subscription Amount' : 'Monto de la suscripción'}
            </p>
            <p className="mb-4 text-5xl" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(subscription.amount, subscription.currency)} / {subscription.cycle.toLowerCase()}
            </p>
            <p className="text-sm opacity-80" style={{ fontFamily: 'var(--font-mono)' }}>
              {subscription.cycle === 'Mensual'
                ? `${settings.language === 'en' ? 'Yearly equivalent' : 'Equivalente anual'}: ${formatCurrency(annualAmount, subscription.currency)}`
                : `${settings.language === 'en' ? 'Monthly equivalent' : 'Equivalente mensual'}: ${formatCurrency(monthlyAmount, subscription.currency)}`}
            </p>
          </div>
        </section>

        {/* Resumen de impacto */}
        <section aria-labelledby="impacto-heading">
          <h2 id="impacto-heading" className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {settings.language === 'en' ? 'Impact Summary' : 'Resumen de impacto'}
          </h2>
          <div className="bg-secondary border-2 border-border p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <dl className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border/20">
                <dt>{t('monthlyCommitmentSub')}</dt>
                <dd className="font-mono" style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(monthlyAmount, subscription.currency)}
                </dd>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border/20">
                <dt>{settings.language === 'en' ? 'Committed per year' : 'Comprometido por año'}</dt>
                <dd className="font-mono" style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(annualAmount, subscription.currency)}
                </dd>
              </div>
              <div>
                <dt className="mb-2">{settings.language === 'en' ? 'Per person breakdown' : 'Por persona'}</dt>
                <dd className="text-sm text-foreground/70">
                  {settings.language === 'en' ? 'This subscription is shared with' : 'Esta suscripción está marcada para'}: {subscription.sharedWith.join(' + ')}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Detalles de facturación */}
        <section aria-labelledby="facturacion-heading">
          <h2 id="facturacion-heading" className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {settings.language === 'en' ? 'Billing Details' : 'Detalles de facturación'}
          </h2>
          <div className="bg-card border-2 border-border p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <dl className="space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-border/10">
                <dt className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-foreground/60" />
                  {settings.language === 'en' ? 'Billing Cycle' : 'Ciclo de cobro'}
                </dt>
                <dd>{subscription.cycle}</dd>
              </div>
              <div className="flex justify-between items-start pb-3 border-b border-border/10">
                <dt className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-foreground/60" />
                  {settings.language === 'en' ? 'Next Charge' : 'Próximo cobro'}
                </dt>
                <dd style={{ fontFamily: 'var(--font-mono)' }}>{subscription.nextChargeDate}</dd>
              </div>
              <div className="flex justify-between items-start pb-3 border-b border-border/10">
                <dt className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-foreground/60" />
                  {settings.language === 'en' ? 'Signup Date' : 'Fecha de alta'}
                </dt>
                <dd style={{ fontFamily: 'var(--font-mono)' }}>{subscription.signupDate}</dd>
              </div>
              <div className="flex justify-between items-start pb-3 border-b border-border/10">
                <dt className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-foreground/60" />
                  {t('paymentMethods')}
                </dt>
                <dd style={{ fontFamily: 'var(--font-mono)' }}>{subscription.paymentMethodName}</dd>
              </div>
              <div className="flex justify-between items-start">
                <dt>{settings.language === 'en' ? 'Is trial period' : 'Es trial'}</dt>
                <dd>
                  {subscription.isTrial 
                    ? (settings.language === 'en' 
                      ? `Yes (ends on ${subscription.trialEndDate})` 
                      : `Sí (termina el ${subscription.trialEndDate})`) 
                    : 'No'}
                </dd>
              </div>
            </dl>
            {subscription.notes && (
              <div className="mt-6 pt-4 border-t-2 border-border/10">
                <p className="text-sm">
                  <strong>{settings.language === 'en' ? 'Notes' : 'Notas'}:</strong> {subscription.notes}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Participantes / con quién se comparte */}
        <section aria-labelledby="participantes-heading">
          <h2 id="participantes-heading" className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {settings.language === 'en' ? 'Participants' : 'Participantes'}
          </h2>
          <div className="bg-card border-2 border-border p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-foreground/60" />
              <p className="text-sm text-foreground/70">
                {settings.language === 'en' 
                  ? 'We use this to break down your totals by participant.' 
                  : 'Usamos esto para desglosar tus totales por persona'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {subscription.sharedWith.map((person) => (
                <span
                  key={person}
                  className="px-4 py-2 bg-secondary border-2 border-border text-sm"
                >
                  {person}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Historial de cambios de precio */}
        <section aria-labelledby="historial-precio-heading">
          <h2 id="historial-precio-heading" className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {settings.language === 'en' ? 'Price History' : 'Historial de precio'}
          </h2>
          <div className="bg-card border-2 border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            {subscription.priceHistory.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-foreground text-background">
                    <th className="px-4 py-3 text-left border-r-2 border-background">{settings.language === 'en' ? 'Since' : 'Desde'}</th>
                    <th className="px-4 py-3 text-left border-r-2 border-background">{settings.language === 'en' ? 'Amount' : 'Monto'}</th>
                    <th className="px-4 py-3 text-left">{settings.language === 'en' ? 'Currency' : 'Moneda'}</th>
                  </tr>
                </thead>
                <tbody>
                  {subscription.priceHistory.map((entry, index) => (
                    <tr
                      key={index}
                      className={`border-t-2 border-border ${
                        index % 2 === 0 ? 'bg-card' : 'bg-secondary'
                      }`}
                    >
                      <td className="px-4 py-3 border-r-2 border-border/10" style={{ fontFamily: 'var(--font-mono)' }}>
                        {new Date(entry.date).toLocaleDateString(settings.language === 'en' ? 'en-US' : 'es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 border-r-2 border-border/10" style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(entry.amount, entry.currency)}
                      </td>
                      <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)' }}>
                        {entry.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-center text-foreground/60">
                {settings.language === 'en' ? 'You haven\'t changed the price of this subscription yet' : 'Aún no has cambiado el precio de esta suscripción'}
              </p>
            )}
          </div>
        </section>

        {/* Zona de acciones */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between pt-4">
          <button
            onClick={() => navigate(`/subscription/${id}/edit`)}
            className="bg-primary text-primary-foreground px-8 py-4 border-[3px] border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer font-bold"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {settings.language === 'en' ? 'Edit subscription' : 'Editar suscripción'}
          </button>

          <button
            onClick={async () => {
              if (confirm(settings.language === 'en' ? 'Are you sure you want to mark this subscription as cancelled?' : '¿Estás seguro de que quieres marcar esta suscripción como cancelada?')) {
                if (!subscription) return;
                setIsCancelling(true);
                try {
                  await saveSubscription({ ...subscription, status: 'CANCELADA' });
                  navigate('/');
                } catch (error) {
                  console.error('Error cancelling subscription', error);
                  setIsCancelling(false);
                }
              }
            }}
            disabled={isCancelling}
            className="bg-card text-destructive border-2 border-border hover:bg-destructive/10 transition-colors cursor-pointer font-bold disabled:opacity-50"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {isCancelling 
              ? (settings.language === 'en' ? 'Cancelling...' : 'Cancelando...') 
              : (settings.language === 'en' ? 'Mark as cancelled' : 'Marcar como cancelada')
            }
          </button>
        </div>
          </>
        )}
      </div>
    </main>
  );
}
