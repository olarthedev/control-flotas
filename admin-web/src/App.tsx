import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingAnimation } from "./components/LoadingAnimation";
import { Layout } from "./layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { VehiclesPage } from "./pages/Vehicles";
import { DriversPage } from "./pages/Drivers";
import { DriverLiquidationPage } from "./pages/DriverLiquidationPage";
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
const LOADER_FADE_OUT_MS = 320;

function App() {
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [canCloseLoader, setCanCloseLoader] = useState(false);
  const [hasCompletedLoop, setHasCompletedLoop] = useState(false);
  const [isClosingLoader, setIsClosingLoader] = useState(false);

  useEffect(() => {
    if (!isBootLoading || canCloseLoader) {
      return;
    }

    const loadingStart = Date.now();
    let minTimerId: ReturnType<typeof setTimeout> | null = null;
    let fallbackTimerId: ReturnType<typeof setTimeout> | null = null;
    let minElapsed = false;
    let pageLoaded = false;

    const tryEnableClose = () => {
      if (minElapsed && pageLoaded) {
        setCanCloseLoader(true);
      }
    };

    const finishBootLoading = () => {
      const elapsed = Date.now() - loadingStart;
      const remaining = Math.max(0, MIN_BOOT_LOADING_MS - elapsed);
      minTimerId = setTimeout(() => {
        minElapsed = true;
        tryEnableClose();
      }, remaining);

      fallbackTimerId = setTimeout(() => {
        setCanCloseLoader(true);
      }, remaining + 3500);
    };

    const onWindowLoaded = () => {
      pageLoaded = true;
      tryEnableClose();
    };

    if (document.readyState === "complete") {
      pageLoaded = true;
      finishBootLoading();
      tryEnableClose();
    } else {
      window.addEventListener("load", finishBootLoading, { once: true });
      window.addEventListener("load", onWindowLoaded, { once: true });
    }

    return () => {
      window.removeEventListener("load", finishBootLoading);
      window.removeEventListener("load", onWindowLoaded);
      if (minTimerId) {
        clearTimeout(minTimerId);
      }
      if (fallbackTimerId) {
        clearTimeout(fallbackTimerId);
      }
    };
  }, [canCloseLoader, isBootLoading]);

  useEffect(() => {
    if (!isBootLoading || !canCloseLoader || !hasCompletedLoop || isClosingLoader) {
      return;
    }

    setIsClosingLoader(true);
  }, [canCloseLoader, hasCompletedLoop, isBootLoading, isClosingLoader]);

  useEffect(() => {
    if (!isBootLoading || !isClosingLoader) {
      return;
    }

    const closeTimerId = setTimeout(() => {
      setIsBootLoading(false);
    }, LOADER_FADE_OUT_MS);

    return () => {
      clearTimeout(closeTimerId);
    };
  }, [isBootLoading, isClosingLoader]);

  if (isBootLoading) {
    return (
      <div className={`fixed inset-0 z-[9999] bg-white transition-opacity duration-300 ${isClosingLoader ? "opacity-0" : "opacity-100"}`}>
        <LoadingAnimation
          message="Cargando panel..."
          className="h-full border-0 bg-white"
          animationClassName="mx-auto h-36 w-72"
          speed={1.35}
          onLoopComplete={() => setHasCompletedLoop(true)}
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
          <Route path="/drivers/liquidation" element={<DriverLiquidationPage />} />
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