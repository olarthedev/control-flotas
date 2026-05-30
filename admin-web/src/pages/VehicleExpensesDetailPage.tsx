import { useEffect, useMemo, useRef, useState } from 'react';
import { MdAttachMoney, MdDownload, MdKeyboardArrowDown } from 'react-icons/md';
import { type ExpenseItem, type ExpenseStatus, updateExpenseStatus } from '../services/expenses.service';
import { fetchAllVehiclesWithExpensesSummary, fetchExpensesByVehicle, type VehicleExpenseSummary } from '../services/expenses-grouped.service';
import { createConsignment, fetchAllConsignments, type ConsignmentItem } from '../services/consignments.service';
import { Toast, type ToastType } from '../components/Toast';
import { PageHeader } from '../components/layout/PageHeader';
import { ExpenseAuditModal } from '../components/expenses/ExpenseAuditModal';
import { ExpenseGroupModal, type ExpenseSelectionState } from '../components/expenses/ExpenseGroupModal';
import { ConsignmentModal } from '../components/expenses/ConsignmentModal';
import { ExportButton } from '../components/ExportButton';
import { getApiErrorMessage } from '../utils/api-error';
import { formatCurrency } from '../utils/format';
import {
    buildHistoryWeekSummaries,
    buildOpenWeekSummaries,
    filterExpensesByWeekAndStatuses,
    getCurrentWeekKey,
    getIsoWeekInfo,
    getWeekLabel,
    getWeekRange,
    type HistoryWeekSummary,
    type OpenWeekSummary,
} from './expenses-week.utils';

type ViewTab = 'ACTIVOS' | 'HISTORIAL';

type ExpenseColumn = 'fuel' | 'meals' | 'maintenance' | 'hotel' | 'tolls' | 'parking';

interface TableRow {
    dayKey: string;
    label: string;
    route: string;
    fuel: number;
    meals: number;
    maintenance: number;
    hotel: number;
    tolls: number;
    parking: number;
    totalDay: number;
    byColumn: Record<ExpenseColumn, ExpenseItem[]>;
    dayExpenses: ExpenseItem[];
}

const COLUMN_ORDER: ExpenseColumn[] = ['fuel', 'meals', 'maintenance', 'hotel', 'tolls', 'parking'];
const SELECTED_VEHICLE_STORAGE_KEY = 'expenses:selectedVehicleId';
const SELECTED_HISTORY_WEEK_STORAGE_KEY = 'expenses:selectedHistoryWeek';
const ACTIVE_STATUSES: ExpenseStatus[] = ['pending'];
const HISTORY_STATUSES: ExpenseStatus[] = ['approved', 'rejected'];

const TYPE_TO_COLUMN: Record<string, ExpenseColumn> = {
    fuel: 'fuel',
    food: 'meals',
    maintenance: 'maintenance',
    toll: 'tolls',
    parking: 'parking',
};

const EXPENSES_PAGE_BREADCRUMBS = [
    { label: 'Inicio', to: '/' },
    { label: 'Gastos', to: '/expenses' },
    { label: 'Control por ruta' },
] as const;

const EXPENSES_PAGE_TITLE = 'Control de gastos por ruta';
const EXPENSES_PAGE_SUBTITLE = 'Revisa y aprueba gastos por semana, visualiza saldos a favor o en contra y exporta reportes en CSV.';

function formatDayLabel(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    if (year && month && day) {
        return new Date(year, month - 1, day).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    }
    return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function toDayKey(value: string): string {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getColumnFromExpenseType(type: string): ExpenseColumn {
    if (TYPE_TO_COLUMN[type]) {
        return TYPE_TO_COLUMN[type];
    }
    return 'hotel';
}

function getStatusDot(expenses: ExpenseItem[]): string {
    if (expenses.some((expense) => expense.status === 'pending')) {
        return 'bg-amber-500';
    }
    if (expenses.some((expense) => expense.status === 'approved')) {
        return 'bg-emerald-500';
    }
    return 'bg-rose-500';
}

export function VehicleExpensesDetailPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const [vehicleOptions, setVehicleOptions] = useState<VehicleExpenseSummary[]>([]);
    const [allExpenses, setAllExpenses] = useState<ExpenseItem[]>([]);
    const [consignments, setConsignments] = useState<ConsignmentItem[]>([]);

    const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
    const [tab, setTab] = useState<ViewTab>('ACTIVOS');
    const [selectedWeek, setSelectedWeek] = useState<string>(getCurrentWeekKey());

    const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
    const [selectedExpenseGroup, setSelectedExpenseGroup] = useState<ExpenseSelectionState | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentWeekKey = useMemo(() => getCurrentWeekKey(), []);

    const [showConsignmentModal, setShowConsignmentModal] = useState(false);
    const hasCompletedInitialLoad = useRef(false);

    // Cargar lista de vehículos al inicio
    useEffect(() => {
        const loadVehicles = async () => {
            try {
                const vehicleList = await fetchAllVehiclesWithExpensesSummary();
                setVehicleOptions(vehicleList);

                const storedVehicleIdRaw = localStorage.getItem(SELECTED_VEHICLE_STORAGE_KEY);
                const storedVehicleId = storedVehicleIdRaw ? Number(storedVehicleIdRaw) : NaN;
                const hasStoredVehicle = !Number.isNaN(storedVehicleId)
                    && vehicleList.some((item) => item.vehicleId === storedVehicleId);

                // Restaurar vehículo seleccionado o usar el primero
                if (vehicleList.length > 0) {
                    const initialVehicleId = hasStoredVehicle ? storedVehicleId : vehicleList[0].vehicleId;
                    setSelectedVehicleId(initialVehicleId);

                    const [vehicleExpenses, allConsignments] = await Promise.all([
                        fetchExpensesByVehicle(initialVehicleId),
                        fetchAllConsignments(),
                    ]);

                    setAllExpenses(vehicleExpenses);
                    setConsignments(allConsignments);
                }
            } catch (error) {
                setToast({
                    message: getApiErrorMessage(error, 'No se pudieron cargar los vehículos. Verifica tu conexión.'),
                    type: 'error',
                });
            } finally {
                hasCompletedInitialLoad.current = true;
                setIsLoading(false);
            }
        };

        loadVehicles();
    }, []);

    // Cargar gastos y consignaciones cuando cambia el vehículo seleccionado
    useEffect(() => {
        if (!selectedVehicleId || !hasCompletedInitialLoad.current) {
            return;
        }

        const loadData = async () => {
            try {
                setIsLoading(true);
                const [vehicleExpenses, allConsignments] = await Promise.all([
                    fetchExpensesByVehicle(selectedVehicleId),
                    fetchAllConsignments(),
                ]);

                setAllExpenses(vehicleExpenses);
                setConsignments(allConsignments);
            } catch (error) {
                setToast({
                    message: getApiErrorMessage(error, 'No se pudieron cargar los gastos del vehículo.'),
                    type: 'error',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [selectedVehicleId]);

    useEffect(() => {
        if (selectedVehicleId) {
            localStorage.setItem(SELECTED_VEHICLE_STORAGE_KEY, String(selectedVehicleId));
        }
    }, [selectedVehicleId]);

    const historyWeekSummaries = useMemo<HistoryWeekSummary[]>(
        () => buildHistoryWeekSummaries(allExpenses, ACTIVE_STATUSES),
        [allExpenses],
    );

    const openWeekSummaries = useMemo<OpenWeekSummary[]>(
        () => buildOpenWeekSummaries(allExpenses, ACTIVE_STATUSES),
        [allExpenses],
    );

    const lockedActiveWeekKey = openWeekSummaries[0]?.weekKey ?? currentWeekKey;
    const { isoWeek: lockedIsoWeek, isoYear: lockedIsoYear } = useMemo(
        () => getIsoWeekInfo(new Date(`${lockedActiveWeekKey}T00:00:00`)),
        [lockedActiveWeekKey],
    );
    const hasBacklogLock = openWeekSummaries.length > 0 && lockedActiveWeekKey !== currentWeekKey;

    useEffect(() => {
        if (tab === 'ACTIVOS') {
            if (selectedWeek !== lockedActiveWeekKey) {
                setSelectedWeek(lockedActiveWeekKey);
            }
            return;
        }

        if (historyWeekSummaries.length === 0) {
            if (selectedWeek !== '') {
                setSelectedWeek('');
            }
            return;
        }

        const currentIsValid = historyWeekSummaries.some((summary) => summary.weekKey === selectedWeek);
        if (currentIsValid) {
            return;
        }

        const storedHistoryWeek = localStorage.getItem(SELECTED_HISTORY_WEEK_STORAGE_KEY);
        const storedIsValid = storedHistoryWeek
            ? historyWeekSummaries.some((summary) => summary.weekKey === storedHistoryWeek)
            : false;

        setSelectedWeek(storedIsValid ? (storedHistoryWeek as string) : historyWeekSummaries[0].weekKey);
    }, [tab, lockedActiveWeekKey, historyWeekSummaries, selectedWeek]);

    useEffect(() => {
        if (tab === 'HISTORIAL' && selectedWeek) {
            localStorage.setItem(SELECTED_HISTORY_WEEK_STORAGE_KEY, selectedWeek);
        }
    }, [tab, selectedWeek]);

    const effectiveWeekKey = tab === 'ACTIVOS' ? lockedActiveWeekKey : selectedWeek;

    const filteredExpenses = useMemo(() => {
        if (!effectiveWeekKey) {
            return [];
        }

        const allowedStatuses = tab === 'ACTIVOS' ? ACTIVE_STATUSES : HISTORY_STATUSES;
        return filterExpensesByWeekAndStatuses(allExpenses, effectiveWeekKey, allowedStatuses);
    }, [allExpenses, effectiveWeekKey, tab]);

    const tableRows = useMemo<TableRow[]>(() => {
        const byDay = new Map<string, ExpenseItem[]>();

        filteredExpenses.forEach((expense) => {
            const dayKey = toDayKey(expense.expenseDate);
            if (!byDay.has(dayKey)) {
                byDay.set(dayKey, []);
            }
            byDay.get(dayKey)!.push(expense);
        });

        return Array.from(byDay.entries())
            .sort(([a], [b]) => (a > b ? 1 : -1))
            .map(([dayKey, dayExpenses]) => {
                const byColumn: Record<ExpenseColumn, ExpenseItem[]> = {
                    fuel: [],
                    meals: [],
                    maintenance: [],
                    hotel: [],
                    tolls: [],
                    parking: [],
                };

                dayExpenses.forEach((expense) => {
                    const column = getColumnFromExpenseType(expense.type);
                    byColumn[column].push(expense);
                });

                const route = dayExpenses[0]?.description ?? 'Ruta general';

                return {
                    dayKey,
                    label: formatDayLabel(dayKey),
                    route,
                    fuel: byColumn.fuel.reduce((sum, expense) => sum + expense.amount, 0),
                    meals: byColumn.meals.reduce((sum, expense) => sum + expense.amount, 0),
                    maintenance: byColumn.maintenance.reduce((sum, expense) => sum + expense.amount, 0),
                    hotel: byColumn.hotel.reduce((sum, expense) => sum + expense.amount, 0),
                    tolls: byColumn.tolls.reduce((sum, expense) => sum + expense.amount, 0),
                    parking: byColumn.parking.reduce((sum, expense) => sum + expense.amount, 0),
                    totalDay: dayExpenses.reduce((sum, expense) => sum + expense.amount, 0),
                    byColumn,
                    dayExpenses,
                };
            });
    }, [filteredExpenses]);

    const categoryTotals = useMemo(() => {
        return {
            fuel: tableRows.reduce((sum, row) => sum + row.fuel, 0),
            meals: tableRows.reduce((sum, row) => sum + row.meals, 0),
            maintenance: tableRows.reduce((sum, row) => sum + row.maintenance, 0),
            hotel: tableRows.reduce((sum, row) => sum + row.hotel, 0),
            tolls: tableRows.reduce((sum, row) => sum + row.tolls, 0),
            parking: tableRows.reduce((sum, row) => sum + row.parking, 0),
        };
    }, [tableRows]);

    const approvedTotal = useMemo(() => {
        return filteredExpenses
            .filter((expense) => expense.status === 'approved')
            .reduce((sum, expense) => sum + expense.amount, 0);
    }, [filteredExpenses]);

    const totalConsigned = useMemo(() => {
        if (!effectiveWeekKey) {
            return 0;
        }

        const { start, end } = getWeekRange(effectiveWeekKey);
        return consignments
            .filter((consignment) => {
                if (consignment.vehicle?.id !== selectedVehicleId) {
                    return false;
                }
                const consignmentDate = new Date(consignment.consignmentDate);
                return consignmentDate >= start && consignmentDate < end;
            })
            .reduce((sum, consignment) => sum + consignment.amount, 0);
    }, [consignments, selectedVehicleId, effectiveWeekKey]);

    const balance = totalConsigned - approvedTotal;

    const vehicle = vehicleOptions.find((item) => item.vehicleId === selectedVehicleId);

    const openExpenseGroup = (title: string, subtitle: string, groupedExpenses: ExpenseItem[], total: number) => {
        if (groupedExpenses.length === 1) {
            setSelectedExpense(groupedExpenses[0]);
            return;
        }

        setSelectedExpenseGroup({
            title,
            subtitle,
            expenses: groupedExpenses
                .slice()
                .sort((a, b) => new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime()),
            total,
        });
    };

    const openFromColumn = (row: TableRow, column: ExpenseColumn) => {
        const columnExpenses = row.byColumn[column];
        if (columnExpenses.length === 0) {
            return;
        }

        const columnLabelMap: Record<ExpenseColumn, string> = {
            fuel: 'Combustible',
            meals: 'Comida',
            maintenance: 'Mantenimiento',
            hotel: 'Hotel / Otro',
            tolls: 'Peajes',
            parking: 'Parqueadero',
        };

        openExpenseGroup(
            columnLabelMap[column],
            `${row.label} • ${row.route}`,
            columnExpenses,
            row[column],
        );
    };

    const openFromDayTotal = (row: TableRow) => {
        if (row.dayExpenses.length > 0) {
            openExpenseGroup(
                'Total del dia',
                `${row.label} • ${row.route}`,
                row.dayExpenses,
                row.totalDay,
            );
        }
    };

    const handleStatusChange = async (status: ExpenseStatus) => {
        if (!selectedExpense) {
            return;
        }

        try {
            setIsSubmitting(true);
            const updated = await updateExpenseStatus(selectedExpense.id, { status });

            setAllExpenses((current) => current.map((item) => (item.id === updated.id ? updated : item)));

            if (status === 'approved' || status === 'rejected') {
                window.dispatchEvent(new Event('expenseUpdated'));
            }

            setSelectedExpense(null);

            setToast({
                message: status === 'approved' ? 'Gasto aprobado correctamente.' : 'Gasto rechazado correctamente.',
                type: 'success',
            });
        } catch (error) {
            setToast({
                message: getApiErrorMessage(error, 'No se pudo actualizar el estado del gasto.'),
                type: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConsignmentConfirm = async (amount: number) => {
        const vehicleSummary = vehicleOptions.find((option) => option.vehicleId === selectedVehicleId);
        if (!vehicleSummary?.driverId) {
            setToast({ message: 'El vehículo seleccionado no tiene conductor asignado.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        try {
            const { start } = getWeekRange(selectedWeek);
            await createConsignment(vehicleSummary.driverId, selectedVehicleId!, amount, start.toISOString());
            const updatedConsignments = await fetchAllConsignments();
            setConsignments(updatedConsignments);
            setShowConsignmentModal(false);
            setToast({ message: `Consignación de ${formatCurrency(amount)} registrada correctamente.`, type: 'success' });
        } catch (error) {
            setToast({ message: getApiErrorMessage(error, 'No se pudo registrar la consignación.'), type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = () => {
        const header = ['Fecha', 'Ruta', 'Combustible', 'Comida', 'Mantenimiento', 'Hotel', 'Peajes', 'Parqueadero', 'Total dia'];
        const rows = tableRows.map((row) => [
            row.label,
            row.route,
            row.fuel,
            row.meals,
            row.maintenance,
            row.hotel,
            row.tolls,
            row.parking,
            row.totalDay,
        ]);

        const csv = [header, ...rows]
            .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gastos-${vehicle?.licensePlate ?? 'vehiculo'}-${selectedWeek}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <section className="space-y-6">
                <PageHeader
                    breadcrumbs={[...EXPENSES_PAGE_BREADCRUMBS]}
                    title={EXPENSES_PAGE_TITLE}
                    subtitle={EXPENSES_PAGE_SUBTITLE}
                />

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="h-12 w-[240px] animate-pulse rounded-xl border border-slate-200 bg-white" />
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="h-14 min-w-[180px] animate-pulse rounded-xl border border-slate-200 bg-white" />
                        <div className="h-14 min-w-[220px] animate-pulse rounded-xl border border-slate-200 bg-white" />
                        <div className="h-14 min-w-[160px] animate-pulse rounded-xl bg-[#5848f4]/15" />
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="h-[132px] animate-pulse rounded-xl border border-slate-200 bg-white" />
                    <div className="h-[132px] animate-pulse rounded-xl border border-slate-200 bg-white" />
                    <div className="h-[132px] animate-pulse rounded-xl border border-emerald-200 bg-emerald-50/60" />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                        <div className="h-6 w-56 animate-pulse rounded bg-slate-100" />
                        <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="space-y-3 px-6 py-5">
                        <div className="h-12 animate-pulse rounded-xl bg-slate-50" />
                        <div className="h-12 animate-pulse rounded-xl bg-slate-50" />
                        <div className="h-12 animate-pulse rounded-xl bg-slate-50" />
                        <div className="h-12 animate-pulse rounded-xl bg-slate-50" />
                        <div className="h-12 animate-pulse rounded-xl bg-slate-50" />
                    </div>
                </div>
            </section>
        );
    }

    if (vehicleOptions.length === 0) {
        return (
            <section className="space-y-5">
                <PageHeader
                    breadcrumbs={[...EXPENSES_PAGE_BREADCRUMBS]}
                    title={EXPENSES_PAGE_TITLE}
                    subtitle={EXPENSES_PAGE_SUBTITLE}
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-10">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-slate-400">
                            <MdAttachMoney size={40} />
                        </div>
                        <h3 className="text-xl font-normal text-[#0f1e45]">Sin gastos registrados</h3>
                        <p className="max-w-md text-sm text-slate-500">No hay vehículos con gastos en el sistema. Los gastos aparecerán aquí una vez que se registren en la aplicación móvil o se carguen manualmente.</p>
                        <div className="w-full max-w-md rounded-lg bg-blue-50 p-4 text-left text-xs text-blue-700">
                            <p className="mb-1 font-normal">¿Cómo crear gastos?</p>
                            <ul className="space-y-1 text-blue-600">
                                <li>√ Registra gastos desde la app móvil</li>
                                <li>√ Los gastos aparecerán automáticamente aquí</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <PageHeader
                breadcrumbs={[...EXPENSES_PAGE_BREADCRUMBS]}
                title={EXPENSES_PAGE_TITLE}
                subtitle={EXPENSES_PAGE_SUBTITLE}
            />

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                    <button
                        onClick={() => setTab('ACTIVOS')}
                        className={`rounded-lg px-4 py-2 text-sm font-normal transition-colors ${tab === 'ACTIVOS' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                    >
                        ACTIVOS
                    </button>
                    <button
                        onClick={() => setTab('HISTORIAL')}
                        className={`rounded-lg px-4 py-2 text-sm font-normal transition-colors ${tab === 'HISTORIAL' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                    >
                        HISTORIAL
                    </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <label className="relative min-w-[180px]">
                        <span className="pointer-events-none absolute left-4 top-2 text-[11px] font-normal text-slate-400">
                            Vehiculo
                        </span>
                        <select
                            value={selectedVehicleId ?? ''}
                            onChange={(event) => {
                                const nextVehicleId = Number(event.target.value);
                                if (Number.isNaN(nextVehicleId)) {
                                    return;
                                }
                                setSelectedVehicleId(nextVehicleId);
                            }}
                            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pb-2 pt-6 pr-9 text-sm font-normal text-slate-700"
                        >
                            {vehicleOptions.map((item) => (
                                <option key={item.vehicleId} value={item.vehicleId}>
                                    {item.licensePlate.toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <MdKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </label>

                    <label className="relative min-w-[220px]">
                        <span className="pointer-events-none absolute left-4 top-2 text-[11px] font-normal text-slate-400">
                            Semana
                        </span>
                        {tab === 'ACTIVOS' ? (
                            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pb-2 pt-6 text-sm font-normal text-slate-700">
                                {hasBacklogLock
                                    ? `Semana por cerrar (Año ${lockedIsoYear} • Semana ${String(lockedIsoWeek).padStart(2, '0')})`
                                    : `Semana actual (${getWeekLabel(lockedActiveWeekKey)})`}
                            </div>
                        ) : (
                            <>
                                <select
                                    value={selectedWeek}
                                    onChange={(event) => setSelectedWeek(event.target.value)}
                                    disabled={historyWeekSummaries.length === 0}
                                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pb-2 pt-6 pr-9 text-sm font-normal text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    {historyWeekSummaries.length === 0 ? (
                                        <option value="">No hay semanas cerradas</option>
                                    ) : (
                                        historyWeekSummaries.map((summary) => (
                                            <option key={summary.weekKey} value={summary.weekKey}>
                                                {`Año ${summary.isoYear} • Semana ${String(summary.isoWeek).padStart(2, '0')} • ${getWeekLabel(summary.weekKey)}`}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <MdKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            </>
                        )}
                    </label>

                    <button
                        onClick={() => setShowConsignmentModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5848f4] px-4 py-3 text-sm font-normal text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md"
                    >
                        <MdAttachMoney size={18} />
                        Consignar
                    </button>
                </div>
            </div>

            {tab === 'ACTIVOS' && hasBacklogLock && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {`Gestion secuencial activada: primero debes cerrar la semana ${String(lockedIsoWeek).padStart(2, '0')} del ${lockedIsoYear} (${getWeekLabel(lockedActiveWeekKey)}) antes de gestionar semanas posteriores.`}
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-3">
                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-xs font-normal text-slate-500">Total consignado</p>
                    <p className="mt-2 text-2xl font-normal leading-none text-[#101e42]">{formatCurrency(totalConsigned)}</p>
                    <p className="mt-1 text-xs font-normal text-slate-400">Semanal</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-xs font-normal text-slate-500">Gastos aprobados</p>
                    <p className="mt-2 text-2xl font-normal leading-none text-[#101e42]">{formatCurrency(approvedTotal)}</p>
                    <p className="mt-1 text-xs font-normal text-slate-400">Semanal</p>
                </article>

                <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-xs font-normal text-emerald-700">Saldo a favor empresa</p>
                    <p className="mt-3 text-2xl font-normal leading-none">{formatCurrency(Math.max(balance, 0))}</p>
                    <button
                        onClick={() => setToast({
                            message: 'Funcionalidad de finalización en desarrollo',
                            type: 'info'
                        })}
                        className="mt-3 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-normal text-emerald-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100"
                    >
                        Finalizar
                    </button>
                </article>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <h2 className="text-lg font-normal text-[#13254d]">Detalle de operacion por ruta</h2>
                    <div className="inline-flex items-center gap-5 text-xs font-normal text-slate-500">
                        <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />APROBADO</span>
                        <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" />PENDIENTE</span>
                        <ExportButton onExport={handleExport} title="Exportar CSV" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 text-xs font-normal text-slate-500">
                            <tr>
                                <th className="whitespace-nowrap px-6 py-4 text-left">Fecha</th>
                                <th className="whitespace-nowrap px-6 py-4 text-left">Ruta / Destino</th>
                                <th className="whitespace-nowrap px-6 py-4 text-center">Combustible</th>
                                <th className="whitespace-nowrap px-6 py-4 text-center">Comida</th>
                                <th className="whitespace-nowrap px-6 py-4 text-center">Mantenim.</th>
                                <th className="whitespace-nowrap px-6 py-4 text-center">Hotel</th>
                                <th className="whitespace-nowrap px-6 py-4 text-center">Peajes</th>
                                <th className="whitespace-nowrap px-6 py-4 text-center">Parqueadero</th>
                                <th className="whitespace-nowrap px-6 py-4 text-center">Total dia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-6 py-20 text-center">
                                        <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-slate-400">
                                                <MdDownload size={26} />
                                            </div>
                                            <h3 className="text-xl font-normal text-[#0f1e45]">Sin registros esta semana</h3>
                                            <p className="text-sm text-slate-500">La tabla se encuentra limpia para el nuevo ciclo operativo.</p>
                                            <button
                                                onClick={() => {
                                                    setSelectedWeek(lockedActiveWeekKey);
                                                    setTab('ACTIVOS');
                                                }}
                                                className="mt-2 rounded-lg bg-indigo-50 px-5 py-2 text-xs font-normal text-indigo-600 transition-colors hover:bg-indigo-100"
                                            >
                                                {hasBacklogLock ? 'IR A SEMANA PENDIENTE' : 'IR A SEMANA ACTUAL'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {tableRows.map((row) => (
                                <tr key={row.dayKey} className="border-t border-slate-100 text-sm text-slate-700 transition-colors hover:bg-slate-50/70">
                                    <td className="whitespace-nowrap px-6 py-3 font-normal text-[#16294d]">{row.label}</td>
                                    <td className="px-6 py-3 text-xs font-normal text-slate-500">{row.route}</td>
                                    {COLUMN_ORDER.map((column) => {
                                        const value = row[column];
                                        const columnExpenses = row.byColumn[column];
                                        const canOpen = value > 0 && columnExpenses.length > 0;
                                        return (
                                            <td key={column} className="px-3 py-3 text-center">
                                                <button
                                                    onClick={() => openFromColumn(row, column)}
                                                    disabled={!canOpen}
                                                    className={`min-h-7 min-w-[90px] rounded-lg px-2 py-1 transition-all duration-200 ${canOpen ? 'cursor-pointer hover:-translate-y-0.5 hover:bg-slate-100' : 'cursor-default'
                                                        }`}
                                                >
                                                    <span className={`text-sm font-normal ${value > 0 ? 'text-[#12264f]' : 'text-slate-300'}`}>
                                                        {value > 0 ? formatCurrency(value) : '-'}
                                                    </span>
                                                    {value > 0 && <span className={`mx-auto mt-0.5 block h-1.5 w-1.5 rounded-full ${getStatusDot(columnExpenses)}`} />}
                                                </button>
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            onClick={() => openFromDayTotal(row)}
                                            className="cursor-pointer rounded-lg px-2 py-1 text-sm font-normal text-[#0f2349] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
                                        >
                                            {formatCurrency(row.totalDay)}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {tableRows.length > 0 && (
                            <tfoot>
                                <tr className="border-t border-slate-200 bg-slate-100 text-white">
                                    <td className="px-6 py-5 text-center text-xs font-normal text-[#11254c]" colSpan={2}>
                                        Resumen semanal
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[11px] font-normal text-slate-500">Combustible</p>
                                        <p className="mt-1 text-lg font-normal text-[#12264f]">{formatCurrency(categoryTotals.fuel)}</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[11px] font-normal text-slate-500">Comida</p>
                                        <p className="mt-1 text-lg font-normal text-[#12264f]">{formatCurrency(categoryTotals.meals)}</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[11px] font-normal text-slate-500">Mantenim.</p>
                                        <p className="mt-1 text-lg font-normal text-[#12264f]">{formatCurrency(categoryTotals.maintenance)}</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[11px] font-normal text-slate-500">Hotel</p>
                                        <p className="mt-1 text-lg font-normal text-[#12264f]">{formatCurrency(categoryTotals.hotel)}</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[11px] font-normal text-slate-500">Peajes</p>
                                        <p className="mt-1 text-lg font-normal text-[#12264f]">{formatCurrency(categoryTotals.tolls)}</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[11px] font-normal text-slate-500">Parqueo</p>
                                        <p className="mt-1 text-lg font-normal text-[#12264f]">{formatCurrency(categoryTotals.parking)}</p>
                                    </td>
                                    <td className="bg-slate-800 px-4 py-5 text-center">
                                        <p className="text-[11px] font-normal text-slate-200">Total general</p>
                                        <p className="mt-1 text-2xl font-normal">{formatCurrency(tableRows.reduce((sum, row) => sum + row.totalDay, 0))}</p>
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            <ExpenseAuditModal
                isOpen={selectedExpense !== null}
                onClose={() => setSelectedExpense(null)}
                expense={selectedExpense}
                onStatusChange={handleStatusChange}
                isSubmitting={isSubmitting}
            />

            <ExpenseGroupModal
                group={selectedExpenseGroup}
                onClose={() => setSelectedExpenseGroup(null)}
                onSelectExpense={(expense) => {
                    setSelectedExpenseGroup(null);
                    setSelectedExpense(expense);
                }}
            />

            <ConsignmentModal
                isOpen={showConsignmentModal}
                isSubmitting={isSubmitting}
                vehicleOptions={vehicleOptions}
                selectedVehicleId={selectedVehicleId}
                selectedWeek={selectedWeek}
                onVehicleChange={setSelectedVehicleId}
                onClose={() => setShowConsignmentModal(false)}
                onConfirm={handleConsignmentConfirm}
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </section>
    );
}
