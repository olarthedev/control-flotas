import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { VehiclesPage } from "./pages/Vehicles";
import { DriversPage } from "./pages/Drivers";
import { VehicleExpensesDetailPage } from "./pages/VehicleExpensesDetailPage";
import { MaintenancePage } from "./pages/Maintenance";
import { PageHeader } from "./components/layout/PageHeader";

// Placeholder components for other pages
const Reports = () => (
  <PageHeader
    breadcrumbs={[{ label: "Inicio", to: "/" }, { label: "Centro de reportes" }]}
    title="Centro de reportes"
    subtitle="Explora indicadores financieros y operativos para evaluar rendimiento y detectar oportunidades de mejora."
  />
);

const Consignments = () => (
  <PageHeader
    breadcrumbs={[{ label: "Inicio", to: "/" }, { label: "Consignaciones" }]}
    title="Consignaciones"
    subtitle="Controla transferencias, cruces y estados de consignación para mantener trazabilidad financiera completa."
  />
);

const Notifications = () => (
  <PageHeader
    breadcrumbs={[{ label: "Inicio", to: "/" }, { label: "Notificaciones" }]}
    title="Notificaciones"
    subtitle="Consulta alertas relevantes del sistema para actuar rápido frente a eventos críticos de operación."
  />
);

const Settings = () => (
  <PageHeader
    breadcrumbs={[{ label: "Inicio", to: "/" }, { label: "Configuración" }]}
    title="Configuración"
    subtitle="Administra parámetros clave de plataforma, usuarios y reglas para adaptar el sistema a tu operación."
  />
);

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/expenses" element={<VehicleExpensesDetailPage />} />
          <Route path="/consignments" element={<Consignments />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;