import { FaFileAlt, FaDollarSign, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { DashboardTopBar } from '../components/dashboard/TopBar';
import { IntelligenceAlert } from '../components/dashboard/IntelligenceAlert';
import { StatCard } from '../components/dashboard/StatCard';
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import { ExpenseDistributionChart } from '../components/dashboard/ExpenseDistributionChart';

export const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = (searchParams.get('q') ?? '').trim().toLowerCase();

  const statCards = [
    {
      title: 'Total Consignado',
      value: '$3,500.000',
      icon: FaFileAlt,
      trend: '+12%',
      trendColor: 'green' as const,
    },
    {
      title: 'Gastos Operativos',
      value: '$1.335.000',
      icon: FaDollarSign,
      trend: '-8%',
      trendColor: 'red' as const,
    },
    {
      title: 'Saldo en Flota',
      value: '$2,165.000',
      icon: FaChartLine,
      badge: 'Saludable',
      badgeColor: 'green' as const,
    },
    {
      title: 'Pendientes Revisión',
      value: '2',
      icon: FaExclamationTriangle,
      badge: 'Bajo',
      badgeColor: 'yellow' as const,
    },
  ];

  const filteredStatCards = statCards.filter((card) => {
    if (!searchTerm) return true;
    return card.title.toLowerCase().includes(searchTerm);
  });

  const showAlert = !searchTerm || 'alerta inteligencia ia'.includes(searchTerm);
  const showWeeklyChart = !searchTerm || 'tendencia semanal'.includes(searchTerm);
  const showDistributionChart = !searchTerm || 'distribucion gastos'.includes(searchTerm);
  const hasAnyResult = filteredStatCards.length > 0 || showAlert || showWeeklyChart || showDistributionChart;

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <DashboardTopBar />

      {/* Intelligence Alert */}
      {showAlert && <IntelligenceAlert />}


      {/* Stats Grid */}
      {filteredStatCards.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {filteredStatCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              trend={card.trend}
              trendColor={card.trendColor}
              badge={card.badge}
              badgeColor={card.badgeColor}
            />
          ))}
        </div>
      )}

      {/* Charts Grid */}
      {(showWeeklyChart || showDistributionChart) && (
        <div className="grid grid-cols-2 gap-4">
          {showWeeklyChart && <WeeklyTrendChart />}
          {showDistributionChart && <ExpenseDistributionChart />}
        </div>
      )}

      {!hasAnyResult && (
        <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-12">
          <p className="text-sm text-slate-500">No hay resultados para “{searchParams.get('q')}”</p>
        </div>
      )}
    </div >
  );
};