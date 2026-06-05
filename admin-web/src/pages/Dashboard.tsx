import { useEffect, useState } from 'react';
import { FileText, DollarSign, TrendingUp, Clock } from 'lucide-react';
import {
    fetchDashboardSummary,
    fetchExpenseDistribution,
    fetchWeeklyTrend,
    type DashboardSummary,
    type ExpenseDistributionPoint,
    type WeeklyTrendPoint,
} from '../services/dashboard.service';
import { fetchAllVehiclesWithExpensesSummary, type VehicleExpenseSummary } from '../services/expenses-grouped.service';
import { fetchMaintenanceRecords, type MaintenanceRecord } from '../services/maintenance.service';
import { fetchDriverSummaries, type DriverSummary } from '../services/drivers.service';
import { fetchVehicles, type VehicleCardData } from '../services/vehicles.service';

import { DashboardTopBar } from '../components/dashboard/TopBar';
import { StatCard } from '../components/dashboard/StatCard';
import { AlertsPanel, type DashboardAlert } from '../components/dashboard/AlertsPanel';
import { ExpenseDistributionChart } from '../components/dashboard/ExpenseDistributionChart';
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import { FleetStatusWidget } from '../components/dashboard/FleetStatusWidget';
import { MaintenanceListWidget } from '../components/dashboard/MaintenanceListWidget';
import { DriverAttentionWidget } from '../components/dashboard/DriverAttentionWidget';
import { TopVehiclesWidget } from '../components/dashboard/TopVehiclesWidget';
import { formatCurrency } from '../utils/format';

function buildSparkline(trend: number, points = 7): { v: number }[] {
    const base = 80;
    const end  = base * (1 + trend / 100);
    return Array.from({ length: points }, (_, i) => {
        const t    = i / (points - 1);
        const ease = t * t * (3 - 2 * t);
        const noise = Math.sin(i * 2.4) * 3;
        return { v: Math.max(0, base + (end - base) * ease + noise) };
    });
}

function buildAlerts(
    summary:     DashboardSummary | null,
    vehicles:    VehicleCardData[],
    maintenance: MaintenanceRecord[],
): DashboardAlert[] {
    const alerts: DashboardAlert[] = [];

    vehicles.forEach(v => {
        if (v.soatStatus === 'Vencido') {
            alerts.push({
                id:          `soat-${v.id}`,
                severity:    'critical',
                title:       `SOAT vencido — ${v.plate}`,
                description: 'La unidad no puede operar legalmente hasta renovar el seguro obligatorio.',
                iconType:    'shield',
            });
        }
        if (v.tecnoStatus === 'Vencido') {
            alerts.push({
                id:          `tecno-${v.id}`,
                severity:    'critical',
                title:       `Tecnomecánica vencida — ${v.plate}`,
                description: 'La unidad no puede operar legalmente hasta renovar la revisión técnica.',
                iconType:    'shield',
            });
        }
    });

    if (summary && summary.balance < 0) {
        alerts.push({
            id:          'negative-balance',
            severity:    'critical',
            title:       'Saldo de flota negativo',
            description: `El balance consolidado está en ${formatCurrency(summary.balance)} esta semana.`,
            iconType:    'activity',
        });
    }

    if (summary && summary.pendingCount > 0) {
        alerts.push({
            id:          'pending-expenses',
            severity:    summary.pendingCount > 10 ? 'high' : 'medium',
            title:       `${summary.pendingCount} gastos pendientes por aprobar`,
            description: 'Hay registros con más de 24h sin validar que requieren revisión.',
            iconType:    'receipt',
        });
    }

    maintenance
        .filter(r => r.status === 'in_progress')
        .slice(0, 2)
        .forEach(r => {
            alerts.push({
                id:          `maint-${r.id}`,
                severity:    r.type === 'emergency' ? 'high' : 'medium',
                title:       r.title,
                description: `${r.vehicle.licensePlate} en taller${r.cost > 0 ? ` — costo estimado ${formatCurrency(r.cost)}` : ''}.`,
                iconType:    'wrench',
            });
        });

    return alerts.slice(0, 6);
}

export const Dashboard = () => {
    const [summary,      setSummary]      = useState<DashboardSummary | null>(null);
    const [weeklyTrend,  setWeeklyTrend]  = useState<WeeklyTrendPoint[]>([]);
    const [distribution, setDistribution] = useState<ExpenseDistributionPoint[]>([]);
    const [vehicleSummaries, setVehicleSummaries] = useState<VehicleExpenseSummary[]>([]);
    const [vehicleCards,     setVehicleCards]      = useState<VehicleCardData[]>([]);
    const [maintenance,  setMaintenance]  = useState<MaintenanceRecord[]>([]);
    const [drivers,      setDrivers]      = useState<DriverSummary[]>([]);
    const [isLoading,    setIsLoading]    = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const [s, w, d, vs, vc, m, dr] = await Promise.allSettled([
                fetchDashboardSummary(),
                fetchWeeklyTrend(),
                fetchExpenseDistribution(),
                fetchAllVehiclesWithExpensesSummary(),
                fetchVehicles(),
                fetchMaintenanceRecords(),
                fetchDriverSummaries(),
            ]);

            if (s.status  === 'fulfilled') setSummary(s.value);
            if (w.status  === 'fulfilled') setWeeklyTrend(w.value);
            if (d.status  === 'fulfilled') setDistribution(d.value);
            if (vs.status === 'fulfilled') setVehicleSummaries(vs.value);
            if (vc.status === 'fulfilled') setVehicleCards(vc.value);
            if (m.status  === 'fulfilled') setMaintenance(m.value);
            if (dr.status === 'fulfilled') setDrivers(dr.value);

            setIsLoading(false);
        };
        load();
    }, []);

    const alerts = buildAlerts(summary, vehicleCards, maintenance);

    const inWorkshopIds = new Set(
        maintenance.filter(r => r.status === 'in_progress').map(r => r.vehicle.id),
    );
    const activeCount    = vehicleSummaries.filter(v => v.driverId !== -1 && !inWorkshopIds.has(v.vehicleId)).length;
    const inWorkshopCount = inWorkshopIds.size;
    const inactiveCount  = vehicleSummaries.filter(v => v.driverId === -1 && !inWorkshopIds.has(v.vehicleId)).length;

    const documentAlerts = vehicleCards.filter(v => v.soatStatus === 'Vencido' || v.tecnoStatus === 'Vencido').length;

    const upcomingMaintenance = maintenance
        .filter(r => r.status === 'scheduled' || r.status === 'in_progress')
        .sort((a, b) => new Date(a.maintenanceDate).getTime() - new Date(b.maintenanceDate).getTime());

    const driversNeedingAttention = drivers
        .filter(d => Number(d.pendingBalance) > 0)
        .sort((a, b) => Number(b.pendingBalance) - Number(a.pendingBalance));

    const topVehicles = [...vehicleSummaries]
        .sort((a, b) => b.totalExpenses - a.totalExpenses);

    const consignadoTrend = summary?.trends.consigned ?? 0;
    const approvedTrend   = summary?.trends.approved  ?? 0;

    const kpiCards = summary ? [
        {
            title:         'Total Consignado',
            value:         formatCurrency(summary.totalConsigned),
            icon:          FileText,
            trend:         consignadoTrend,
            sparklineData: buildSparkline(consignadoTrend),
            sparklineColor: '#5B5CEB',
        },
        {
            title:         'Gastos Aprobados',
            value:         formatCurrency(summary.totalApproved),
            icon:          DollarSign,
            trend:         approvedTrend,
            sparklineData: buildSparkline(approvedTrend),
            sparklineColor: '#5B5CEB',
        },
        {
            title:         'Saldo en Flota',
            value:         formatCurrency(summary.balance),
            icon:          TrendingUp,
            badge:         summary.balance >= 0 ? 'Saludable' : 'Crítico',
            badgeColor:    (summary.balance >= 0 ? 'green' : 'red') as 'green' | 'red',
            sparklineData: buildSparkline(approvedTrend * (summary.balance < 0 ? -1 : 1)),
            sparklineColor: summary.balance >= 0 ? '#10B981' : '#E05A5A',
        },
        {
            title:      'Pendientes Revisión',
            value:      summary.pendingCount.toString(),
            icon:       Clock,
            badge:      summary.pendingCount <= 5 ? 'Bajo' : summary.pendingCount <= 15 ? 'Medio' : 'Alto',
            badgeColor: (summary.pendingCount <= 5 ? 'green' : summary.pendingCount <= 15 ? 'yellow' : 'red') as 'green' | 'yellow' | 'red',
            valueNote:  'gastos sin validar',
        },
    ] : [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <DashboardTopBar />
                <div className="grid grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-36 animate-pulse rounded-2xl border bg-white" style={{ borderColor: 'var(--card-border)' }} />
                    ))}
                </div>
                <div className="mt-6 grid grid-cols-12 gap-6">
                    <div className="col-span-7 h-64 animate-pulse rounded-2xl border bg-white" style={{ borderColor: 'var(--card-border)' }} />
                    <div className="col-span-5 h-64 animate-pulse rounded-2xl border bg-white" style={{ borderColor: 'var(--card-border)' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <DashboardTopBar />

            {/* Row 1: KPI cards */}
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {kpiCards.map(card => (
                    <StatCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        trend={card.trend}
                        badge={card.badge}
                        badgeColor={card.badgeColor}
                        sparklineData={card.sparklineData}
                        sparklineColor={card.sparklineColor}
                        valueNote={card.valueNote}
                    />
                ))}
            </div>

            {/* Row 2: Alerts + Distribution */}
            <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-12">
                <div className="flex xl:col-span-7">
                    <AlertsPanel alerts={alerts} />
                </div>
                <div className="flex xl:col-span-5">
                    <ExpenseDistributionChart
                        data={distribution}
                        totalApproved={summary?.totalApproved}
                        approvedTrend={approvedTrend}
                    />
                </div>
            </div>

            {/* Row 3: Weekly trend + Fleet status */}
            <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-3">
                <div className="flex xl:col-span-2">
                    <WeeklyTrendChart data={weeklyTrend} />
                </div>
                <div className="flex xl:col-span-1">
                    <FleetStatusWidget
                        total={vehicleSummaries.length}
                        active={activeCount}
                        inWorkshop={inWorkshopCount}
                        inactive={inactiveCount}
                        documentAlerts={documentAlerts}
                    />
                </div>
            </div>

            {/* Row 4: Maintenance + Drivers + Top vehicles */}
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
                <div className="flex"><MaintenanceListWidget records={upcomingMaintenance} /></div>
                <div className="flex"><DriverAttentionWidget drivers={driversNeedingAttention} /></div>
                <div className="flex"><TopVehiclesWidget vehicles={topVehicles} /></div>
            </div>
        </div>
    );
};
