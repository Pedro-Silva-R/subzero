import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  ChevronRight, 
  Globe, 
  Coins, 
  Moon, 
  Bell, 
  Download, 
  Trash2, 
  Info, 
  ShieldAlert 
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { Switch } from './ui/switch';
import { getSubscriptions, getPaymentMethods } from '../services/dataService';
import { toast } from 'sonner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function SettingsModal({ isOpen, onClose, title, children }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border-[3px] border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b-2 border-border p-5 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-foreground/10 border-2 border-border rounded transition-colors text-sm font-bold bg-card"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSetting, updateNotificationSetting, resetSettings, t } = useSettings();

  // Modal open states
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [daysOpen, setDaysOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  
  // Alert Dialog open state (dangerous delete)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handle local export
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const [subs, methods] = await Promise.all([
        getSubscriptions(),
        getPaymentMethods()
      ]);
      
      const backupData = {
        app: 'Sus_App',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        settings,
        subscriptions: subs,
        paymentMethods: methods,
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `susapp_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(t('toastExportSuccess'));
    } catch (error) {
      toast.error('Error al exportar datos');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle dangerous delete
  const handleDeleteLocalData = async () => {
    setIsDeleting(true);
    try {
      await resetSettings();
      toast.success(t('toastResetSuccess'));
      setConfirmDeleteOpen(false);
      // Recargar la app para refrescar el estado completamente limpio
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      toast.error('Error al borrar los datos');
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-16" style={{ fontFamily: 'var(--font-heading)' }}>
      {/* Header */}
      <header className="border-b-2 border-border bg-background px-4 py-6 md:px-8">
        <button
          onClick={() => navigate('/')}
          aria-label={t('back')}
          className="mb-4 flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t('back')}</span>
        </button>
        <h1 className="mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {t('settings')}
        </h1>
        <p className="text-sm text-foreground/70">
          {t('settingsSubtitle')}
        </p>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-8">
        
        {/* Preferencias Generales */}
        <section aria-labelledby="general-prefs-heading" className="space-y-4">
          <h2 id="general-prefs-heading" className="text-xl font-bold flex items-center gap-2">
            {t('generalPrefs')}
          </h2>
          <div className="border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-border overflow-hidden">
            
            {/* Moneda por defecto */}
            <div 
              onClick={() => setCurrencyOpen(true)}
              className="p-5 hover:bg-background transition-all flex items-center justify-between gap-4 cursor-pointer focus-within:ring-2 focus-within:ring-primary outline-none"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setCurrencyOpen(true)}
              role="button"
              aria-haspopup="dialog"
            >
              <div className="flex items-center gap-3">
                <Coins className="h-5 w-5 text-foreground/70" />
                <div>
                  <h3 className="font-bold">{t('defaultCurrency')}</h3>
                  <p className="text-xs text-foreground/60">Moneda preferida para agregar y calcular resúmenes</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono font-bold bg-accent-light border border-border px-2 py-0.5 text-sm rounded">
                <span>{settings.currency}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Idioma */}
            <div 
              onClick={() => setLangOpen(true)}
              className="p-5 hover:bg-background transition-all flex items-center justify-between gap-4 cursor-pointer focus-within:ring-2 focus-within:ring-primary outline-none"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setLangOpen(true)}
              role="button"
              aria-haspopup="dialog"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-foreground/70" />
                <div>
                  <h3 className="font-bold">{t('language')}</h3>
                  <p className="text-xs text-foreground/60">Idioma principal de los textos de la interfaz</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono font-bold bg-accent-light border border-border px-2 py-0.5 text-sm rounded">
                <span>{settings.language === 'es' ? 'Español' : 'English'}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Tema */}
            <div 
              onClick={() => setThemeOpen(true)}
              className="p-5 hover:bg-background transition-all flex items-center justify-between gap-4 cursor-pointer focus-within:ring-2 focus-within:ring-primary outline-none"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setThemeOpen(true)}
              role="button"
              aria-haspopup="dialog"
            >
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-foreground/70" />
                <div>
                  <h3 className="font-bold">{t('theme')}</h3>
                  <p className="text-xs text-foreground/60">Aspecto visual y modo de la aplicación</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono font-bold bg-accent-light border border-border px-2 py-0.5 text-sm rounded">
                <span>
                  {settings.theme === 'light' && t('themeLight')}
                  {settings.theme === 'dark' && t('themeDark')}
                  {settings.theme === 'system' && t('themeSystem')}
                </span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

          </div>
        </section>

        {/* Notificaciones */}
        <section aria-labelledby="notifications-heading" className="space-y-4">
          <h2 id="notifications-heading" className="text-xl font-bold flex items-center gap-2">
            {t('notifications')}
          </h2>
          <div className="border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-border overflow-hidden">
            
            {/* Recordatorios de cobro toggle */}
            <div 
              className="p-5 flex items-center justify-between gap-4"
              role="none"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-foreground/70" />
                <div>
                  <h4 className="font-bold">{t('remindersEnabled')}</h4>
                  <p className="text-xs text-foreground/60">Avisos locales antes de la fecha de cobro de suscripciones activas</p>
                </div>
              </div>
              <Switch 
                checked={settings.notifications.remindersEnabled}
                onCheckedChange={(checked) => {
                  updateNotificationSetting('remindersEnabled', checked);
                  toast.success(t('toastUpdateSuccess'));
                }}
                aria-label={t('remindersEnabled')}
              />
            </div>

            {/* Anticipación (Solo mostrar si reminders está habilitado) */}
            {settings.notifications.remindersEnabled && (
              <div 
                onClick={() => setDaysOpen(true)}
                className="p-5 pl-12 hover:bg-background transition-all flex items-center justify-between gap-4 cursor-pointer focus-within:ring-2 focus-within:ring-primary outline-none animate-[slideDown_0.2s_ease-out]"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setDaysOpen(true)}
                role="button"
                aria-haspopup="dialog"
              >
                <div>
                  <h4 className="font-bold text-sm md:text-base">{t('reminderDaysBefore')}</h4>
                  <p className="text-xs text-foreground/60">Configura con cuántos días de anticipación lanzar el aviso</p>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold bg-accent-light border border-border px-2 py-0.5 text-xs rounded">
                  <span>
                    {settings.notifications.reminderDaysBefore === 1 
                      ? t('dayBefore') 
                      : t('daysBefore').replace('{{count}}', settings.notifications.reminderDaysBefore.toString())
                    }
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            )}

            {/* Recordatorio Fin de Trial */}
            <div 
              className="p-5 flex items-center justify-between gap-4"
              role="none"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-foreground/70" />
                <div>
                  <h4 className="font-bold">{t('trialReminders')}</h4>
                  <p className="text-xs text-foreground/60">{t('trialRemindersSub')}</p>
                </div>
              </div>
              <Switch 
                checked={settings.notifications.trialRemindersEnabled}
                onCheckedChange={(checked) => {
                  updateNotificationSetting('trialRemindersEnabled', checked);
                  toast.success(t('toastUpdateSuccess'));
                }}
                aria-label={t('trialReminders')}
              />
            </div>

          </div>
        </section>

        {/* Pagos y Datos */}
        <section aria-labelledby="payments-data-heading" className="space-y-4">
          <h2 id="payments-data-heading" className="text-xl font-bold flex items-center gap-2">
            {t('paymentsAndData')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Exportar datos card */}
            <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                  <Download className="h-5 w-5 text-primary" />
                  {t('exportData')}
                </h3>
                <p className="text-sm text-foreground/70 mb-6">
                  {t('exportDataSub')}
                </p>
              </div>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 bg-card px-5 py-3 border-[3px] border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold cursor-pointer disabled:opacity-50 text-foreground hover:bg-secondary"
              >
                <span>{isExporting ? 'Exportando...' : t('exportData')}</span>
              </button>
            </div>

            {/* Borrado local peligroso card */}
            <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between border-l-red-500 border-l-[6px]">
              <div>
                <h3 className="text-lg font-bold text-[#D7263D] dark:text-[#F25C74] flex items-center gap-2 mb-2">
                  <Trash2 className="h-5 w-5" />
                  {t('deleteLocalData')}
                </h3>
                <p className="text-sm text-foreground/70 mb-6">
                  Elimina permanentemente todo el historial, tarjetas registradas y preferencias de este navegador.
                </p>
              </div>
              <button
                onClick={() => setConfirmDeleteOpen(true)}
                className="w-full bg-[#D7263D] text-white px-5 py-3 border-[3px] border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold cursor-pointer hover:bg-[#b01e30] dark:bg-rose-600 dark:hover:bg-rose-700"
              >
                <span>{t('deleteLocalDataAction')}</span>
              </button>
            </div>

          </div>
        </section>

        {/* Acerca de la app */}
        <section aria-labelledby="about-heading" className="space-y-4">
          <h2 id="about-heading" className="text-xl font-bold flex items-center gap-2">
            Acerca de la app
          </h2>
          <div className="border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-border overflow-hidden">
            
            {/* Version */}
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5 text-foreground/70" />
                <div>
                  <h4 className="font-bold">{t('version')}</h4>
                  <p className="text-xs text-foreground/60">Código de despliegue actual</p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold opacity-80">v1.0.0</span>
            </div>

            {/* Créditos */}
            <div 
              onClick={() => setCreditsOpen(true)}
              className="p-5 hover:bg-background transition-all flex items-center justify-between gap-4 cursor-pointer focus-within:ring-2 focus-within:ring-primary outline-none"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setCreditsOpen(true)}
              role="button"
              aria-haspopup="dialog"
            >
              <h4 className="font-bold">{t('credits')}</h4>
              <ChevronRight className="h-5 w-5 text-foreground/70" />
            </div>

            {/* Política de privacidad */}
            <div 
              onClick={() => setPrivacyOpen(true)}
              className="p-5 hover:bg-background transition-all flex items-center justify-between gap-4 cursor-pointer focus-within:ring-2 focus-within:ring-primary outline-none"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setPrivacyOpen(true)}
              role="button"
              aria-haspopup="dialog"
            >
              <h4 className="font-bold">{t('privacyPolicy')}</h4>
              <ChevronRight className="h-5 w-5 text-foreground/70" />
            </div>

          </div>
        </section>

      </div>

      {/* --- MODALS DE CONFIGURACIÓN --- */}
      
      {/* Selector de Moneda */}
      <SettingsModal 
        isOpen={currencyOpen} 
        onClose={() => setCurrencyOpen(false)}
        title="Selecciona la moneda por defecto"
      >
        <div className="space-y-3 font-bold">
          {['CLP', 'USD', 'EUR'].map((curr) => (
            <button
              key={curr}
              onClick={() => {
                updateSetting('currency', curr as any);
                toast.success(`${t('toastUpdateSuccess')}: ${curr}`);
                setCurrencyOpen(false);
              }}
              className={`w-full text-left p-4 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all ${
                settings.currency === curr ? 'bg-accent-light' : 'bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{curr}</span>
                <span className="text-xs font-mono font-normal opacity-60 text-foreground/60">
                  {curr === 'CLP' && 'Peso Chileno ($)'}
                  {curr === 'USD' && 'Dólar Estadounidense (US$)'}
                  {curr === 'EUR' && 'Euro (€)'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </SettingsModal>

      {/* Selector de Idioma */}
      <SettingsModal 
        isOpen={langOpen} 
        onClose={() => setLangOpen(false)}
        title="Selecciona tu idioma preferido"
      >
        <div className="space-y-3 font-bold">
          {[
            { code: 'es', label: 'Español' },
            { code: 'en', label: 'English' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                updateSetting('language', lang.code as any);
                toast.success(`${t('toastUpdateSuccess')}: ${lang.label}`);
                setLangOpen(false);
              }}
              className={`w-full text-left p-4 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all ${
                settings.language === lang.code ? 'bg-accent-light' : 'bg-card'
              }`}
            >
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </SettingsModal>

      {/* Selector de Tema */}
      <SettingsModal 
        isOpen={themeOpen} 
        onClose={() => setThemeOpen(false)}
        title="Selecciona el tema visual"
      >
        <div className="space-y-3 font-bold">
          {[
            { code: 'light', label: t('themeLight') },
            { code: 'dark', label: t('themeDark') },
            { code: 'system', label: t('themeSystem') }
          ].map((th) => (
            <button
              key={th.code}
              onClick={() => {
                updateSetting('theme', th.code as any);
                toast.success(`${t('toastUpdateSuccess')}: ${th.label}`);
                setThemeOpen(false);
              }}
              className={`w-full text-left p-4 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all ${
                settings.theme === th.code ? 'bg-accent-light' : 'bg-card'
              }`}
            >
              <span>{th.label}</span>
            </button>
          ))}
        </div>
      </SettingsModal>

      {/* Selector de Días de Anticipación */}
      <SettingsModal 
        isOpen={daysOpen} 
        onClose={() => setDaysOpen(false)}
        title="Días de anticipación para cobros"
      >
        <div className="space-y-3 font-bold">
          {[1, 3, 5, 7].map((days) => (
            <button
              key={days}
              onClick={() => {
                updateNotificationSetting('reminderDaysBefore', days);
                toast.success(`${t('toastUpdateSuccess')}: ${days} días`);
                setDaysOpen(false);
              }}
              className={`w-full text-left p-4 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all ${
                settings.notifications.reminderDaysBefore === days ? 'bg-accent-light' : 'bg-card'
              }`}
            >
              <span>{days === 1 ? t('dayBefore') : t('daysBefore').replace('{{count}}', days.toString())}</span>
            </button>
          ))}
        </div>
      </SettingsModal>

      {/* Créditos */}
      <SettingsModal 
        isOpen={creditsOpen} 
        onClose={() => setCreditsOpen(false)}
        title={t('credits')}
      >
        <div className="space-y-4 leading-relaxed">
          <p className="font-bold">{t('creditsContent')}</p>
          <div className="bg-accent-light border border-border p-4 text-xs font-mono">
            <p className="font-bold mb-1">Tecnologías principales:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>React 18 & Vite</li>
              <li>React Router 7</li>
              <li>Tailwind CSS v4</li>
              <li>Radix UI Primitives</li>
              <li>Lucide Icons</li>
            </ul>
          </div>
          <button
            onClick={() => setCreditsOpen(false)}
            className="w-full bg-card px-5 py-2.5 border-2 border-border hover:bg-secondary transition-colors font-bold text-foreground"
          >
            {t('close')}
          </button>
        </div>
      </SettingsModal>

      {/* Política de privacidad */}
      <SettingsModal 
        isOpen={privacyOpen} 
        onClose={() => setPrivacyOpen(false)}
        title={t('privacyPolicy')}
      >
        <div className="space-y-4 leading-relaxed">
          <p className="font-bold text-foreground">{t('privacyContent')}</p>
          <p className="text-sm text-foreground/70">
            Tus datos de suscripción se guardan en el espacio local de aislamiento de este navegador. La aplicación no utiliza cookies de seguimiento ni recopila analíticas en servidores externos.
          </p>
          <button
            onClick={() => setPrivacyOpen(false)}
            className="w-full bg-card px-5 py-2.5 border-2 border-border hover:bg-secondary transition-colors font-bold text-foreground"
          >
            {t('close')}
          </button>
        </div>
      </SettingsModal>

      {/* Alert Dialog (Danger Confirm Delete) */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border-[3px] border-border p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-[slideDown_0.2s_ease-out]">
            <div className="flex items-start gap-4 mb-6">
              <ShieldAlert className="h-8 w-8 text-[#D7263D] dark:text-[#F25C74] shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('deleteConfirmTitle')}
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm">{t('deleteConfirmMsg')}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end font-bold">
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 border-2 border-border bg-card hover:bg-secondary transition-colors cursor-pointer text-foreground"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteLocalData}
                disabled={isDeleting}
                className="px-5 py-2.5 border-2 border-border bg-[#D7263D] text-white hover:bg-[#b01e30] dark:bg-rose-600 dark:hover:bg-rose-700 transition-colors cursor-pointer"
              >
                {isDeleting ? 'Borrando...' : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
