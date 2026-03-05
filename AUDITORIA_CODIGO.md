# 🔍 Auditoría de Código - Control Flotas

**Fecha:** 5 de Marzo 2026  
**Estado:** ⚠️ CRÍTICO - Requiere correcciones inmediatas

---

## 1. 🚨 PROBLEMAS CRÍTICOS

### 1.1 Dashboard con Datos Quemados (Hardcoded)

**Archivo:** `admin-web/src/pages/Dashboard.tsx`  
**Severidad:** 🔴 CRÍTICA

```tsx
const statCards = [
  { title: "Total Consignado", value: "$3,500.000" }, // ❌ Dato quemado
  { title: "Gastos Operativos", value: "$1.335.000" }, // ❌ Dato quemado
  { title: "Saldo en Flota", value: "$2,165.000" }, // ❌ Dato quemado
  { title: "Pendientes Revisión", value: "2" }, // ❌ Dato quemado
];
```

**Problema:** El dashboard muestra valores ficticios.  
**Solución:** Crear endpoint en backend que calcule y retorne estos valores.

---

### 1.2 Lógica de Agregación en el Frontend

**Archivo:** `admin-web/src/services/expenses-grouped.service.ts`  
**Severidad:** 🔴 CRÍTICA

El frontend está haciendo:

- ✅ Agrupación por vehículo
- ✅ Cálculo de totales mensuales
- ✅ Conteo de estados (PENDING, APPROVED, etc.)
- ✅ Sorting por fecha

```tsx
// ❌ ESTO DEBE ESTAR EN EL BACKEND
allExpenses.forEach((expense) => {
  // Cálculos complejos...
  summary.monthlyTotal += expenseAmount;
  if (expenseDate >= firstDayOfMonth) { ... }
});
```

**Problema:**

- Sobrecarga del navegador si hay miles de gastos
- Lógica de negocio en el frontend
- Difícil de mantener

**Solución:** Crear endpoint backend:

```
GET /expenses/summary/by-vehicle
→ Retorna VehicleExpenseSummary[] pre-calculado
```

---

### 1.3 Manejo de Passwords en el Frontend

**Archivo:** `admin-web/src/components/drivers/DriverModal.tsx`  
**Severidad:** 🔴 CRÍTICA (aunque está en tránsito)

```tsx
export interface DriverFormData {
  id?: number;
  fullName: string;
  password?: string; // ❌ Riesgo de exposición
}
```

**Problema:**

- Aunque se envía al backend, mostrar campos de password en el frontend es problemático
- El password podría quedar en el localStorage/sessionStorage
- Precisa de HTTPS para ser seguro

**Solución:**

- Backend genera contraseña temporal
- Frontend solo recibe token/confirmación
- Contraseña se envía por email al conductor

---

### 1.4 Vehículos con Datos Duplicados

**Archivo:** `admin-web/src/services/vehicles.service.ts`  
**Severidad:** 🟠 MEDIA

Los vehículos se obtienen correctamente de la DB, pero el VehicleExpenseSummary
tiene información duplicada (licenseplate, brand, model, driver info).

---

## 2. ⚠️ PROBLEMAS DE ARQUITECTURA

### 2.1 Múltiples API_BASE_URL

**Archivos:**

- `expenses.service.ts`
- `vehicles.service.ts`
- `consignments.service.ts`
- `expenses-grouped.service.ts`
- `drivers.service.ts`

**Problema:** URL hardcodeada en cada servicio

```tsx
const API_BASE_URL = "http://localhost:3001"; // ❌ Duplicado 5 veces
```

**Solución:** Crear un archivo de configuración:

```tsx
// config/api.ts
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001";
```

---

### 2.2 Falta de Ambiente Configuración

**Severidad:** 🟠 MEDIA

No hay archivo `.env.example` o `.env.local`

**Solución:** Crear:

```
# .env.example
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

---

## 3. 🔐 SEGURIDAD

### 3.1 ✅ Buen: Conexión HTTPS en Producción

El código usa `http://localhost:3001` solo en desarrollo.

### 3.2 ❌ Malo: Sin Validación de Entrada

El frontend no valida datos antes de enviar al backend.

**Ejemplo problematic:**

```tsx
const amount = parseFloat(consignmentAmount); // ❌ Sin validación
if (Number.isNaN(amount) || amount <= 0) {
  // ✅ Solo revisa NaN
  // pero no revisa máximo, mínimo, decimales, etc.
}
```

---

## 4. 📊 PROBLEMAS ESPECÍFICOS POR SECCIÓN

### 4.1 Gastos (Expenses)

| Aspecto          | Estado     | Detalle                    |
| ---------------- | ---------- | -------------------------- |
| Conexión a BD    | ✅ OK      | Getea correctamente de API |
| Filtros          | ✅ OK      | Funcionan bien en frontend |
| **Agregaciones** | ❌ CRÍTICO | Deben ser en backend       |
| **Dashboard**    | ❌ CRÍTICO | Datos quemados             |

### 4.2 Vehículos (Vehicles)

| Aspecto       | Estado     | Detalle                                              |
| ------------- | ---------- | ---------------------------------------------------- |
| Conexión a BD | ✅ OK      | CRUD funcional                                       |
| Datos         | ⚠️ REVISAR | No hay vehículos "quemados", pero verificar cantidad |
| Cálculos      | ✅ OK      | Mantenimiento calculado correctamente                |

### 4.3 Conductores (Drivers)

| Aspecto       | Estado     | Detalle                        |
| ------------- | ---------- | ------------------------------ |
| Conexión a BD | ✅ OK      | CRUD funcional                 |
| **Passwords** | ❌ CRÍTICO | No deben manejarse en frontend |
| Permisos      | ⚠️ ????    | No vemos autenticación         |

### 4.4 Consignaciones (Consignments)

| Aspecto       | Estado    | Detalle             |
| ------------- | --------- | ------------------- |
| Conexión a BD | ✅ OK     | Recién implementado |
| Modal         | ✅ OK     | Funciona bien       |
| Validación    | ⚠️ BÁSICA | Solo valida NaN y 0 |

---

## 5. 🛠️ TAREAS DE CORRECCIÓN

### PRIORIDAD 1 (Inmediato)

- [ ] **Backend:** Crear endpoint `GET /dashboard/summary`

  ```
  Retorna:
  {
    totalConsigned: number,
    totalApproved: number,
    balance: number,
    pendingCount: number,
    trends: { consigned: number, approved: number }
  }
  ```

- [ ] **Backend:** Crear endpoint `GET /expenses/summary/by-vehicle`

  ```
  Retorna: VehicleExpenseSummary[] (precalculado)
  Quita lógica del frontend
  ```

- [ ] **Frontend:** Actualizar Dashboard para usar datos reales
  - Consume el endpoint `/dashboard/summary`
  - Elimina datos quemados

- [ ] **Backend:** Endpoint para cambio de password

  ```
  POST /drivers/:id/change-password
  Body: { currentPassword, newPassword }
  ```

- [ ] **Frontend:** Remover campo password de DriverModal
  - Solo permitir cambio de contraseña en página separada
  - Requiere autenticación

### PRIORIDAD 2 (Esta semana)

- [ ] **Frontend:** Crear archivo de configuración centralizado
- [ ] **Frontend:** Agregar validaciones más robustas
- [ ] **Backend:** Documentar todos los endpoints
- [ ] **Backend:** Agregar paginación a endpoints de listado
- [ ] **Tests:** Crear tests para servicios

### PRIORIDAD 3 (Próximas semanas)

- [ ] **Frontend:** Implementar cacheing con React Query
- [ ] **Backend:** Agregar rate limiting
- [ ] **Seguridad:** Implementar roles y permisos
- [ ] **Monitoreo:** Agregar logging

---

## 6. 📋 CHECKLIST DE CORRECCIONES

```
Frontend:
- [ ] Dashboard usa datos reales (no hardcoded)
- [ ] Sin API_BASE_URL duplicadas
- [ ] Sin validaciones de lógica de negocio compleja
- [ ] Sin passwords hardcodeados
- [ ] Sin secretos/API keys en el código

Backend:
- [ ] Dashboard summary precalculado
- [ ] Expenses grouping/summary optimizado
- [ ] Validación robusta de entrada
- [ ] Paginación donde sea necesario
- [ ] Tests de endpoints críticos

Seguridad:
- [ ] HTTPS en producción
- [ ] CORS configurado correctamente
- [ ] Rate limiting en endpoints
- [ ] Validación de JWT tokens
- [ ] Sin logs expuestos publicamente
```

---

## 7. 📞 PRÓXIMOS PASOS

1. **Revisar** este documento con el equipo
2. **Priorizar** las correcciones según urgencia
3. **Crear issues** en el proyecto para cada tarea
4. **Asignar** responsables
5. **Establecer** fecha de entrega para Priority 1

---

**Generado por:** Auditoría automática  
**Requiere acción:** ✅ SÍ  
**Riesgo:** 🔴 ALTO - Especialmente en datos y seguridad
