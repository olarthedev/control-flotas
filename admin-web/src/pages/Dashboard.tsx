import { StatCard } from "../components/StatCard";
import { FaDollarSign, FaExclamationTriangle, FaTruck } from "react-icons/fa";

export const Dashboard = () => {
  return (
    <div className="space-y-6">


      <div className="grid grid-cols-3 gap-6">

        <StatCard
          title="Gastos Operativos"
          value="$1,335,000"
          icon={<FaDollarSign />}
          badge="+8%"
          badgeColor="red"
        />

        <StatCard
          title="Pendientes Revisión"
          value="2"
          icon={<FaExclamationTriangle />}
          badge="Bajo"
          badgeColor="yellow"
        />

        <StatCard
          title="Vehículos Activos"
          value="2"
          icon={<FaTruck />}
          badge="Operativo"
          badgeColor="green"
        />

      </div>
    </div>
  );
};