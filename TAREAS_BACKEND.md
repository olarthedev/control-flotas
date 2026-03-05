# 📝 Tareas de Backend - Control Flotas

**Prioridad:** 🔴 CRÍTICA  
**Impacto:** El frontend Ya está listo para conectarse a estos endpoints

---

## 1. 🚨 ENDPOINTS CRÍTICOS A IMPLEMENTAR

### 1.1 Dashboard Summary Endpoint

**Ruta:** `GET /dashboard/summary`  
**Descripción:** Calcula y retorna todos los valores que se muestran en el dashboard

**Response esperado:**

```json
{
  "totalConsigned": 3500000,
  "totalApproved": 1335000,
  "balance": 2165000,
  "pendingCount": 2,
  "trends": {
    "consigned": 12,
    "approved": -8
  }
}
```

**Lógica del backend:**

- `totalConsigned`: SUM de todas las consignaciones con status ACTIVE del mes actual
- `totalApproved`: SUM de gastos con status APPROVED del mes actual
- `balance`: totalConsigned - totalApproved
- `pendingCount`: COUNT de gastos con status PENDING
- `trends.consigned`: Comparación % entre este mes vs mes anterior
- `trends.approved`: Comparación % entre este mes vs mes anterior

**Ubicación:** `backend/src/dashboard/` (crear nuevo módulo)

```bash
# Comando para generar el módulo
nest generate module dashboard
nest generate controller dashboard
nest generate service dashboard
```

---

### 1.2 Expenses Summary by Vehicle Endpoint

**Ruta:** `GET /expenses/summary/by-vehicle`  
**Descripción:** Retorna resumen de gastos agrupados por vehículo (actualmente el frontend lo calcula)

**Response esperado:**

```json
[
  {
    "vehicleId": 1,
    "licensePlate": "ABC-123",
    "brand": "Toyota",
    "model": "Hiace",
    "driverId": 5,
    "driverName": "Juan Pérez",
    "totalExpenses": 5000000,
    "monthlyTotal": 2500000,
    "pendingCount": 3,
    "approvedCount": 8,
    "observedCount": 1,
    "rejectedCount": 0,
    "lastExpenseDate": "2026-03-05T10:30:00Z"
  }
]
```

**Ventaja:** El frontend deja de hacer cálculos, es mucho más eficiente

**Ubicación:** `backend/src/expenses/expenses.service.ts` - Agregar método `summaryByVehicle()`

---

## 2. ⚠️ MEJORAS DE SEGURIDAD

### 2.1 Endpoint de Cambio de Contraseña

**Ruta:** `PATCH /users/:id/change-password`

**Body esperado:**

```json
{
  "currentPassword": "password_actual",
  "newPassword": "password_nuevo"
}
```

**Lógica:**

- Validar que el usuario actual sea el propietario o admin
- Verificar que currentPassword sea correcto
- Encriptar newPassword
- No retornar la contraseña bajo ningún concepto

**Nota:** El frontend ya NO enviará password en la creación/edición de conductor,
solo durante el cambio de contraseña.

---

## 3. 📊 OPTIMIZACIONES DE QUERY

### 3.1 Paginación en /expenses

**Agregar query params:**

```
GET /expenses?page=1&limit=50&sortBy=date&order=desc
```

**Reduce carga del servidor y frontend cuando hay miles de registros**

### 3.2 Filtros en /expenses/vehicle/:vehicleId

```
GET /expenses/vehicle/1?status=PENDING&dateFrom=2026-03-01&dateTo=2026-03-31
```

---

## 4. 🔐 VALIDACIONES ADICIONALES

### Middleware de Validación

Agregar validación en los DTOs del backend:

```typescript
// src/expenses/dto/update-expense.dto.ts
import { IsEnum, IsNumber, Min, Max } from "class-validator";

export class UpdateExpenseDto {
  @IsEnum(["APPROVED", "PENDING", "OBSERVED", "REJECTED"])
  status?: string;

  @IsNumber()
  @Min(0)
  @Max(10000000) // Máximo permitido
  amount?: number;
}
```

### Rate Limiting

- Limitar requests por IP/usuario
- Evitar abuso
- Especialmente en endpoints de write (POST, PATCH, DELETE)

---

## 5. 📋 CHECKLIST PARA BACKEND

```
Dashboard:
- [ ] Crear módulo dashboard
- [ ] Implementar GET /dashboard/summary
- [ ] Testear con datos reales
- [ ] Validar comparativas de tendencias

Expenses:
- [ ] Agregar GET /expenses/summary/by-vehicle
- [ ] Agregar paginación a GET /expenses
- [ ] Agregar filtros (status, fecha, etc.)
- [ ] Optimizar queries (considerar índices en BD)

Security:
- [ ] Agregar PATCH /users/:id/change-password
- [ ] Remover password de response de GET /users/:id
- [ ] Validar con DTOs en todos los endpoints
- [ ] Rate limiting en endpoints críticos

Testing:
- [ ] Tests para /dashboard/summary
- [ ] Tests para /expenses/summary/by-vehicle
- [ ] Tests de error handling
- [ ] Tests de autorización

Performance:
- [ ] Agregar índices en BD (vehicle_id, driver_id, status, date)
- [ ] Considerar cacheing (Redis) para dashboard
- [ ] Optimizar queries con JOINs eficientes
```

---

## 6. 🚀 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

### Fase 1 (Hoy/Mañana)

1. Dashboard Summary endpoint
2. Expenses Summary by Vehicle endpoint
3. Change Password endpoint
4. Remover passwords de responses

### Fase 2 (Esta semana)

5. Agregar validaciones con class-validator
6. Agregar paginación
7. Agregar filtros
8. Tests básicos

### Fase 3 (Próximas semanas)

9. Rate limiting
10. Cacheing
11. Optimizaciones de índices
12. Tests exhaustivos

---

## 7. 📞 NOTAS IMPORTANTES

✅ **El frontend ya está LISTO:**

- Dashboard espera `/dashboard/summary`
- Servicios usan configuración centralizada
- Sin datos quemados
- Sin lógica de negocio pesada

⚠️ **Por ahora el frontend:**

- Mostrará valores 0 si los endpoints no existen
- Continuará funcionando sin errores
- Fallbacks graceful para UX

❌ **NO HACER EN BACKEND:**

- No encriptar/desencriptar datos que el frontend envía
- No guardar contraseñas en response JSON
- No confiar en validación del frontend (siempre validar en backend)

---

## 8. 👀 EJEMPLO: Dashboard Summary en NestJS

```typescript
// src/dashboard/dashboard.controller.ts
import { Controller, Get } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  async getSummary() {
    return this.dashboardService.calculateSummary();
  }
}

// src/dashboard/dashboard.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Consignment } from "../consignments/consignment.entity";
import { Expense } from "../expenses/expense.entity";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Consignment)
    private consignmentsRepo: Repository<Consignment>,
    @InjectRepository(Expense)
    private expensesRepo: Repository<Expense>,
  ) {}

  async calculateSummary() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    // Consignaciones este mes
    const totalConsigned = await this.consignmentsRepo.sum(
      "amount",
      (builder) => {
        builder
          .andWhere("status = :status", { status: "ACTIVE" })
          .andWhere("consignmentDate >= :date", { date: firstDayOfMonth });
      },
    );

    // Gastos aprobados este mes
    const totalApproved = await this.expensesRepo.sum("amount", (builder) => {
      builder
        .andWhere("status = :status", { status: "APPROVED" })
        .andWhere("expenseDate >= :date", { date: firstDayOfMonth });
    });

    // Gastos pendientes
    const pendingCount = await this.expensesRepo.count({
      where: { status: "PENDING" },
    });

    // Tendencias (comparar con mes anterior)
    // ... lógica similar para mes anterior

    return {
      totalConsigned,
      totalApproved,
      balance: totalConsigned - totalApproved,
      pendingCount,
      trends: {
        consigned: 12, // % cambio
        approved: -8, // % cambio
      },
    };
  }
}
```

---

**Generado:** 5 de Marzo 2026  
**Requiere:** Acción inmediata del equipo backend
