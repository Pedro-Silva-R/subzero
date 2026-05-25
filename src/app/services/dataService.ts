/**
 * dataService.ts — Servicio de datos real usando Supabase
 *
 * Reemplaza src/app/data/mockData.ts
 *
 * MODO DESARROLLO: usa VITE_DEV_USER_ID como user_id fijo (sin auth).
 * ACTIVAR AUTH: reemplazar DEV_USER_ID por (await supabase.auth.getUser()).data.user?.id
 *               en las funciones insert/update. Los SELECT no necesitan cambio
 *               porque con RLS activo Supabase filtra automáticamente por usuario.
 */

import { supabase } from '../../lib/supabase.ts';
import type {
  DbPaymentMethod,
  DbSubscription,
  PriceHistoryEntry,
} from '../../lib/database.types.ts';

// ── ID de usuario de desarrollo (sin auth) ───────────────────
const DEV_USER_ID = import.meta.env.VITE_DEV_USER_ID as string;

// ── Tipos del Frontend ────────────────────────────────────────
// Estos tipos son los que usan los componentes (con campos calculados y
// nombres en camelCase). Se mapean hacia/desde los tipos de BD (snake_case).

export interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  cycle: string;
  status: string;
  nextChargeDate: string;       // Formato ISO YYYY-MM-DD
  signupDate: string;           // Formato ISO YYYY-MM-DD
  paymentMethodId: string | null; // UUID del método de pago
  paymentMethodName: string;    // Nombre resuelto (para mostrar en UI, calculado)
  isTrial: boolean;
  trialEndDate: string | null;
  sharedWith: string[];
  paymentNotes: string;
  notes: string;
  priceHistory: PriceHistoryEntry[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'Tarjeta' | 'Cuenta bancaria' | 'Otro';
  isActive: boolean;
  notes: string;
  // Campos calculados (no en BD)
  subscriptionsCount: number;
  monthlyTotal: number;
}

// ── Helpers de mapeo BD → Frontend ───────────────────────────

function mapSubscription(
  row: DbSubscription,
  paymentMethodName = ''
): Subscription {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    amount: Number(row.amount),
    currency: row.currency,
    cycle: row.cycle,
    status: row.status ? row.status.toUpperCase() : 'ACTIVA',
    nextChargeDate: row.next_charge_date ?? '',
    signupDate: row.signup_date,
    paymentMethodId: row.payment_method_id,
    paymentMethodName,
    isTrial: row.is_trial,
    trialEndDate: row.trial_end_date,
    sharedWith: row.shared_with ?? [],
    paymentNotes: row.payment_notes ?? '',
    notes: row.notes ?? '',
    priceHistory: (row.price_history as PriceHistoryEntry[]) ?? [],
  };
}

function mapPaymentMethod(
  row: DbPaymentMethod,
  subscriptionsCount = 0,
  monthlyTotal = 0
): PaymentMethod {
  return {
    id: row.id,
    name: row.name,
    type: row.type as PaymentMethod['type'],
    isActive: row.is_active,
    notes: row.notes ?? '',
    subscriptionsCount,
    monthlyTotal,
  };
}

// ── Suscripciones ─────────────────────────────────────────────

export const getSubscriptions = async (): Promise<Subscription[]> => {
  const { data, error } = await (supabase
    .from('subscriptions')
    .select(`
      *,
      payment_methods ( id, name )
    `)
    .eq('user_id', DEV_USER_ID)
    .order('created_at', { ascending: false }) as any);

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const pm = row.payment_methods as { id: string; name: string } | null;
    return mapSubscription(row as DbSubscription, pm?.name ?? '');
  });
};

export const getSubscriptionById = async (id: string): Promise<Subscription | undefined> => {
  const { data, error } = await (supabase
    .from('subscriptions')
    .select(`
      *,
      payment_methods ( id, name )
    `)
    .eq('id', id)
    .eq('user_id', DEV_USER_ID)
    .single() as any);

  if (error) {
    if (error.code === 'PGRST116') return undefined; // No encontrado
    throw error;
  }

  if (!data) return undefined;
  const pm = (data as any).payment_methods as { id: string; name: string } | null;
  return mapSubscription(data as DbSubscription, pm?.name ?? '');
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  // Traer métodos de pago y suscripciones activas en paralelo
  const [methodsResult, subsResult] = await Promise.all([
    supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .order('created_at', { ascending: true }),
    supabase
      .from('subscriptions')
      .select('payment_method_id, amount, cycle')
      .eq('user_id', DEV_USER_ID)
      .in('status', ['ACTIVA', 'TRIAL']) as any,
  ]);

  if (methodsResult.error) throw methodsResult.error;
  if (subsResult.error) throw subsResult.error;

  const subs = (subsResult.data ?? []) as { payment_method_id: string | null; amount: number; cycle: string }[];

  return (methodsResult.data ?? []).map((method) => {
    const linked = subs.filter((s) => s.payment_method_id === method.id);
    const monthlyTotal = linked.reduce((acc: number, s) => {
      const amount = Number(s.amount);
      if (s.cycle === 'Anual') return acc + amount / 12;
      if (s.cycle === 'Semanal') return acc + amount * 4.33;
      return acc + amount;
    }, 0);

    return mapPaymentMethod(method as DbPaymentMethod, linked.length, Math.round(monthlyTotal));
  });
};

export const getSummaryData = async () => {
  const [subs, methods] = await Promise.all([
    getSubscriptions(),
    getPaymentMethods()
  ]);
  const activeSubs = subs.filter((s) => s.status === 'ACTIVA' || s.status === 'TRIAL');

  let monthlyCommitment = 0;
  let yearlyEquivalent = 0;
  const breakdown = { yo: 0, pareja: 0, familia: 0 };
  const alerts = { 
    trials: 0, 
    zombies: 0,
    activeCards: methods.filter(m => m.isActive).length 
  };

  subs.forEach((sub) => {
    if (sub.status === 'TRIAL' || sub.isTrial) alerts.trials += 1;
    if (sub.status === 'ZOMBIE') alerts.zombies += 1;
  });

  activeSubs.forEach((sub) => {
    let monthlyCost = sub.amount;
    if (sub.cycle === 'Anual') monthlyCost = sub.amount / 12;
    else if (sub.cycle === 'Semanal') monthlyCost = sub.amount * 4.33;

    monthlyCommitment += monthlyCost;
    yearlyEquivalent += monthlyCost * 12;

    if (sub.sharedWith && sub.sharedWith.length > 0) {
      const splitAmount = monthlyCost / sub.sharedWith.length;
      sub.sharedWith.forEach((person) => {
        const p = person.toLowerCase().trim();
        if (p === 'yo') breakdown.yo += splitAmount;
        else if (p === 'pareja') breakdown.pareja += splitAmount;
        else if (p === 'familia') breakdown.familia += splitAmount;
        else breakdown.yo += splitAmount;
      });
    } else {
      breakdown.yo += monthlyCost;
    }
  });

  const upcomingCharges = activeSubs.map((s) => ({
    id: s.id,
    date: s.nextChargeDate,
    name: s.name,
    amount: s.amount,
    paymentMethod: s.paymentMethodName,
    sharedWith: s.sharedWith.length > 0 ? s.sharedWith.join(' + ') : 'Yo',
  })).sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

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

export const saveSubscription = async (
  subscription: Partial<Subscription> & { id?: string }
): Promise<{ success: boolean }> => {
  const isEdit = !!subscription.id && !subscription.id.startsWith('temp-');

  // Construir historial de precios
  let priceHistory: PriceHistoryEntry[] = subscription.priceHistory ?? [];
  if (!isEdit && subscription.amount) {
    priceHistory = [
      {
        date: new Date().toISOString().split('T')[0],
        amount: subscription.amount,
        currency: subscription.currency ?? 'CLP',
      },
    ];
  }

  const payload = {
    user_id: DEV_USER_ID,
    name: subscription.name!,
    category: subscription.category ?? 'Otros',
    amount: subscription.amount!,
    currency: subscription.currency ?? 'CLP',
    cycle: subscription.cycle ?? 'Mensual',
    status: (subscription.status ?? 'ACTIVA').toUpperCase(),
    next_charge_date: subscription.nextChargeDate || null,
    signup_date: subscription.signupDate ?? new Date().toISOString().split('T')[0],
    payment_method_id: subscription.paymentMethodId ?? null,
    is_trial: subscription.isTrial ?? false,
    trial_end_date: subscription.trialEndDate || null,
    shared_with: subscription.sharedWith ?? [],
    payment_notes: subscription.paymentNotes ?? '',
    notes: subscription.notes ?? '',
    price_history: priceHistory,
  };

  if (isEdit) {
    const { error } = await supabase
      .from('subscriptions')
      .update(payload)
      .eq('id', subscription.id!)
      .eq('user_id', DEV_USER_ID);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('subscriptions')
      .insert(payload);
    if (error) throw error;
  }

  return { success: true };
};

export const deleteSubscription = async (id: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', DEV_USER_ID);

  if (error) throw error;
  return { success: true };
};

export const savePaymentMethod = async (
  method: Partial<PaymentMethod> & { id?: string }
): Promise<{ success: boolean }> => {
  const isEdit = !!method.id && !method.id.startsWith('temp-');

  const payload = {
    user_id: DEV_USER_ID,
    name: method.name!,
    type: method.type ?? 'Tarjeta',
    is_active: method.isActive ?? true,
    notes: method.notes ?? '',
  };

  if (isEdit) {
    const { error } = await supabase
      .from('payment_methods')
      .update(payload)
      .eq('id', method.id!)
      .eq('user_id', DEV_USER_ID);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('payment_methods')
      .insert(payload);
    if (error) throw error;
  }

  return { success: true };
};

export const deletePaymentMethod = async (id: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id)
    .eq('user_id', DEV_USER_ID);

  if (error) throw error;
  return { success: true };
};

export const togglePaymentMethodActive = async (
  id: string,
  isActive: boolean
): Promise<{ success: boolean }> => {
  const { error } = await (supabase
    .from('payment_methods')
    .update({ is_active: isActive } as any)
    .eq('id', id)
    .eq('user_id', DEV_USER_ID) as any);

  if (error) throw error;
  return { success: true };
};

export const clearAllLocalData = async (): Promise<{ success: boolean }> => {
  // En modo dev, solo limpia las settings locales.
  // Con auth activo, esto haría sign-out + limpieza.
  localStorage.removeItem('subzero_settings');
  return { success: true };
};
