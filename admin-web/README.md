# Panel de Administración — LogiControl

Aplicación web para la gestión integral de la flota. Permite a administradores y supervisores revisar gastos, auditar recibos, gestionar conductores, vehículos y registros de mantenimiento en tiempo real.

---

## Stack

| Tecnología        | Versión | Rol                              |
|-------------------|---------|----------------------------------|
| React             | 19      | Framework UI                     |
| TypeScript        | 5.9     | Lenguaje                         |
| Vite              | 7       | Build tool y dev server          |
| Tailwind CSS      | 4       | Estilos utilitarios              |
| Axios             | 1.13    | Cliente HTTP                     |
| React Router DOM  | 7       | Enrutamiento SPA                 |
| Recharts          | 3       | Gráficas y visualizaciones       |
| Framer Motion     | 12      | Animaciones                      |
| Lottie React      | 2.4     | Animación de carga               |

---

## Requisitos

- Node.js >= 18
- Backend corriendo en `http://localhost:3001`
- Archivo `admin-web/.env.local` configurado

---

## Variables de entorno

Crear `admin-web/.env.local`:

```env
VITE_API_URL=http://localhost:3001
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=info
```

El prefijo `VITE_` es obligatorio para que Vite exponga la variable al bundle del navegador. Nunca almacenar secretos ni API keys aquí.

---

## Instalación y arranque

```bash
cd admin-web
npm install
npm run dev
```

Disponible en `http://localhost:5173`.

```bash
# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

---

## Rutas de la aplicación

| Ruta                          | Página               | Descripción                                      |
|-------------------------------|----------------------|--------------------------------------------------|
| `/`                           | Dashboard            | KPIs, tendencia semanal, distribución de gastos  |
| `/expenses`                   | Control de gastos    | Gastos por vehículo, auditoría por semana        |
| `/maintenance`                | Mantenimiento        | Historial técnico, registro de intervenciones    |
| `/drivers`                    | Conductores          | Gestión de conductores y asignación de vehículos |
| `/drivers/liquidation`        | Liquidaciones        | Liquidación semanal por conductor                |
| `/vehicles`                   | Vehículos            | Flota vehicular, estado documental               |
| `/consignments`               | Consignaciones       | Adelantos de dinero                              |
| `/notifications`              | Notificaciones       | Alertas del sistema                              |
| `/settings`                   | Configuración        | Preferencias de usuario                          |
| `/settings/advanced`          | Config. avanzada     | Parámetros del sistema                           |

---

## Estructura del proyecto

```
src/
├── App.tsx                    # Raíz de la app: routing y loading screen
├── main.tsx                   # Bootstrap, tema, punto de entrada
│
├── config/
│   └── api.ts                 # URL base y endpoints centralizados
│
├── pages/                     # Una carpeta por vista principal
│   ├── Dashboard.tsx
│   ├── Vehicles.tsx
│   ├── Drivers.tsx
│   ├── Maintenance.tsx        # Registro y gestión de mantenimientos
│   ├── VehicleExpensesDetailPage.tsx  # Gastos por ruta y semana
│   ├── DriverLiquidationPage.tsx
│   ├── Notifications.tsx
│   ├── Settings.tsx
│   ├── AdvancedSettings.tsx
│   └── expenses-week.utils.ts # Utilidades de agrupación semanal
│
├── components/
│   ├── layout/
│   │   ├── Layout.tsx         # Shell: sidebar + topbar + contenido
│   │   └── PageHeader.tsx     # Breadcrumbs + título + acciones
│   ├── expenses/
│   │   ├── ExpenseAuditModal.tsx
│   │   ├── ExpenseCard.tsx
│   │   ├── ExpenseFilters.tsx
│   │   └── VehicleExpenseCard.tsx
│   ├── LoadingAnimation.tsx   # Pantalla de carga inicial (Lottie)
│   ├── Toast.tsx
│   └── ExportButton.tsx
│
├── services/                  # Clientes HTTP — una función por endpoint
│   ├── expenses.service.ts
│   ├── expenses-grouped.service.ts
│   ├── vehicles.service.ts
│   ├── drivers.service.ts
│   ├── consignments.service.ts
│   ├── maintenance.service.ts
│   └── dashboard.service.ts
│
├── layout/
│   └── Layout.tsx
│
├── utils/
│   └── api-error.ts           # Normalización de errores HTTP
│
└── theme/                     # Tokens de diseño
```

---

## Convenciones

**Servicios** — cada archivo en `services/` exporta funciones asíncronas que hacen exactamente una llamada HTTP. No contienen lógica de negocio ni estado.

**Páginas** — gestionan estado local con `useState`/`useEffect` y orquestan llamadas a servicios. No hacen fetch directamente con axios.

**Componentes** — reciben datos por props, nunca llaman a servicios directamente.

**Variables de entorno** — toda URL o parámetro de configuración va en `.env.local` y se lee desde `src/config/api.ts`. Nunca hardcodeada en servicios o componentes.

---

## Tipos de enums (espejo del backend)

```typescript
// expenses.service.ts
ExpenseStatus: 'pending' | 'approved' | 'rejected'
ExpenseType:   'fuel' | 'toll' | 'maintenance' | 'food' | 'lodging' | 'parking' | 'other'

// maintenance.service.ts
MaintenanceType:   'preventive' | 'corrective' | 'emergency'
MaintenanceStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
```

Los valores en minúscula corresponden exactamente a los ENUMs de PostgreSQL definidos en el backend.
