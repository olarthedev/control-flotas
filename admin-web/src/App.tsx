import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { VehiclesPage } from "./pages/Vehicles";
import { DriversPage } from "./pages/Drivers";

// Placeholder components for other pages
const Reports = () => <div className="p-6"><h1 className="text-[16px] font-semibold tracking-tight">Reportes</h1></div>;
const Expenses = () => <div className="p-6"><h1 className="text-[16px] font-semibold tracking-tight">Gastos</h1></div>;
const Consignments = () => <div className="p-6"><h1 className="text-[16px] font-semibold tracking-tight">Consignaciones</h1></div>;
const Maintenance = () => <div className="p-6"><h1 className="text-[16px] font-semibold tracking-tight">Mantenimiento</h1></div>;
const Notifications = () => <div className="p-6"><h1 className="text-[16px] font-semibold tracking-tight">Notificaciones</h1></div>;
const Settings = () => <div className="p-6"><h1 className="text-[16px] font-semibold tracking-tight">Configuración</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/consignments" element={<Consignments />} />
          <Route path="/maintenance" element={<Maintenance />} />
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