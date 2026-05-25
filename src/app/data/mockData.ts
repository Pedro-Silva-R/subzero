export interface Subscription {
  id: string | number;
  name: string;
  category: string;
  amount: number;
  currency: string;
  cycle: string;
  status: string;
  nextChargeDate: string;
  signupDate: string;
  paymentMethod: string;
  isTrial: boolean;
  trialEndDate: string | null;
  sharedWith: string[];
  paymentNotes: string;
  notes: string;
  priceHistory: { date: string; amount: number; currency: string }[];
}

export interface PaymentMethod {
  id: number | string; // Supabase usará UUIDs (strings)
  name: string;
  type: 'Tarjeta' | 'Cuenta bancaria' | 'Otro';
  subscriptionsCount: number;
  monthlyTotal: number;
  isActive: boolean;
  notes?: string;
}

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subzero_subscriptions',
  PAYMENT_METHODS: 'subzero_payment_methods',
};

export const initialPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    name: 'VISA ****1234',
    type: 'Tarjeta',
    subscriptionsCount: 5,
    monthlyTotal: 95990,
    isActive: true,
  },
  {
    id: 2,
    name: 'Master ****5678',
    type: 'Tarjeta',
    subscriptionsCount: 1,
    monthlyTotal: 8990,
    isActive: true,
  },
  {
    id: 3,
    name: 'Débito ****9012',
    type: 'Cuenta bancaria',
    subscriptionsCount: 1,
    monthlyTotal: 35000,
    isActive: true,
  },
  {
    id: 4,
    name: 'PayPal Personal',
    type: 'Otro',
    subscriptionsCount: 0,
    monthlyTotal: 0,
    isActive: false,
  },
];

export const initialSubscriptions: Subscription[] = [
  {
    id: 1,
    name: 'Netflix',
    category: 'Streaming',
    amount: 12990,
    currency: 'CLP',
    cycle: 'Mensual',
    status: 'ACTIVA',
    nextChargeDate: '18 May 2026',
    signupDate: '15 Ene 2024',
    paymentMethod: 'VISA ****1234',
    isTrial: false,
    trialEndDate: null,
    sharedWith: ['Yo', 'Pareja'],
    paymentNotes: '',
    notes: 'Plan Premium con 4 pantallas simultáneas',
    priceHistory: [
      { date: '2024-01-15', amount: 9990, currency: 'CLP' },
      { date: '2025-03-01', amount: 11490, currency: 'CLP' },
      { date: '2026-01-01', amount: 12990, currency: 'CLP' },
    ],
  },
  {
    id: 2,
    name: 'Spotify Premium',
    category: 'Música',
    amount: 8990,
    currency: 'CLP',
    cycle: 'Mensual',
    status: 'ACTIVA',
    nextChargeDate: '20 May 2026',
    signupDate: '10 Feb 2024',
    paymentMethod: 'Master ****5678',
    isTrial: false,
    trialEndDate: null,
    sharedWith: ['Yo'],
    paymentNotes: '',
    notes: 'Cuenta individual',
    priceHistory: [
      { date: '2024-02-10', amount: 7200, currency: 'CLP' },
      { date: '2025-06-01', amount: 8990, currency: 'CLP' },
    ],
  }
];

// --- SIMULATED SERVICES (SUPABASE PREP) ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getLocalSubscriptions = (): Subscription[] => {
  const local = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
  if (!local) {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(initialSubscriptions));
    return initialSubscriptions;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    return initialSubscriptions;
  }
};

const getLocalPaymentMethods = (): PaymentMethod[] => {
  const local = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
  if (!local) {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(initialPaymentMethods));
    return initialPaymentMethods;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    return initialPaymentMethods;
  }
};

export const getSubscriptions = async (): Promise<Subscription[]> => {
  await delay(500);
  return getLocalSubscriptions();
};

export const getSubscriptionById = async (id: string | number): Promise<Subscription | undefined> => {
  await delay(400);
  return getLocalSubscriptions().find(sub => sub.id.toString() === id.toString());
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  await delay(400);
  return getLocalPaymentMethods();
};

export const getSummaryData = async () => {
  await delay(400);
  const subs = getLocalSubscriptions();
  const activeSubs = subs.filter(sub => sub.status === 'ACTIVA' || sub.status === 'TRIAL');

  let monthlyCommitment = 0;
  let yearlyEquivalent = 0;
  
  const breakdown = { yo: 0, pareja: 0, familia: 0 };
  const alerts = { trials: 0, zombies: 0 };

  subs.forEach(sub => {
    if (sub.status === 'TRIAL' || sub.isTrial) {
      alerts.trials += 1;
    }
    if (sub.status === 'ZOMBIE') {
      alerts.zombies += 1;
    }
  });

  activeSubs.forEach(sub => {
    let monthlyCost = sub.amount;
    if (sub.cycle === 'Anual') {
      monthlyCost = sub.amount / 12;
    } else if (sub.cycle === 'Semanal') {
      monthlyCost = sub.amount * 4.33;
    }
    
    monthlyCommitment += monthlyCost;
    yearlyEquivalent += (monthlyCost * 12);

    if (sub.sharedWith && sub.sharedWith.length > 0) {
      const splitAmount = monthlyCost / sub.sharedWith.length;
      sub.sharedWith.forEach(person => {
        const p = person.toLowerCase().trim();
        if (p === 'yo') {
          breakdown.yo += splitAmount;
        } else if (p === 'pareja') {
          breakdown.pareja += splitAmount;
        } else if (p === 'familia') {
          breakdown.familia += splitAmount;
        } else {
          breakdown.yo += splitAmount;
        }
      });
    } else {
      breakdown.yo += monthlyCost;
    }
  });

  const upcomingCharges = activeSubs.map(s => ({
    id: s.id,
    date: s.nextChargeDate,
    name: s.name,
    amount: s.amount,
    paymentMethod: s.paymentMethod,
    sharedWith: s.sharedWith ? s.sharedWith.join(' + ') : 'Yo',
  }));

  return {
    monthlyCommitment: Math.round(monthlyCommitment),
    yearlyEquivalent: Math.round(yearlyEquivalent),
    breakdown: {
      yo: Math.round(breakdown.yo),
      pareja: Math.round(breakdown.pareja),
      familia: Math.round(breakdown.familia),
    },
    alerts,
    upcomingCharges,
  };
};

export const saveSubscription = async (subscription: Partial<Subscription>) => {
  await delay(600);
  const subs = getLocalSubscriptions();
  if (subscription.id) {
    // Editar existente
    const index = subs.findIndex(s => s.id.toString() === subscription.id!.toString());
    if (index !== -1) {
      subs[index] = { ...subs[index], ...subscription } as Subscription;
    }
  } else {
    // Crear nueva
    const newId = `sub-${Date.now()}`;
    const newSub = {
      ...subscription,
      id: newId,
      signupDate: subscription.signupDate || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      priceHistory: subscription.amount ? [{ date: new Date().toISOString().split('T')[0], amount: subscription.amount, currency: subscription.currency || 'CLP' }] : [],
    } as Subscription;
    subs.push(newSub);
  }
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
  return { success: true };
};

export const deleteSubscription = async (id: string | number) => {
  await delay(600);
  const subs = getLocalSubscriptions();
  const filtered = subs.filter(s => s.id.toString() !== id.toString());
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(filtered));
  return { success: true };
};

export const savePaymentMethod = async (method: Partial<PaymentMethod>) => {
  await delay(600);
  const methods = getLocalPaymentMethods();
  if (method.id) {
    // Editar existente
    const index = methods.findIndex(m => m.id.toString() === method.id!.toString());
    if (index !== -1) {
      methods[index] = { ...methods[index], ...method } as PaymentMethod;
    }
  } else {
    // Crear nuevo
    const newId = `pay-${Date.now()}`;
    const newMethod = {
      ...method,
      id: newId,
      subscriptionsCount: 0,
      monthlyTotal: 0,
      isActive: true,
    } as PaymentMethod;
    methods.push(newMethod);
  }
  localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
  return { success: true };
};

export const deletePaymentMethod = async (id: string | number) => {
  await delay(600);
  const methods = getLocalPaymentMethods();
  const filtered = methods.filter(m => m.id.toString() !== id.toString());
  localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(filtered));
  return { success: true };
};

export const clearAllLocalData = async () => {
  await delay(500);
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
  localStorage.removeItem(STORAGE_KEYS.PAYMENT_METHODS);
  localStorage.removeItem('subzero_settings');
  return { success: true };
};
