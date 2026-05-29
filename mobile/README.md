# App Móvil — LogiControl

Aplicación Flutter para conductores de la flota. Permite registrar gastos en tiempo real durante los viajes, consultar el balance de consignaciones, adjuntar evidencias fotográficas y recibir notificaciones del sistema.

---

## Stack

| Tecnología    | Versión  | Rol                         |
|---------------|----------|-----------------------------|
| Flutter       | >= 3.11  | Framework UI multiplataforma|
| Dart          | >= 3.0   | Lenguaje                    |
| Material 3    | —        | Sistema de diseño           |

Plataformas objetivo: Android e iOS.

---

## Requisitos

- Flutter SDK >= 3.11
- Android Studio o Xcode según plataforma objetivo
- Dispositivo físico o emulador/simulador
- Backend corriendo y accesible desde el dispositivo

---

## Instalación

```bash
cd mobile
flutter pub get
```

---

## Comandos

```bash
# Ejecutar en dispositivo conectado o emulador
flutter run

# Build Android
flutter build apk --release

# Build iOS
flutter build ios --release

# Tests
flutter test

# Análisis de código
flutter analyze
```

---

## Pantallas

| Pantalla              | Archivo                          | Descripción                                      |
|-----------------------|----------------------------------|--------------------------------------------------|
| Home                  | `screens/home_screen.dart`       | Balance actual, resumen de la semana, accesos rápidos |
| Gastos                | `screens/expenses_screen.dart`   | Lista de gastos del viaje activo, registro nuevo |
| Notificaciones        | `screens/notifications_screen.dart` | Alertas de saldo, aprobaciones y rechazos     |
| Perfil                | `screens/profile_screen.dart`    | Datos del conductor, vehículo asignado           |

---

## Estructura del proyecto

```
lib/
├── main.dart                      # Punto de entrada, inicialización del tema
└── src/
    ├── app.dart                   # MaterialApp, rutas, tema global
    ├── screens/
    │   ├── home_screen.dart
    │   ├── expenses_screen.dart
    │   ├── notifications_screen.dart
    │   └── profile_screen.dart
    ├── widgets/
    │   ├── advance_card.dart      # Tarjeta de anticipo/consignación
    │   ├── balance_card.dart      # Saldo disponible
    │   ├── bottom_nav_bar.dart    # Barra de navegación inferior
    │   ├── expense_card.dart      # Tarjeta de gasto individual
    │   ├── notification_card.dart # Tarjeta de notificación
    │   ├── recent_expenses_card.dart
    │   └── section_header.dart
    └── theme/
        └── app_theme.dart         # Colores, tipografía, ThemeData
```

---

## Conexión con el backend

La app se comunica con el backend via HTTP REST en la misma URL base que el panel web. La URL del backend debe configurarse antes del build según el entorno (desarrollo/producción).

Ejemplo de configuración en `lib/src/config/api_config.dart` (crear si no existe):

```dart
class ApiConfig {
  static const String baseUrl = 'http://192.168.x.x:3001'; // IP local en desarrollo
}
```

En producción reemplazar con la URL del servidor desplegado.

---

## Flujo principal del conductor

1. El conductor inicia la app y ve su balance y viaje activo
2. Durante el viaje registra cada gasto con monto, tipo y foto del recibo
3. Los gastos quedan en estado `pending` hasta ser auditados desde el panel web
4. El conductor recibe notificación cuando un gasto es aprobado o rechazado
5. Al cerrar el viaje, el sistema calcula la liquidación final
