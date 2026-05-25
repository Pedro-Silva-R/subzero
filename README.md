# SubZero ❄️

**SubZero** es un gestor de suscripciones moderno, premium y minimalista, con un diseño estético Neobrutalista. Permite realizar un seguimiento exhaustivo de tus gastos fijos mensuales y anuales, gestionar métodos de pago y automatizar alertas para suscripciones que no utilizas (Zombies) o periodos de prueba (Trials) por vencer.

---

## 🚀 Características Principales

- **Resumen Financiero Dinámico:** Visualiza el compromiso mensual y su equivalente anual en tiempo real.
- **Desglose de Gastos Integrado:** Separa lo que pagas tú de lo que compartes con tu pareja o tu familia.
- **Alertas Inteligentes:**
  - **Pruebas (Trials):** Controla los días restantes de tus suscripciones de prueba.
  - **Zombies:** Identifica suscripciones inactivas o poco usadas para cancelarlas a tiempo.
  - **Tarjetas Activas:** Gestión de métodos de pago activos.
- **Próximos Cobros:** Cronograma ordenado de tus futuros pagos automatizados.
- **Métodos de Pago:** Registra tus tarjetas de crédito, débito o cuentas para asociarlas a cada suscripción.
- **Soporte Multilingüe y Temas:** Configuración completa de idioma y tema (claro/oscuro/sistema) mediante `SettingsContext`.

---

## 🛠️ Stack Tecnológico

- **Core:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador & Servidor de Desarrollo:** [Vite 6](https://vite.dev/)
- **Enrutamiento:** [React Router v7](https://reactrouter.com/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) + Neobrutalism Design System
- **UI & Iconos:** [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/)
- **Base de Datos & Autenticación:** [Supabase](https://supabase.com/)
- **Notificaciones:** [Sonner](https://erraticgenerator.com/sonner/)

---

## 📦 Instalación y Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Prerrequisitos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) y el gestor de paquetes **pnpm**:
```bash
npm install -g pnpm
```

### 2. Clonar e Instalar Dependencias
Clona el repositorio (o accede a la carpeta) e instala las dependencias necesarias:
```bash
pnpm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Supabase (puedes guiarte con tu base de datos o usar los datos locales para desarrollo):
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
VITE_DEV_USER_ID=tu-id-de-usuario-de-prueba
```

> [!WARNING]
> El archivo `.env.local` está configurado en el `.gitignore` para no ser subido a GitHub por motivos de seguridad. Nunca compartas tus llaves privadas de producción.

### 4. Iniciar Servidor de Desarrollo
Inicia el servidor local:
```bash
pnpm dev
```
Abre [http://localhost:5173](http://localhost:5173) en tu navegador para ver la aplicación ejecutándose.

---

## 🗄️ Esquema de Base de Datos (Supabase)

El proyecto utiliza dos tablas principales en PostgreSQL dentro de Supabase:

1. **`payment_methods` (Métodos de Pago):**
   - `id` (`uuid`, PK)
   - `user_id` (`uuid`, FK -> `auth.users`)
   - `name` (`text`)
   - `type` (`text`)
   - `is_active` (`boolean`)
   - `notes` (`text`)
   
2. **`subscriptions` (Suscripciones):**
   - `id` (`uuid`, PK)
   - `user_id` (`uuid`, FK -> `auth.users`)
   - `name` (`text`)
   - `category` (`text`)
   - `amount` (`numeric`)
   - `currency` (`text`)
   - `cycle` (`text` -> Mensual/Anual)
   - `status` (`text` -> ACTIVA, TRIAL, ZOMBIE, PAUSADA)
   - `next_charge_date` (`date`)
   - `payment_method_id` (`uuid`, FK -> `payment_methods.id`)
   - `shared_with` (`text[]` -> Array de personas)
   - `notes` (`text`)
   - `price_history` (`jsonb`)

*Para ver el esquema completo de SQL y políticas de RLS recomendadas, revisa el archivo [supabase_schema.md](file:///d:/Dise%C3%B1o%20Web/Suscripciones/SubZero/supabase_schema.md).*

---

## 🌐 Despliegue en Vercel

Para desplegar este proyecto en **Vercel** usando tu integración de GitHub:

1. Sube tu código a GitHub (ya configurado en la rama `main`).
2. Ve a tu panel de **Vercel** y haz clic en **Add New -> Project**.
3. Importa el repositorio `subzero`.
4. Vercel detectará la configuración de **Vite** automáticamente.
5. Agrega tus variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.) en la sección **Environment Variables**.
6. Haz clic en **Deploy**.
