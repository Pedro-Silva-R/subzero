# SubZero ❄️

[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

**SubZero** es un gestor de suscripciones moderno, premium y minimalista, con un diseño estético Neobrutalista. Resuelve la complejidad de rastrear gastos recurrentes permitiendo monitorear tus compromisos mensuales y anuales, gestionar múltiples métodos de pago y automatizar alertas para suscripciones que no utilizas (Zombies) o periodos de prueba (Trials) por vencer, separando además los gastos personales de los compartidos.

---

## 🚀 Características Principales

- **Resumen Financiero Dinámico:** Monitoreo instantáneo del compromiso mensual y equivalente anual en tiempo real.
- **Desglose de Gastos Integrado:** Clasificación automática de gastos personales (`Yo`), en pareja o familiares.
- **Alertas Inteligentes:**
  - **Pruebas (Trials):** Control detallado de días restantes en periodos de prueba.
  - **Inactivos (Zombies):** Identificación automática de suscripciones poco utilizadas para evitar cobros no deseados.
  - **Métodos de Pago:** Detección de tarjetas y cuentas activas asociadas.
- **Próximos Cobros:** Cronograma ordenado cronológicamente con los futuros cargos.
- **Gestión de Métodos de Pago:** Registro y actualización de múltiples tarjetas o cuentas bancarias.
- **Soporte Multilingüe y Temas:** Configuración completa de idioma (español/inglés) y tema (claro/oscuro/sistema).

---

## 📂 Estructura del Proyecto

```text
SubZero/
├── src/
│   ├── app/
│   │   ├── components/       # Componentes de la interfaz de usuario (Home, Settings, etc.)
│   │   │   └── ui/           # Componentes base reutilizables (Radix / shadcn)
│   │   ├── context/          # Contextos de estado global (Autenticación, Configuración)
│   │   ├── data/             # Datos simulados (mockData) para fallback
│   │   ├── services/         # Servicios de obtención y cálculo de datos (dataService)
│   │   ├── App.tsx           # Componente raíz del árbol de React
│   │   └── routes.ts         # Definición de rutas y navegación
│   ├── imports/              # Plantillas y layouts importados como base
│   ├── lib/                  # Clientes e inicializaciones de APIs (Supabase, tipos)
│   ├── styles/               # Estilos globales y configuración de variables CSS
│   └── main.tsx              # Punto de entrada de la aplicación Vite
├── package.json              # Definición de dependencias y scripts de ejecución
├── supabase_schema.md        # Esquema y políticas RLS propuestas para PostgreSQL
├── tsconfig.json             # Configuración del compilador TypeScript
└── vite.config.ts            # Configuración de compilación y plugins de Vite
```

---

## 🛠️ Requisitos Previos

- **Node.js:** Versión 18 o superior recomendada.
- **Gestor de Paquetes:** [pnpm](https://pnpm.io/) (utilizado en el espacio de trabajo).

---

## 💻 Instalación y Uso

Sigue estos pasos para levantar la aplicación en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Pedro-Silva-R/subzero.git
cd subzero
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto para enlazar tu base de datos de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
VITE_DEV_USER_ID=tu-id-de-usuario-de-prueba
```

### 4. Iniciar servidor de desarrollo
```bash
pnpm dev
```
La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

### 5. Compilar para producción
Para compilar y optimizar la aplicación para su distribución:
```bash
pnpm build
```
Los archivos optimizados se generarán en la carpeta `dist/`.
