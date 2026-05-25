import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { getSubscriptionById, saveSubscription, getPaymentMethods, PaymentMethod } from '../services/dataService';
import { useSettings } from '../context/SettingsContext';

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-muted border-2 border-border animate-pulse ${className}`} />
  );
}

export default function AddEditSubscription() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id !== undefined;
  const { settings, formatCurrency, t } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Streaming',
    sharedWith: {
      yo: true,
      pareja: false,
      familia: false,
      otros: false,
    },
    amount: '',
    currency: settings.currency, // Usar la moneda por defecto de la configuración
    cycle: 'Mensual',
    nextChargeDate: '',
    isTrial: false,
    trialEndDate: '',
    paymentMethodId: '',
    customPaymentMethod: '',
    paymentNotes: '',
    status: 'ACTIVA',
    notes: '',
  });

  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const methods = await getPaymentMethods();
        const activeMethods = methods.filter(m => m.isActive);
        setAvailableMethods(activeMethods);

        if (!isEdit || !id) {
          if (activeMethods.length > 0) {
            setFormData(prev => ({ ...prev, paymentMethodId: activeMethods[0].id }));
          }
          setIsLoading(false);
          return;
        }

        const data = await getSubscriptionById(id);
        if (data) {
          setFormData({
            name: data.name,
            category: data.category,
            sharedWith: {
              yo: data.sharedWith.includes('Yo'),
              pareja: data.sharedWith.includes('Pareja'),
              familia: data.sharedWith.includes('Familia'),
              otros: data.sharedWith.includes('Otros'),
            },
            amount: data.amount.toString(),
            currency: data.currency as 'CLP' | 'USD' | 'EUR',
            cycle: data.cycle,
            nextChargeDate: data.nextChargeDate,
            isTrial: data.isTrial,
            trialEndDate: data.trialEndDate || '',
            paymentMethodId: data.paymentMethodId || '',
            customPaymentMethod: '',
            paymentNotes: data.paymentNotes || '',
            status: data.status,
            notes: data.notes || '',
          });
        }
      } catch (error) {
        console.error('Error loading data', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, isEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Este campo es obligatorio';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor que cero';
    }
    if (!formData.nextChargeDate) {
      newErrors.nextChargeDate = 'Este campo es obligatorio';
    }
    if (formData.isTrial && !formData.trialEndDate) {
      newErrors.trialEndDate = 'Este campo es obligatorio';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSaving(true);
      try {
        const sharedWithArr = Object.entries(formData.sharedWith)
          .filter(([_, checked]) => checked)
          .map(([person]) => person.charAt(0).toUpperCase() + person.slice(1));

        await saveSubscription({
          id: isEdit ? id : `temp-${Date.now()}`,
          name: formData.name,
          category: formData.category,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          cycle: formData.cycle,
          status: formData.status,
          nextChargeDate: formData.nextChargeDate,
          paymentMethodId: formData.paymentMethodId || null,
          isTrial: formData.isTrial,
          trialEndDate: formData.trialEndDate || null,
          sharedWith: sharedWithArr,
          paymentNotes: formData.paymentNotes,
          notes: formData.notes,
        });
        navigate('/');
      } catch (error) {
        console.error('Error saving subscription', error);
        setIsSaving(false);
      }
    }
  };

  const calculateEquivalent = () => {
    const amount = parseFloat(formData.amount) || 0;
    if (formData.cycle === 'Mensual') {
      return `${settings.language === 'en' ? 'Yearly equivalent' : 'Equivalente anual'}: ${formatCurrency(amount * 12, formData.currency)}`;
    } else if (formData.cycle === 'Anual') {
      return `${settings.language === 'en' ? 'Monthly equivalent' : 'Equivalente mensual'}: ${formatCurrency(amount / 12, formData.currency)}`;
    }
    return '';
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-12" style={{ fontFamily: 'var(--font-heading)' }}>
      {/* Header */}
      <header className="border-b-2 border-border bg-background px-4 py-6 md:px-8">
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t('back')}</span>
        </button>
        <h1 className="mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {isEdit 
            ? (settings.language === 'en' ? 'Edit subscription' : 'Editar suscripción') 
            : (settings.language === 'en' ? 'Add subscription' : 'Agregar suscripción')
          }
        </h1>
        <p className="text-sm text-foreground/70">
          {settings.language === 'en' 
            ? 'We use this data to calculate your monthly and yearly expenses.' 
            : 'Usamos estos datos para calcular tu gasto mensual y anual.'
          }
        </p>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-[400px] w-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
            <Skeleton className="h-[300px] w-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Grupo A – Identidad de la suscripción */}
          <section className="border-2 border-border bg-card p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-6 pb-3 border-b-2 border-border">
              {settings.language === 'en' ? 'Subscription Identity' : 'Identidad de la suscripción'}
            </h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block">
                  {settings.language === 'en' ? 'Subscription Name' : 'Nombre de la suscripción'} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Netflix, Gimnasio, Dominio web…"
                  className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="category" className="mb-2 block">
                  {settings.language === 'en' ? 'Category' : 'Categoría'}
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Streaming</option>
                  <option>Software</option>
                  <option>Juegos</option>
                  <option>Membresía</option>
                  <option>Servicios</option>
                  <option>Otros</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block">
                  {settings.language === 'en' ? 'Who you share it with' : 'Con quién la compartes'}
                </label>
                <div className="space-y-2">
                  {(['yo', 'pareja', 'familia', 'otros'] as const).map((person) => (
                    <label key={person} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sharedWith[person]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sharedWith: { ...formData.sharedWith, [person]: e.target.checked },
                          })
                        }
                        className="h-5 w-5 border-2 border-border bg-card accent-primary"
                      />
                      <span className="capitalize">{person}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Grupo B – Montos y ciclo */}
          <section className="border-2 border-border bg-card p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-6 pb-3 border-b-2 border-border">
              {settings.language === 'en' ? 'Amounts & billing cycle' : 'Montos y ciclo'}
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="amount" className="mb-2 block">
                    {settings.language === 'en' ? 'Amount' : 'Monto'} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="12990"
                    className="w-full border-2 border-border bg-card text-foreground px-4 py-3 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.amount && <p className="mt-1 text-sm text-destructive">{errors.amount}</p>}
                </div>

                <div>
                  <label htmlFor="currency" className="mb-2 block">
                    {settings.language === 'en' ? 'Currency' : 'Moneda'}
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'CLP' | 'USD' | 'EUR' })}
                    className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>CLP</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="cycle" className="mb-2 block">
                  {settings.language === 'en' ? 'Billing cycle' : 'Ciclo'}
                </label>
                <select
                  id="cycle"
                  value={formData.cycle}
                  onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                  className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Mensual</option>
                  <option>Anual</option>
                  <option>Otro</option>
                </select>
              </div>

              {formData.amount && formData.cycle !== 'Otro' && (
                <p className="font-mono text-sm text-foreground/70">{calculateEquivalent()}</p>
              )}
            </div>
          </section>

          {/* Grupo C – Fechas y trial */}
          <section className="border-2 border-border bg-card p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-6 pb-3 border-b-2 border-border">
              {settings.language === 'en' ? 'Dates & trial settings' : 'Fechas y trial'}
            </h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="nextChargeDate" className="mb-2 block">
                  {settings.language === 'en' ? 'Next Charge Date' : 'Fecha del próximo cobro'} <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  id="nextChargeDate"
                  value={formData.nextChargeDate}
                  onChange={(e) => setFormData({ ...formData, nextChargeDate: e.target.value })}
                  className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.nextChargeDate && (
                  <p className="mt-1 text-sm text-destructive">{errors.nextChargeDate}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTrial}
                    onChange={(e) => setFormData({ ...formData, isTrial: e.target.checked })}
                    className="h-5 w-5 border-2 border-border bg-card accent-primary"
                  />
                  <span>{settings.language === 'en' ? 'This is a free trial period' : 'Es un periodo de prueba'}</span>
                </label>
              </div>

              {formData.isTrial && (
                <div className="border-l-4 border-[#FCD34D] pl-4 space-y-4">
                  <div>
                    <label htmlFor="trialEndDate" className="mb-2 block">
                      {settings.language === 'en' ? 'Trial End Date' : 'Fecha de fin de trial'} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="date"
                      id="trialEndDate"
                      value={formData.trialEndDate}
                      onChange={(e) => setFormData({ ...formData, trialEndDate: e.target.value })}
                      className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.trialEndDate && (
                      <p className="mt-1 text-sm text-destructive">{errors.trialEndDate}</p>
                    )}
                  </div>
                  <p className="text-sm text-foreground/70">
                    {settings.language === 'en' ? 'We will remind you before charges apply.' : 'Te avisaremos antes de que empiece a cobrar.'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Grupo D – Método de pago */}
          <section className="border-2 border-border bg-card p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-6 pb-3 border-b-2 border-border">
              {t('paymentMethods')}
            </h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="paymentMethod" className="mb-2 block">
                  {t('paymentMethods')}
                </label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethodId}
                  onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
                  className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>{settings.language === 'en' ? 'Select a payment method...' : 'Selecciona un método...'}</option>
                  {availableMethods.map(method => (
                    <option key={method.id} value={method.id}>{method.name}</option>
                  ))}
                  <option value="otro">{settings.language === 'en' ? 'Other...' : 'Otro...'}</option>
                </select>
              </div>

              {formData.paymentMethodId === 'otro' && (
                <div>
                  <label htmlFor="customPaymentMethod" className="mb-2 block">
                    {settings.language === 'en' ? 'Specify Method' : 'Especificar método'}
                  </label>
                  <input
                    type="text"
                    id="customPaymentMethod"
                    value={formData.customPaymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, customPaymentMethod: e.target.value })
                    }
                    placeholder="Ej: PayPal, Cuenta bancaria..."
                    className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div>
                <label htmlFor="paymentNotes" className="mb-2 block">
                  {settings.language === 'en' ? 'Payment notes (optional)' : 'Notas de pago (opcional)'}
                </label>
                <input
                  type="text"
                  id="paymentNotes"
                  value={formData.paymentNotes}
                  onChange={(e) => setFormData({ ...formData, paymentNotes: e.target.value })}
                  placeholder="Promoción 12 meses, Tarifa estudiante..."
                  className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          {/* Grupo E – Estado y notas */}
          <section className="border-2 border-border bg-card p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-6 pb-3 border-b-2 border-border">
              {settings.language === 'en' ? 'Status & Notes' : 'Estado y notas'}
            </h2>

            <div className="space-y-5">
              {isEdit && (
                <div>
                  <label htmlFor="status" className="mb-2 block">
                    {settings.language === 'en' ? 'Subscription Status' : 'Estado de la suscripción'}
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ACTIVA">Activa</option>
                    <option value="PAUSADA">Pausada</option>
                    <option value="CANCELADA">Cancelada</option>
                    <option value="ZOMBIE">Zombie</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="notes" className="mb-2 block">
                  {settings.language === 'en' ? 'Notes' : 'Notas'}
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Comentarios adicionales..."
                  className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-primary-foreground px-8 py-4 border-[3px] border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer font-bold"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {isSaving 
                  ? 'Saving...' 
                  : (isEdit 
                      ? (settings.language === 'en' ? 'Save changes' : 'Guardar cambios') 
                      : (settings.language === 'en' ? 'Save subscription' : 'Guardar suscripción')
                    )
                }
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-card text-foreground px-8 py-4 border-2 border-border hover:bg-background transition-colors cursor-pointer font-bold"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {isEdit 
                  ? (settings.language === 'en' ? 'Discard' : 'Descartar') 
                  : t('cancel')
                }
              </button>
            </div>

            {isEdit && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(settings.language === 'en' ? 'Are you sure you want to mark this subscription as cancelled?' : '¿Estás seguro de que quieres marcar esta suscripción como cancelada?')) {
                    navigate('/');
                  }
                }}
                className="bg-[#D7263D] text-white px-6 py-4 border-2 border-border hover:bg-[#B01F32] dark:bg-rose-600 dark:hover:bg-rose-700 transition-colors cursor-pointer font-bold"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {settings.language === 'en' ? 'Mark as cancelled' : 'Marcar como cancelada'}
              </button>
            )}
          </div>
        </form>
        )}
      </div>
    </main>
  );
}
