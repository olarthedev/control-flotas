import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { Dashboard } from "./pages/Dashboard";

// Placeholder components for other pages
const Reports = () => <div className="p-6"><h1 className="text-2xl font-bold">Reportes</h1></div>;
const Expenses = () => <div className="p-6"><h1 className="text-2xl font-bold">Gastos</h1></div>;
const Consignments = () => <div className="p-6"><h1 className="text-2xl font-bold">Consignaciones</h1></div>;
const Maintenance = () => <div className="p-6"><h1 className="text-2xl font-bold">Mantenimiento</h1></div>;
const Drivers = () => <div className="p-6"><h1 className="text-2xl font-bold">Conductores</h1></div>;
const Vehicles = () => <div className="p-6"><h1 className="text-2xl font-bold">Vehículos</h1></div>;
const Notifications = () => <div className="p-6"><h1 className="text-2xl font-bold">Notificaciones</h1></div>;
const Settings = () => <div className="p-6"><h1 className="text-2xl font-bold">Configuración</h1></div>;

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
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;