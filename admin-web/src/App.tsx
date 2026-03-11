import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { VehiclesPage } from "./pages/Vehicles";
import { DriversPage } from "./pages/Drivers";
import { VehicleExpensesDetailPage } from "./pages/VehicleExpensesDetailPage";
import { MaintenancePage } from "./pages/Maintenance";
import { SettingsPage } from "./pages/Settings";
import { AdvancedSettingsPage } from "./pages/AdvancedSettings";
import { NotificationsPage } from "./pages/Notifications";
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
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/advanced" element={<AdvancedSettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;