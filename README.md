# 🚚 Control de Flotas

Sistema de **gestión y control de flotas vehiculares**, desarrollado para administrar vehículos, usuarios y operaciones asociadas, con una arquitectura backend moderna, escalable y mantenible.

Este proyecto está construido con **NestJS**, usando **TypeORM** para la persistencia de datos y siguiendo buenas prácticas de desarrollo backend.

---

## 🧠 Descripción general

**Control de Flotas** es una aplicación backend que permite:

- Gestionar vehículos de una flota
- Administrar usuarios del sistema
- Estructurar el proyecto por módulos
- Facilitar la escalabilidad y el mantenimiento del sistema

Ideal para proyectos empresariales, académicos o como base para un sistema más robusto de logística o transporte.

---

## 🛠️ Tecnologías utilizadas

- **Node.js**
- **NestJS**
- **TypeScript**
- **TypeORM**
- **PostgreSQL / MySQL** (configurable)
- **Git & GitHub**


---

## 📁 Estructura del proyecto

```bash
control-flotas/
│
├── backend/
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── entities/
│   │   ├── vehicles/
│   │   │   ├── vehicles.module.ts
│   │   │   ├── vehicles.controller.ts
│   │   │   ├── vehicles.service.ts
│   │   │   └── entities/
│   │   └── main.ts
│   ├── package.json
│   └── package-lock.json
│
└── README.md

  
