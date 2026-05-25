import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearAllLocalData } from '../services/dataService';

export interface AppSettings {
  currency: 'CLP' | 'USD' | 'EUR';
  language: 'es' | 'en';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    remindersEnabled: boolean;
    reminderDaysBefore: number;
    trialRemindersEnabled: boolean;
  };
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  updateNotificationSetting: <K extends keyof AppSettings['notifications']>(
    key: K,
    value: AppSettings['notifications'][K]
  ) => void;
  resetSettings: () => Promise<void>;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  t: (key: string) => string;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'CLP',
  language: 'es',
  theme: 'system',
  notifications: {
    remindersEnabled: true,
    reminderDaysBefore: 3,
    trialRemindersEnabled: true,
  },
};

const STORAGE_KEY = 'subzero_settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Diccionario multilingüe integrado para dar soporte a la app y la vista
const translations = {
  es: {
    settings: 'Configuración',
    settingsSubtitle: 'Ajusta cómo se comporta la app',
    back: 'Volver',
    generalPrefs: 'Preferencias generales',
    defaultCurrency: 'Moneda por defecto',
    language: 'Idioma',
    theme: 'Tema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    themeSystem: 'Del sistema',
    notifications: 'Notificaciones',
    remindersEnabled: 'Recordatorios de cobro',
    reminderDaysBefore: 'Recordar antes de cobrar',
    trialReminders: 'Recordatorios de fin de trial',
    trialRemindersSub: 'Avisar antes de que termine un periodo de prueba',
    daysBefore: '{{count}} días antes',
    dayBefore: '1 día antes',
    paymentsAndData: 'Pagos y datos',
    exportData: 'Exportar datos',
    exportDataSub: 'Descargar un archivo JSON con tus suscripciones',
    deleteLocalData: 'Borrar todos los datos locales',
    deleteLocalDataAction: 'Borrar todos los datos de esta app en este dispositivo',
    deleteConfirmTitle: 'Confirmar eliminación',
    deleteConfirmMsg: '¿Estás seguro de que deseas borrar todos los datos locales de la aplicación? Esto restablecerá la configuración, suscripciones y métodos de pago a su estado inicial. Esta acción es irreversible y requiere que la página se recargue.',
    aboutApp: 'Acerca de la app',
    version: 'Versión',
    credits: 'Créditos',
    creditsContent: 'SubZero es una aplicación neobrutalista premium diseñada para gestionar tus suscripciones sin esfuerzo. Desarrollada con React, TypeScript y Tailwind CSS.',
    privacyPolicy: 'Política de privacidad',
    privacyContent: 'Tus datos son completamente privados y se almacenan únicamente en tu dispositivo (localStorage). No recopilamos información personal.',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    toastResetSuccess: '¡Todos los datos locales han sido eliminados con éxito!',
    toastExportSuccess: '¡Suscripciones exportadas con éxito!',
    toastUpdateSuccess: 'Preferencia actualizada',
    
    // UI Globales
    monthlyCommitment: 'Resumen de compromiso',
    monthlyCommitmentSub: 'Comprometido este mes',
    yearlyEquivalent: 'Equivalente anual',
    breakdownYo: 'Yo',
    breakdownPareja: 'Pareja',
    breakdownFamilia: 'Familia',
    upcomingCharges: 'Próximos cobros',
    alerts: 'Alertas',
    alertTrials: 'Pruebas terminando pronto',
    alertZombies: 'Suscripciones problemáticas',
    alertCards: 'Tarjetas activas',
    subscriptions: 'Suscripciones',
    addSubscription: 'Agregar suscripción',
    paymentMethods: 'Métodos de pago',
    noPaymentMethods: 'Aún no has agregado ningún método de pago',
    addFirstMethod: 'Agregar tu primer método',
    active: 'Activo',
    inactive: 'Inactivo',
  },
  en: {
    settings: 'Settings',
    settingsSubtitle: 'Adjust how the app behaves',
    back: 'Back',
    generalPrefs: 'General preferences',
    defaultCurrency: 'Default currency',
    language: 'Language',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System default',
    notifications: 'Notifications',
    remindersEnabled: 'Payment reminders',
    reminderDaysBefore: 'Remind before payment',
    trialReminders: 'Trial reminders',
    trialRemindersSub: 'Notify before a trial period ends',
    daysBefore: '{{count}} days before',
    dayBefore: '1 day before',
    paymentsAndData: 'Payments & data',
    exportData: 'Export data',
    exportDataSub: 'Download a JSON file with your subscriptions',
    deleteLocalData: 'Delete all local data',
    deleteLocalDataAction: 'Delete all app data on this device',
    deleteConfirmTitle: 'Confirm deletion',
    deleteConfirmMsg: 'Are you sure you want to delete all local data? This will reset your settings, subscriptions, and payment methods to their initial state. This action cannot be undone and will require a page reload.',
    aboutApp: 'About the app',
    version: 'Version',
    credits: 'Credits',
    creditsContent: 'SubZero is a premium neobrutalist application designed to manage your subscriptions effortlessly. Built with React, TypeScript, and Tailwind CSS.',
    privacyPolicy: 'Privacy policy',
    privacyContent: 'Your data is completely private and stored only on your device (localStorage). We do not collect any personal information.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    toastResetSuccess: 'All local data has been successfully deleted!',
    toastExportSuccess: 'Subscriptions exported successfully!',
    toastUpdateSuccess: 'Preference updated',

    // UI Globals
    monthlyCommitment: 'Commitment Summary',
    monthlyCommitmentSub: 'Committed this month',
    yearlyEquivalent: 'Yearly equivalent',
    breakdownYo: 'Me',
    breakdownPareja: 'Partner',
    breakdownFamilia: 'Family',
    upcomingCharges: 'Upcoming charges',
    alerts: 'Alerts',
    alertTrials: 'Trials ending soon',
    alertZombies: 'Problem subscriptions',
    alertCards: 'Active cards',
    subscriptions: 'Subscriptions',
    addSubscription: 'Add subscription',
    paymentMethods: 'Payment methods',
    noPaymentMethods: 'You haven\'t added any payment methods yet',
    addFirstMethod: 'Add your first method',
    active: 'Active',
    inactive: 'Inactive',
  },
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const local = localStorage.getItem(STORAGE_KEY);
    if (!local) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(local);
      // Garantizar que la estructura cargada sea la correcta
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        notifications: {
          ...DEFAULT_SETTINGS.notifications,
          ...(parsed.notifications || {}),
        },
      };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  // Guardar configuraciones en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Manejar el tema de forma visual aplicando la clase 'dark' en el elemento raíz
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      let isDark = false;
      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = theme === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (settings.theme === 'system') {
          if (e.matches) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNotificationSetting = <K extends keyof AppSettings['notifications']>(
    key: K,
    value: AppSettings['notifications'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const resetSettings = async () => {
    await clearAllLocalData();
    setSettings(DEFAULT_SETTINGS);
  };

  const formatCurrency = (amount: number, currencyCode?: string): string => {
    const code = currencyCode || settings.currency;
    
    if (code === 'CLP') {
      return `$${Math.round(amount).toLocaleString('es-CL')}`;
    } else if (code === 'USD') {
      return `US$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (code === 'EUR') {
      return `€ ${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return `${code} ${amount.toLocaleString()}`;
  };

  const t = (key: string): string => {
    const lang = settings.language;
    const langTranslations = translations[lang] || translations.es;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateNotificationSetting,
        resetSettings,
        formatCurrency,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
