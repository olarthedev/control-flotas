import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingAnimation } from "./components/LoadingAnimation";
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

const MIN_BOOT_LOADING_MS = 1500;

function isPageReload(): boolean {
  const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;

  if (navigationEntry) {
    return navigationEntry.type === "reload";
  }

  const legacyNavigation = (performance as Performance & { navigation?: { type?: number } }).navigation;
  return legacyNavigation?.type === 1;
}

function App() {
  const [isBootLoading, setIsBootLoading] = useState(isPageReload());

  useEffect(() => {
    if (!isBootLoading) {
      return;
    }

    const loadingStart = Date.now();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const finishBootLoading = () => {
      const elapsed = Date.now() - loadingStart;
      const remaining = Math.max(0, MIN_BOOT_LOADING_MS - elapsed);
      timeoutId = setTimeout(() => {
        setIsBootLoading(false);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finishBootLoading();
    } else {
      window.addEventListener("load", finishBootLoading, { once: true });
    }

    return () => {
      window.removeEventListener("load", finishBootLoading);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isBootLoading]);

  if (isBootLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white">
        <LoadingAnimation
          message="Cargando panel..."
          className="h-full border-0 bg-white"
          animationClassName="mx-auto h-36 w-72"
        />
      </div>
    );
  }

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