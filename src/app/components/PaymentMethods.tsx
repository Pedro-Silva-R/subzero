import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Plus, Edit2, Power, Trash2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { PaymentMethod, getPaymentMethods, savePaymentMethod, deletePaymentMethod, togglePaymentMethodActive } from '../services/dataService';
import { useSettings } from '../context/SettingsContext';

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-muted border-2 border-border animate-pulse ${className}`} />
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  method?: PaymentMethod | null;
  onSave: (method: Partial<PaymentMethod>) => Promise<void> | void; // Listo para async/await de Supabase
}

function PaymentMethodModal({ isOpen, onClose, method, onSave }: ModalProps) {
  const { settings, t } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Tarjeta' as PaymentMethod['type'],
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Este useEffect "hidrata" el formulario cada vez que se abre el modal con un método nuevo
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: method?.name || '',
        type: method?.type || 'Tarjeta',
        notes: method?.notes || '',
      });
      setIsSaving(false);
    }
  }, [isOpen, method]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData); // Preparado para esperar a Supabase
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="bg-background border-[3px] border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b-2 border-border p-6 z-10">
          <h2 className="mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {method 
              ? (settings.language === 'en' ? 'Edit payment method' : 'Editar método de pago') 
              : (settings.language === 'en' ? 'Add payment method' : 'Agregar método de pago')
            }
          </h2>
          <p className="text-sm text-foreground/70">
            {settings.language === 'en' 
              ? 'Provide a unique name to identify this payment method.' 
              : 'Proporciona un nombre distintivo para identificar este método.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="method-name" className="mb-2 block">
              {settings.language === 'en' ? 'Method Name' : 'Nombre del método'} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="method-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={settings.language === 'en' ? 'e.g. VISA ****1234' : 'Ej: VISA ****1234, Cuenta vista Banco X'}
              required
              className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-foreground/60">
              {settings.language === 'en' 
                ? 'It is not necessary to write the full card number, just something to recognize it.' 
                : 'No es necesario poner el número completo, solo algo que te ayude a identificarlo.'
              }
            </p>
          </div>

          <div>
            <label htmlFor="method-type" className="mb-2 block">
              {settings.language === 'en' ? 'Method Type' : 'Tipo de método'}
            </label>
            <select
              id="method-type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as PaymentMethod['type'] })
              }
              className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Tarjeta">{settings.language === 'en' ? 'Card' : 'Tarjeta'}</option>
              <option value="Cuenta bancaria">{settings.language === 'en' ? 'Bank account' : 'Cuenta bancaria'}</option>
              <option value="Otro">{settings.language === 'en' ? 'Other' : 'Otro'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="method-notes" className="mb-2 block">
              {settings.language === 'en' ? 'Notes (optional)' : 'Notas (opcional)'}
            </label>
            <textarea
              id="method-notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={settings.language === 'en' ? 'Additional info about this method...' : 'Información adicional sobre este método...'}
              className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary text-primary-foreground px-6 py-3 border-[3px] border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isSaving 
                ? (settings.language === 'en' ? 'Saving...' : 'Guardando...') 
                : (method 
                    ? (settings.language === 'en' ? 'Save changes' : 'Guardar cambios') 
                    : (settings.language === 'en' ? 'Add method' : 'Agregar método')
                  )
              }
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-card text-foreground px-6 py-3 border-2 border-border hover:bg-background transition-colors cursor-pointer font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentMethods() {
  const navigate = useNavigate();
  const { settings, formatCurrency, t } = useSettings();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const loadedMethods = await getPaymentMethods();
        setMethods(loadedMethods);
      } catch (error) {
        console.error('Error loading payment methods', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'warning' | 'confirm';
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'warning',
    message: '',
  });

  const activeMethods = methods.filter((m) => m.isActive).length;
  const totalSubscriptions = methods.reduce((acc, m) => acc + m.subscriptionsCount, 0);
  const totalMonthly = methods.reduce((acc, m) => acc + m.monthlyTotal, 0);

  const handleAddMethod = () => {
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const handleSaveMethod = async (data: Partial<PaymentMethod>) => {
    await savePaymentMethod(data);

    if (editingMethod) {
      setMethods(
        methods.map((m) => (m.id === editingMethod.id ? { ...m, ...data } : m))
      );
    } else {
      const newMethod: PaymentMethod = {
        id: `temp-${Date.now()}`, // Usamos un string temporal (simulando un UUID de Supabase)
        name: data.name || '',
        type: data.type || 'Tarjeta',
        subscriptionsCount: 0,
        monthlyTotal: 0,
        isActive: true,
        notes: data.notes ?? '',
      };
      setMethods([...methods, newMethod]);
    }
  };

  const handleToggleActive = async (id: string) => {
    const method = methods.find((m) => m.id === id);
    if (method && method.isActive && method.subscriptionsCount > 0) {
      setAlertConfig({
        isOpen: true,
        type: 'warning',
        message: settings.language === 'en'
          ? `You cannot deactivate this method because it has ${method.subscriptionsCount} associated subscription(s). First change the payment method for those subscriptions.`
          : `No puedes desactivar este método porque tiene ${method.subscriptionsCount} suscripción(es) asociada(s). Primero cambia el método de pago de esas suscripciones.`,
      });
      return;
    }
    setMethods(methods.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)));
  };

  const handleDeleteMethod = async (method: PaymentMethod) => {
    if (method.subscriptionsCount > 0) {
      setAlertConfig({
        isOpen: true,
        type: 'warning',
        message: settings.language === 'en'
          ? `You cannot delete this method because it has ${method.subscriptionsCount} associated subscription(s). First change the payment method for those subscriptions.`
          : `No puedes eliminar este método porque tiene ${method.subscriptionsCount} suscripción(es) asociada(s). Primero cambia el método de pago de esas suscripciones.`,
      });
      return;
    }
    
    setAlertConfig({
      isOpen: true,
      type: 'confirm',
      message: settings.language === 'en'
        ? `Are you sure you want to delete the method "${method.name}"? This action cannot be undone.`
        : `¿Estás seguro de que quieres eliminar el método "${method.name}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setMethods(methods.filter((m) => m.id !== method.id));
        setAlertConfig({ ...alertConfig, isOpen: false });
      }
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-12" style={{ fontFamily: 'var(--font-heading)' }}>
      {/* Header */}
      <header className="border-b-2 border-border bg-background px-4 py-6 md:px-8">
        <button
          onClick={() => navigate('/')}
          aria-label={settings.language === 'en' ? 'Back' : 'Volver'}
          className="mb-4 flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t('back')}</span>
        </button>
        <h1 className="mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {t('paymentMethods')}
        </h1>
        <p className="text-sm text-foreground/70">
          {settings.language === 'en'
            ? 'Manage the cards and accounts you use for your subscriptions.'
            : 'Aquí gestionas las tarjetas y cuentas que usas en tus suscripciones.'
          }
        </p>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-6">
        {isLoading ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
              <Skeleton className="h-28 w-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
              <Skeleton className="h-28 w-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
              <Skeleton className="h-28 w-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
            </div>
            <Skeleton className="h-64 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
          </>
        ) : (
          <>
        {/* Resumen */}
        <section aria-labelledby="resumen-metodos-heading">
          <h2 id="resumen-metodos-heading" className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {settings.language === 'en' ? 'Summary' : 'Resumen'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-card border-2 border-border p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="mb-2 text-sm text-foreground/70">{settings.language === 'en' ? 'Active methods' : 'Métodos activos'}</p>
              <p className="text-3xl" style={{ fontFamily: 'var(--font-mono)' }}>
                {activeMethods}
              </p>
            </div>
            <div className="bg-card border-2 border-border p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="mb-2 text-sm text-foreground/70">{settings.language === 'en' ? 'Linked subscriptions' : 'Suscripciones vinculadas'}</p>
              <p className="text-3xl" style={{ fontFamily: 'var(--font-mono)' }}>
                {totalSubscriptions}
              </p>
            </div>
            <div className="bg-card border-2 border-border p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="mb-2 text-sm text-foreground/70">{settings.language === 'en' ? 'Total monthly cost' : 'Total mensual asociado'}</p>
              <p className="text-3xl" style={{ fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(totalMonthly, settings.currency)}
              </p>
            </div>
          </div>
        </section>

        {/* Lista de métodos de pago */}
        <section aria-labelledby="lista-metodos-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="lista-metodos-heading" style={{ fontFamily: 'var(--font-heading)' }}>
              {settings.language === 'en' ? 'Your payment methods' : 'Tus métodos de pago'}
            </h2>
            <button
              onClick={handleAddMethod}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 border-[3px] border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{settings.language === 'en' ? 'Add Method' : 'Agregar método'}</span>
            </button>
          </div>

          <ul className="space-y-3">
            {methods.map((method, index) => (
              <li
                key={method.id}
                className={`border-2 border-border p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow ${
                  index % 2 === 0 ? 'bg-card' : 'bg-secondary'
                } ${!method.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Columna izquierda: Nombre y tipo */}
                  <div className="flex items-start gap-3 flex-1">
                    <CreditCard className="h-6 w-6 mt-1 text-foreground/60" />
                    <div>
                      <h3 className="mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        {method.name}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {method.type === 'Tarjeta' ? (settings.language === 'en' ? 'Card' : 'Tarjeta') :
                         method.type === 'Cuenta bancaria' ? (settings.language === 'en' ? 'Bank account' : 'Cuenta bancaria') :
                         (settings.language === 'en' ? 'Other' : 'Otro')}
                      </p>
                    </div>
                  </div>

                  {/* Columna central: Stats */}
                  <div className="flex-1 lg:text-center">
                    <p className="mb-1 text-sm">
                      <span className="font-mono">{method.subscriptionsCount}</span>{' '}
                      {settings.language === 'en' 
                        ? `subscription${method.subscriptionsCount !== 1 ? 's' : ''}`
                        : `suscripción${method.subscriptionsCount !== 1 ? 'es' : ''}`
                      }
                    </p>
                    <p className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(method.monthlyTotal, settings.currency)} / {settings.language === 'en' ? 'month' : 'mes'}
                    </p>
                  </div>

                  {/* Columna derecha: Estado y acciones */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 border-2 border-border text-xs font-mono font-bold ${
                        method.isActive
                          ? 'bg-[#1E8E4D] text-white dark:bg-emerald-600 dark:text-white'
                          : 'bg-gray-400 text-white dark:bg-zinc-600 dark:text-white'
                      }`}
                    >
                      {method.isActive 
                        ? (settings.language === 'en' ? 'Active' : 'Activo') 
                        : (settings.language === 'en' ? 'Inactive' : 'Inactivo')
                      }
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMethod(method)}
                        aria-label={`Editar método ${method.name}`}
                        className="p-2 border-2 border-border bg-card hover:bg-background transition-colors cursor-pointer text-foreground"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(method.id)}
                        aria-label={`${method.isActive ? 'Desactivar' : 'Activar'} método ${
                          method.name
                        }`}
                        className="p-2 border-2 border-border bg-card hover:bg-background transition-colors cursor-pointer text-foreground"
                      >
                        <Power className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteMethod(method)}
                        aria-label={`Eliminar método ${method.name}`}
                        className="p-2 border-2 border-border bg-card hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {methods.length === 0 && (
            <div className="border-2 border-border bg-card p-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
              <p className="text-foreground/60 mb-4">
                {settings.language === 'en' ? 'You haven\'t added any payment methods yet' : 'Aún no has agregado ningún método de pago'}
              </p>
              <button
                onClick={handleAddMethod}
                className="bg-primary text-primary-foreground px-6 py-3 border-[3px] border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer font-bold"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {settings.language === 'en' ? 'Add your first method' : 'Agregar tu primer método'}
              </button>
            </div>
          )}
        </section>
        </>
        )}
      </div>

      {/* Modal principal */}
      <PaymentMethodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        method={editingMethod}
        onSave={handleSaveMethod}
      />

      {/* Modal de Alerta y Confirmación */}
      {alertConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border-[3px] border-border p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start gap-4 mb-6">
              {alertConfig.type === 'warning' ? (
                <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
              ) : (
                <Trash2 className="h-8 w-8 text-foreground shrink-0" />
              )}
              <div>
                <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  {alertConfig.type === 'warning' 
                    ? (settings.language === 'en' ? 'Action not allowed' : 'Acción no permitida') 
                    : (settings.language === 'en' ? 'Confirm deletion' : 'Confirmar eliminación')
                  }
                </h3>
                <p className="text-foreground/80 leading-relaxed">{alertConfig.message}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                className="px-5 py-2 border-2 border-border bg-card hover:bg-secondary transition-colors font-bold cursor-pointer text-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {alertConfig.type === 'warning' 
                  ? (settings.language === 'en' ? 'Understood' : 'Entendido') 
                  : t('cancel')
                }
              </button>
              {alertConfig.type === 'confirm' && alertConfig.onConfirm && (
                <button
                  onClick={alertConfig.onConfirm}
                  className="px-5 py-2 border-2 border-border bg-[#D7263D] text-white hover:bg-[#b01e30] dark:bg-rose-600 dark:hover:bg-rose-700 transition-colors font-bold cursor-pointer"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {settings.language === 'en' ? 'Delete' : 'Eliminar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
