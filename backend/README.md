# Backend — LogiControl API

API REST del sistema de control de flotas. Construida con NestJS y TypeORM sobre PostgreSQL. Expone todos los endpoints que consume el panel web y la app móvil.

---

## Stack

| Tecnología          | Version  | Rol                              |
|---------------------|----------|----------------------------------|
| Node.js             | >= 18    | Runtime                          |
| NestJS              | 11       | Framework HTTP                   |
| TypeScript          | 5.7      | Lenguaje                         |
| TypeORM             | 0.3      | ORM y mapeo de entidades         |
| PostgreSQL           | >= 14    | Base de datos                    |
| class-validator     | 0.14     | Validación de DTOs               |
| bcrypt              | 6        | Hash de contraseñas              |
| Swagger             | 11       | Documentación de la API          |

---

## Requisitos

- Node.js >= 18
- PostgreSQL >= 14 corriendo localmente o en red
- Archivo `backend/.env` configurado (ver sección Variables de entorno)

---

## Variables de entorno

Crear el archivo `backend/.env` con:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=control_flotas
```

---

## Instalación

```bash
cd backend
npm install
```

---

## Comandos

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Linting
npm run lint
```

El servidor arranca en `http://localhost:3001`.  
Swagger disponible en `http://localhost:3001/api`.

---

## Base de datos

### Aplicar esquema desde cero

```bash
# Requiere que .env esté configurado
node scripts/apply-database-schema.js
```

Este script elimina y recrea la base de datos `control_flotas` aplicando el esquema de `database_nueva.sql`.

### Configuración TypeORM

La conexión se configura en `src/orm/` y usa las variables del `.env`. El modo `synchronize` está desactivado en producción; el esquema se gestiona con el archivo SQL.

---

## Estructura de módulos

```
src/
├── app.module.ts               # Módulo raíz, importa todos los módulos
├── main.ts                     # Bootstrap, CORS, ValidationPipe, Swagger
│
├── users/                      # Usuarios y conductores
│   ├── user.entity.ts          # Entidad: admin, driver, supervisor, accountant
│   ├── users.service.ts        # CRUD + asignación de vehículos
│   ├── users.controller.ts     # Endpoints REST
│   ├── user-vehicle-history.entity.ts
│   ├── user-bank-account.entity.ts
│   └── dto/
│
├── vehicles/                   # Flota vehicular
│   ├── vehicle.entity.ts
│   ├── vehicles.service.ts
│   ├── vehicles.controller.ts
│   └── dto/
│
├── trips/                      # Viajes y rutas
│   ├── trip.entity.ts
│   ├── trips.service.ts        # Incluye completeTrip()
│   ├── trips.controller.ts
│   └── dto/
│
├── consignments/               # Adelantos de dinero al conductor
│   ├── consignment.entity.ts   # balance = GENERATED ALWAYS (automático)
│   ├── consignments.service.ts # closeConsignment(), closeDriverActiveConsignments()
│   ├── consignments.controller.ts
│   └── dto/
│
├── expenses/                   # Gastos reportados
│   ├── expense.entity.ts
│   ├── expenses.service.ts     # summaryByVehicle(), getDriverLiquidation()
│   ├── expenses.controller.ts
│   └── dto/
│
├── evidence/                   # Archivos de evidencia
│   ├── evidence.entity.ts
│   ├── evidence.service.ts
│   ├── evidence.controller.ts
│   └── dto/
│
├── maintenance/                # Mantenimientos de vehículos
│   ├── maintenance-record.entity.ts
│   ├── maintenance.service.ts  # completeMaintenanceRecord()
│   ├── maintenance.controller.ts
│   └── dto/
│
├── dashboard/                  # Métricas agregadas
│   ├── domain/
│   └── infrastructure/         # TypeORM read repository
│
└── orm/                        # Configuración TypeORM
    └── snake-naming.strategy.ts
```

---

## Endpoints principales

### Usuarios `GET /users`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | /users | Listar todos |
| GET    | /users/drivers | Solo conductores |
| GET    | /users/drivers/summaries | Resumen de tarjetas |
| GET    | /users/:id | Detalle |
| POST   | /users | Crear usuario |
| PATCH  | /users/:id | Actualizar |
| DELETE | /users/:id | Eliminar |
| PATCH  | /users/:id/assign-vehicle | Asignar vehículo |

### Gastos `GET /expenses`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | /expenses | Listar con filtros y paginación |
| GET    | /expenses/pending | Solo pendientes |
| GET    | /expenses/summary/by-vehicle | Resumen agrupado |
| GET    | /expenses/vehicle/:id | Por vehículo |
| GET    | /expenses/driver/:id | Por conductor |
| POST   | /expenses | Registrar gasto |
| PATCH  | /expenses/:id | Actualizar / auditar |

### Dashboard `GET /dashboard`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | /dashboard/summary | KPIs principales |
| GET    | /dashboard/weekly-trend | Tendencia semanal |
| GET    | /dashboard/expense-distribution | Distribución por tipo |

---

## Modelos de datos (enums)

```typescript
UserRole:          admin | driver | supervisor | accountant
TripStatus:        planned | in_progress | completed | cancelled
ConsignmentStatus: open | closed | pending_approval
ConsignmentPurpose: trip_advance | salary_advance
ExpenseType:       fuel | toll | maintenance | food | lodging | parking | other
ExpenseStatus:     pending | approved | rejected
MaintenanceType:   preventive | corrective | emergency
MaintenanceStatus: scheduled | in_progress | completed | cancelled
DocumentType:      soat | technical_review | insurance
```

---

## Convenciones

- Nombres de columnas en `snake_case` (estrategia configurada en TypeORM)
- Todas las rutas respetan REST: sustantivos en plural, verbos HTTP para acciones
- Validación en todos los DTOs con `class-validator`
- Contraseñas hasheadas con bcrypt (factor 10) antes de persistir
- `balance` en consignaciones es una columna `GENERATED ALWAYS AS` — nunca se escribe manualmente
