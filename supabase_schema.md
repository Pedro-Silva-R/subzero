# Esquema de Base de Datos para Supabase

Basado en el modelo de datos actual de la aplicación (tipos `Subscription` y `PaymentMethod`), esta es la estructura relacional recomendada para desplegar en PostgreSQL usando Supabase.

## Tablas Principales

### 1. `payment_methods` (Métodos de Pago)
Esta tabla almacena las tarjetas y cuentas bancarias. 

*Nota: Las variables `subscriptionsCount` y `monthlyTotal` que ves en el código local **no deben guardarse en la base de datos**. Son valores calculados que el Frontend computa dinámicamente.*

| Columna | Tipo de Dato (Supabase) | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key**, autogenerado (`uuid_generate_v4()`). |
| `user_id` | `uuid` | **Foreign Key** apuntando a `auth.users` (para separar los datos por usuario). |
| `name` | `text` | Ej: "VISA ****1234". Requerido. |
| `type` | `text` | Ej: "Tarjeta", "Cuenta bancaria", "Otro". |
| `is_active` | `boolean` | Por defecto: `true`. |
| `notes` | `text` | Opcional, permite nulos. |
| `created_at` | `timestampz` | Fecha de creación, autogenerado (`now()`). |

---

### 2. `subscriptions` (Suscripciones)
La tabla central de la aplicación.

| Columna | Tipo de Dato (Supabase) | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` | **Primary Key**, autogenerado (`uuid_generate_v4()`). |
| `user_id` | `uuid` | **Foreign Key** apuntando a `auth.users`. |
| `name` | `text` | Ej: "Netflix". Requerido. |
| `category` | `text` | Ej: "Streaming", "Música". |
| `amount` | `integer` o `numeric`| Recomiendo `integer` si manejas CLP sin decimales, o `numeric` para USD. |
| `currency` | `text` | Ej: "CLP", "USD". |
| `cycle` | `text` | Ej: "Mensual", "Anual". |
| `status` | `text` | Ej: "ACTIVA", "PAUSADA", "TRIAL", "ZOMBIE". |
| `next_charge_date`| `date` | Fecha del próximo cobro. |
| `signup_date` | `date` | Fecha en la que el usuario contrató el servicio. |
| `payment_method_id`| `uuid` | **Foreign Key** apuntando a `payment_methods.id`. |
| `is_trial` | `boolean` | Por defecto: `false`. |
| `trial_end_date` | `date` | Opcional, permite nulos. |
| `shared_with` | `text[]` | Array de textos nativo de Postgres (ej: `{"Yo", "Pareja"}`). |
| `payment_notes` | `text` | Opcional. |
| `notes` | `text` | Opcional. |
| `price_history` | `jsonb` | Arreglo JSON. Postgres maneja el JSONB de forma increíblemente eficiente. |
| `created_at` | `timestampz` | Autogenerado (`now()`). |

---

## Recomendaciones Arquitectónicas

> [!IMPORTANT]
> **Cambio de la Relación de Métodos de Pago**
> Actualmente en tu código Frontend, la suscripción guarda el nombre literal de la tarjeta (`paymentMethod: 'VISA ****1234'`). Cuando migres a Supabase, esta columna se cambiará por `payment_method_id` y guardará el **UUID** de la tarjeta. De este modo, si editas el nombre de la tarjeta, se reflejará automáticamente en todas las suscripciones asociadas.

> [!TIP]
> **Row Level Security (RLS)**
> En Supabase, asegúrate de habilitar **RLS** en ambas tablas apenas las crees. Añadirás una política (Policy) que diga: `(auth.uid() = user_id)`. Esto garantizará que, aunque la base de datos esté expuesta, un usuario solo pueda leer, editar y eliminar **sus propios** métodos de pago y suscripciones.

> [!NOTE]
> **El Historial de Precios (`price_history`)**
> Mantener el historial de precios como una columna `jsonb` es la solución más limpia y rápida para esta etapa del proyecto. Si en el futuro necesitas realizar cálculos matemáticos complejos directamente con SQL sobre todo el historial (analítica avanzada), recién ahí convendría separarlo en una tercera tabla (`price_histories`). Por ahora, `jsonb` es perfecto.
