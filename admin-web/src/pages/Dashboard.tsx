import { useEffect, useState } from 'react';
import { FaFileAlt, FaDollarSign, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { DashboardTopBar } from '../components/dashboard/TopBar';
import { IntelligenceAlert } from '../components/dashboard/IntelligenceAlert';
import { StatCard } from '../components/dashboard/StatCard';
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import { ExpenseDistributionChart } from '../components/dashboard/ExpenseDistributionChart';
import {
  fetchDashboardSummary,
  fetchExpenseDistribution,
  fetchWeeklyTrend,
  type DashboardSummary,
  type ExpenseDistributionPoint,
  type WeeklyTrendPoint,
} from '../services/dashboard.service';
import { getApiErrorMessage } from '../utils/api-error';

export const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendPoint[]>([]);
  const [distribution, setDistribution] = useState<ExpenseDistributionPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const searchTerm = (searchParams.get('q') ?? '').trim().toLowerCase();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true);
        const [summaryResult, weeklyTrendResult, distributionResult] = await Promise.allSettled([
          fetchDashboardSummary(),
          fetchWeeklyTrend(),
          fetchExpenseDistribution(),
        ]);
        let nextError: string | null = null;

        if (summaryResult.status === 'fulfilled') {
          setSummary(summaryResult.value);
        } else {
          nextError ??= getApiErrorMessage(summaryResult.reason, 'No se pudo cargar el resumen del dashboard.');
          setSummary(null);
        }

        if (weeklyTrendResult.status === 'fulfilled') {
          setWeeklyTrend(weeklyTrendResult.value);
        } else {
          nextError ??= getApiErrorMessage(weeklyTrendResult.reason, 'No se pudo cargar la tendencia semanal.');
          setWeeklyTrend([]);
        }

        if (distributionResult.status === 'fulfilled') {
          setDistribution(distributionResult.value);
        } else {
          nextError ??= getApiErrorMessage(distributionResult.reason, 'No se pudo cargar la distribución de gastos.');
          setDistribution([]);
        }

        setLoadError(nextError);
      } catch (error) {
        setLoadError(getApiErrorMessage(error, 'No se pudo cargar la información del dashboard.'));
        setSummary(null);
        setWeeklyTrend([]);
        setDistribution([]);
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

  const topDistribution = distribution[0];
  const alertTitle = 'Sugerencia de inteligencia logistica';
  const alertMessage = summary
    ? summary.pendingCount > 0
      ? `Hay ${summary.pendingCount} gasto(s) pendiente(s) por revisar. Prioriza la validacion para mantener el flujo financiero al dia.`
      : summary.balance < 0
        ? `La flota tiene un balance negativo de ${formatCurrency(Math.abs(summary.balance))}. Revisa consignaciones o gastos atipicos del mes.`
        : topDistribution
          ? `${topDistribution.name} representa ${topDistribution.percentage}% del gasto aprobado. Revisa oportunidades de optimizacion en este rubro.`
          : 'No hay alertas criticas. El comportamiento financiero de la flota se mantiene estable.'
    : 'No hay alertas disponibles por el momento.';

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
      {!isLoading && showAlert && <IntelligenceAlert title={alertTitle} message={alertMessage} />}

      {!isLoading && loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}


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
          {showWeeklyChart && <WeeklyTrendChart data={weeklyTrend} />}
          {showDistributionChart && <ExpenseDistributionChart data={distribution} />}
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