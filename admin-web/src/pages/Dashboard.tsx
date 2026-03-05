import { useEffect, useState } from 'react';
import { FaFileAlt, FaDollarSign, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { DashboardTopBar } from '../components/dashboard/TopBar';
import { IntelligenceAlert } from '../components/dashboard/IntelligenceAlert';
import { StatCard } from '../components/dashboard/StatCard';
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import { ExpenseDistributionChart } from '../components/dashboard/ExpenseDistributionChart';
import { fetchDashboardSummary, type DashboardSummary } from '../services/dashboard.service';

export const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchTerm = (searchParams.get('q') ?? '').trim().toLowerCase();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (error) {
        console.error('Error loading dashboard summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, []);

  const formatCurrency = (value: number): string => {
    return `$${Math.round(value).toLocaleString('es-CO')}`;
  };

  const statCards = summary ? [
    {
      title: 'Total Consignado',
      value: formatCurrency(summary.totalConsigned),
      icon: FaFileAlt,
      trend: `${summary.trends.consigned >= 0 ? '+' : ''}${summary.trends.consigned}%`,
      trendColor: summary.trends.consigned >= 0 ? ('green' as const) : ('red' as const),
    },
    {
      title: 'Gastos Aprobados',
      value: formatCurrency(summary.totalApproved),
      icon: FaDollarSign,
      trend: `${summary.trends.approved >= 0 ? '+' : ''}${summary.trends.approved}%`,
      trendColor: summary.trends.approved >= 0 ? ('green' as const) : ('red' as const),
    },
    {
      title: 'Saldo en Flota',
      value: formatCurrency(summary.balance),
      icon: FaChartLine,
      badge: summary.balance >= 0 ? 'Saludable' : 'Crítico',
      badgeColor: summary.balance >= 0 ? ('green' as const) : ('red' as const),
    },
    {
      title: 'Pendientes Revisión',
      value: summary.pendingCount.toString(),
      icon: FaExclamationTriangle,
      badge: summary.pendingCount <= 5 ? 'Bajo' : summary.pendingCount <= 15 ? 'Medio' : 'Alto',
      badgeColor: summary.pendingCount <= 5 ? ('green' as const) : summary.pendingCount <= 15 ? ('yellow' as const) : ('red' as const),
    },
  ] : [];

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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-16">
          <div className="space-y-2 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#5848f4]" />
            <p className="text-sm text-slate-500">Cargando resumen...</p>
          </div>
        </div>
      )}

      {/* Intelligence Alert */}
      {!isLoading && showAlert && <IntelligenceAlert />}


      {/* Stats Grid */}
      {!isLoading && filteredStatCards.length > 0 && (
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