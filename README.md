# LogiControl — Sistema de Control de Flotas

Sistema integral para la gestión operativa y financiera de flotas de carga. Permite administrar vehículos, conductores, viajes, consignaciones de dinero, gastos y mantenimientos desde una plataforma web de administración y una aplicación móvil para conductores.

---

## Arquitectura

```
┌─────────────────────┐     HTTP/REST     ┌──────────────────────┐
│   admin-web          │ ──────────────── │   backend             │
│   React + Vite       │                  │   NestJS + TypeORM    │
│   Panel de gestión   │                  │   API REST            │
│   :5173              │                  │   :3001               │
└─────────────────────┘                   └──────────┬───────────┘
                                                      │ SQL
┌─────────────────────┐     HTTP/REST                 ▼
│   mobile             │ ──────────────── ┌──────────────────────┐
│   Flutter            │                  │   PostgreSQL          │
│   App para conductor │                  │   control_flotas DB   │
└─────────────────────┘                   └──────────────────────┘
```

Cada capa es independiente y se comunica exclusivamente a través de la API REST. El frontend y la app móvil no tienen acceso directo a la base de datos.

---

## Módulos del proyecto

| Directorio   | Tecnología         | Rol                                                   |
|--------------|--------------------|-------------------------------------------------------|
| `backend/`   | NestJS + TypeORM   | API REST, lógica de negocio, acceso a base de datos   |
| `admin-web/` | React + Vite       | Panel web de administración (gestor/supervisor)       |
| `mobile/`    | Flutter            | App móvil para conductores (registro de gastos)       |

---

## Stack tecnológico

**Backend**
- Node.js + NestJS
- TypeScript
- TypeORM
- PostgreSQL
- class-validator / class-transformer

**Frontend (admin-web)**
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Axios
- Recharts
- React Router DOM 7

**Mobile**
- Flutter / Dart
- Material Design 3

---

## Requisitos previos

- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14
- Flutter >= 3.11 (solo para mobile)
- Git

---

## Instalación y arranque

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd control-flotas
```

### 2. Configurar la base de datos

Crear la base de datos y aplicar el esquema:

```bash
# Crear la BD en PostgreSQL
psql -U postgres -c "CREATE DATABASE control_flotas;"

# O usar el script incluido (requiere .env en backend/)
cd backend
node scripts/apply-database-schema.js
```

El esquema completo está en [`database_nueva.sql`](./database_nueva.sql).

### 3. Configurar variables de entorno

**Backend** — crear `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=control_flotas
```

**Frontend** — crear `admin-web/.env.local`:
```env
VITE_API_URL=http://localhost:3001
VITE_ENVIRONMENT=development
```

### 4. Instalar dependencias y arrancar

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run start:dev

# Terminal 2 — Frontend
cd admin-web
npm install
npm run dev
```

**URLs de acceso:**

| Servicio   | URL                       |
|------------|---------------------------|
| Panel web  | http://localhost:5173     |
| API REST   | http://localhost:3001     |
| Swagger    | http://localhost:3001/api |

---

## Estructura del repositorio

```
control-flotas/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── consignments/ # Consignaciones de dinero
│   │   ├── dashboard/    # Métricas y resúmenes
│   │   ├── expenses/     # Gastos de viaje
│   │   ├── evidence/     # Evidencias fotográficas
│   │   ├── maintenance/  # Registros de mantenimiento
│   │   ├── trips/        # Viajes
│   │   ├── users/        # Usuarios y conductores
│   │   └── vehicles/     # Vehículos de la flota
│   ├── scripts/
│   │   └── apply-database-schema.js
│   └── .env              # Variables de entorno (no subir a git)
│
├── admin-web/            # Panel web React
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── config/       # Configuración de API
│   │   ├── pages/        # Páginas de la aplicación
│   │   └── services/     # Clientes HTTP hacia el backend
│   └── .env.local        # Variables de entorno (no subir a git)
│
├── mobile/               # App Flutter para conductores
│   └── lib/
│       └── src/
│           ├── screens/  # Pantallas
│           ├── widgets/  # Componentes UI
│           └── theme/    # Tema y estilos
│
├── database_nueva.sql    # Esquema actual de la base de datos
└── database_vieja.sql    # Esquema anterior (referencia histórica)
```

---

## Base de datos

El esquema vive en [`database_nueva.sql`](./database_nueva.sql) e incluye:

| Tabla                  | Descripción                              |
|------------------------|------------------------------------------|
| `users`                | Usuarios: admin, driver, supervisor, accountant |
| `vehicles`             | Vehículos de la flota                    |
| `user_vehicle_history` | Historial de asignaciones conductor-vehículo |
| `user_bank_accounts`   | Cuentas bancarias cifradas               |
| `trips`                | Viajes y rutas                           |
| `consignments`         | Adelantos de dinero entregados al conductor |
| `expenses`             | Gastos reportados durante el viaje       |
| `evidence`             | Archivos de evidencia de cada gasto      |
| `maintenance_records`  | Historial de mantenimientos              |
| `document_alerts`      | Alertas de vencimiento documental        |

---

## Documentación por módulo

- [Backend — README](./backend/README.md)
- [Panel web — README](./admin-web/README.md)
- [App móvil — README](./mobile/README.md)
