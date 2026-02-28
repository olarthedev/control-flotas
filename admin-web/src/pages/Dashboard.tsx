import { FaFileAlt, FaDollarSign, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { DashboardTopBar } from '../components/dashboard/TopBar';
import { IntelligenceAlert } from '../components/dashboard/IntelligenceAlert';
import { StatCard } from '../components/dashboard/StatCard';
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import { ExpenseDistributionChart } from '../components/dashboard/ExpenseDistributionChart';

export const Dashboard = () => {
  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <DashboardTopBar />

      {/* Intelligence Alert */}
      <IntelligenceAlert />

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Consignado"
          value="$3,500.000"
          icon={FaFileAlt}
          trend="+12%"
          trendColor="green"
        />
        <StatCard
          title="Gastos Operativos"
          value="$1.335.000"
          icon={FaDollarSign}
          trend="-8%"
          trendColor="red"
        />
        <StatCard
          title="Saldo en Flota"
          value="$2,165.000"
          icon={FaChartLine}
          badge="Saludable"
          badgeColor="green"
        />
        <StatCard
          title="Pendientes Revisión"
          value="2"
          icon={FaExclamationTriangle}
          badge="Bajo"
          badgeColor="yellow"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-4">
        <WeeklyTrendChart />
        <ExpenseDistributionChart />
      </div>
    </div>
  );
};