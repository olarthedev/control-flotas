import { useEffect, useMemo, useState } from 'react';
import {
    MdClose,
    MdDownload,
    MdKeyboardArrowDown,
    MdLocalShipping,
    MdPerson,
} from 'react-icons/md';
import { type ExpenseItem, type ExpenseStatus, updateExpenseStatus } from '../services/expenses.service';
import { fetchExpensesByVehicle, fetchExpensesGroupedByVehicle, type VehicleExpenseSummary } from '../services/expenses-grouped.service';
import { fetchAllConsignments, type ConsignmentItem } from '../services/consignments.service';
import { Toast, type ToastType } from '../components/Toast';

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

const TYPE_TO_COLUMN: Record<string, ExpenseColumn> = {
    FUEL: 'fuel',
    MEALS: 'meals',
    MAINTENANCE: 'maintenance',
    TOLLS: 'tolls',
    PARKING: 'parking',
};

const TYPE_LABELS: Record<string, string> = {
    FUEL: 'Combustible',
    TOLLS: 'Peajes',
    MAINTENANCE: 'Mantenimiento',
    LOADING_UNLOADING: 'Logistica',
    MEALS: 'Comida',
    PARKING: 'Parqueadero',
    OTHER: 'Hotel / Otro',
};

const STATUS_LABELS: Record<ExpenseStatus, string> = {
    APPROVED: 'Aprobado',
    PENDING: 'Pendiente',
    OBSERVED: 'Observado',
    REJECTED: 'Rechazado',
};

function formatCurrency(value: number): string {
    return `$${Math.round(value).toLocaleString('es-CO')}`;
}

function formatDayLabel(value: string): string {
    return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function getStartOfWeek(date = new Date()): Date {
    const copy = new Date(date);
    const day = copy.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function toWeekKey(date: Date): string {
    return date.toISOString().split('T')[0];
}

function getWeekRange(weekKey: string): { start: Date; end: Date } {
    const start = new Date(`${weekKey}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
}

function getWeekLabel(weekKey: string): string {
    const { start, end } = getWeekRange(weekKey);
    const endVisible = new Date(end);
    endVisible.setDate(endVisible.getDate() - 1);
    return `${start.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} - ${endVisible.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}`;
}

function getPrimaryEvidence(expense: ExpenseItem): string | null {
    const image = expense.evidence.find((item) => item.isPrimary) ?? expense.evidence[0];
    return image?.fileUrl ?? null;
}

function getColumnFromExpenseType(type: string): ExpenseColumn {
    if (TYPE_TO_COLUMN[type]) {
        return TYPE_TO_COLUMN[type];
    }
    return 'hotel';
}

function getStatusDot(expenses: ExpenseItem[]): string {
    if (expenses.some((expense) => expense.status === 'PENDING')) {
        return 'bg-amber-500';
    }
    if (expenses.some((expense) => expense.status === 'APPROVED')) {
        return 'bg-emerald-500';
    }
    if (expenses.some((expense) => expense.status === 'OBSERVED')) {
        return 'bg-sky-500';
    }
    return 'bg-rose-500';
}

export function VehicleExpensesDetailPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const [vehicleOptions, setVehicleOptions] = useState<VehicleExpenseSummary[]>([]);
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [consignments, setConsignments] = useState<ConsignmentItem[]>([]);

    const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
    const [tab, setTab] = useState<ViewTab>('ACTIVOS');
    const [selectedWeek, setSelectedWeek] = useState<string>(toWeekKey(getStartOfWeek()));

    const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar lista de vehículos al inicio
    useEffect(() => {
        const loadVehicles = async () => {
            try {
                const vehicleList = await fetchExpensesGroupedByVehicle();
                setVehicleOptions(vehicleList);

                // Seleccionar el primer vehículo automáticamente
                if (vehicleList.length > 0) {
                    setSelectedVehicleId(vehicleList[0].vehicleId);
                }
            } catch {
                setToast({
                    message: 'No se pudieron cargar los vehículos.',
                    type: 'error',
                });
                setIsLoading(false);
            }
        };

        loadVehicles();
    }, []);

    // Cargar gastos y consignaciones cuando cambia el vehículo seleccionado
    useEffect(() => {
        if (!selectedVehicleId) {
            return;
        }

        const loadData = async () => {
            try {
                setIsLoading(true);
                const [vehicleExpenses, allConsignments] = await Promise.all([
                    fetchExpensesByVehicle(selectedVehicleId),
                    fetchAllConsignments(),
                ]);

                setExpenses(vehicleExpenses);
                setConsignments(allConsignments);
            } catch {
                setToast({
                    message: 'No se pudieron cargar los gastos del vehiculo.',
                    type: 'error',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [selectedVehicleId]);

    const weekOptions = useMemo(() => {
        const sourceDates = [
            ...expenses.map((expense) => new Date(expense.expenseDate)),
            ...consignments
                .filter((consignment) => consignment.vehicle?.id === selectedVehicleId)
                .map((consignment) => new Date(consignment.consignmentDate)),
            new Date(),
        ];

        const unique = new Set<string>();
        sourceDates.forEach((date) => {
            if (!Number.isNaN(date.getTime())) {
                unique.add(toWeekKey(getStartOfWeek(date)));
            }
        });

        return Array.from(unique)
            .sort((a, b) => (a < b ? 1 : -1))
            .map((week) => ({ value: week, label: getWeekLabel(week) }));
    }, [expenses, consignments, selectedVehicleId]);

    const filteredExpenses = useMemo(() => {
        const { start, end } = getWeekRange(selectedWeek);

        const byWeek = expenses.filter((expense) => {
            const expenseDate = new Date(expense.expenseDate);
            return expenseDate >= start && expenseDate < end;
        });

        if (tab === 'ACTIVOS') {
            return byWeek;
        }

        return expenses.filter((expense) => {
            const expenseDate = new Date(expense.expenseDate);
            return !(expenseDate >= start && expenseDate < end);
        });
    }, [expenses, selectedWeek, tab]);

    const tableRows = useMemo<TableRow[]>(() => {
        const byDay = new Map<string, ExpenseItem[]>();

        filteredExpenses.forEach((expense) => {
            const dayKey = new Date(expense.expenseDate).toISOString().split('T')[0];
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

                const route = dayExpenses[0]?.description || dayExpenses[0]?.notes || 'Ruta general';

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
            .filter((expense) => expense.status === 'APPROVED')
            .reduce((sum, expense) => sum + expense.amount, 0);
    }, [filteredExpenses]);

    const totalConsigned = useMemo(() => {
        const { start, end } = getWeekRange(selectedWeek);
        return consignments
            .filter((consignment) => {
                if (consignment.vehicle?.id !== selectedVehicleId) {
                    return false;
                }
                const consignmentDate = new Date(consignment.consignmentDate);
                return consignmentDate >= start && consignmentDate < end;
            })
            .reduce((sum, consignment) => sum + consignment.amount, 0);
    }, [consignments, selectedVehicleId, selectedWeek]);

    const balance = totalConsigned - approvedTotal;

    const vehicle = vehicleOptions.find((item) => item.vehicleId === selectedVehicleId);

    const openFromColumn = (row: TableRow, column: ExpenseColumn) => {
        const candidate = row.byColumn[column][0];
        if (candidate) {
            setSelectedExpense(candidate);
        }
    };

    const openFromDayTotal = (row: TableRow) => {
        if (row.dayExpenses.length > 0) {
            setSelectedExpense(row.dayExpenses[0]);
        }
    };

    const handleStatusChange = async (status: ExpenseStatus) => {
        if (!selectedExpense) {
            return;
        }

        try {
            setIsSubmitting(true);
            const updated = await updateExpenseStatus(selectedExpense.id, {
                status,
                validatedBy: 'Admin Web',
            });

            setExpenses((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            setSelectedExpense(updated);
            setToast({
                message: status === 'APPROVED' ? 'Gasto aprobado correctamente.' : 'Gasto rechazado correctamente.',
                type: 'success',
            });
        } catch {
            setToast({
                message: 'No se pudo actualizar el estado del gasto.',
                type: 'error',
            });
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
            <section className="space-y-4">
                <div className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white" />
            </section>
        );
    }

    return (
        <section className="space-y-5">
            <header className="space-y-2">
                <h1 className="text-[24px] font-bold leading-tight text-[#0b1835]">Control de Gastos por Ruta</h1>
                <p className="text-xs text-slate-500">Revisa y aprueba gastos por semana, visualiza saldos a favor o en contra, y exporta reportes en CSV</p>
            </header>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
                    <button
                        onClick={() => setTab('ACTIVOS')}
                        className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition ${tab === 'ACTIVOS' ? 'bg-[#4d3df0] text-white shadow-md shadow-indigo-500/25' : 'text-slate-500'
                            }`}
                    >
                        ACTIVOS
                    </button>
                    <button
                        onClick={() => setTab('HISTORIAL')}
                        className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition ${tab === 'HISTORIAL' ? 'bg-[#4d3df0] text-white shadow-md shadow-indigo-500/25' : 'text-slate-500'
                            }`}
                    >
                        HISTORIAL
                    </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <label className="relative min-w-[180px]">
                        <span className="pointer-events-none absolute left-4 top-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
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
                            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pb-2 pt-6 pr-9 text-sm font-medium text-slate-700"
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
                        <span className="pointer-events-none absolute left-4 top-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                            Semana
                        </span>
                        <select
                            value={selectedWeek}
                            onChange={(event) => setSelectedWeek(event.target.value)}
                            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pb-2 pt-6 pr-9 text-sm font-medium text-slate-700"
                        >
                            {weekOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {`Esta semana (${option.label})`}
                                </option>
                            ))}
                        </select>
                        <MdKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </label>

                    <button
                        onClick={handleExport}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                    >
                        <MdDownload size={16} />
                        Exportar
                    </button>
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total consignado</p>
                    <p className="mt-2 text-2xl font-semibold leading-none text-[#101e42]">{formatCurrency(totalConsigned)}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">Semanal</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Gastos aprobados</p>
                    <p className="mt-2 text-2xl font-semibold leading-none text-[#101e42]">{formatCurrency(approvedTotal)}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-400">Semanal</p>
                </article>

                <article className="rounded-xl bg-[#2f9a67] p-4 text-white shadow-md">
                    <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-100">Saldo a favor empresa</p>
                        <p className="text-[10px] font-medium text-emerald-100">
                            {balance >= 0 ? `Sobran ${formatCurrency(balance)}` : `Faltan ${formatCurrency(Math.abs(balance))}`}
                        </p>
                    </div>
                    <p className="mt-2 text-2xl font-semibold leading-none">{formatCurrency(Math.max(balance, 0))}</p>
                    <button className="mt-3 rounded-full bg-white px-5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#1b284c]">
                        Finalizar
                    </button>
                </article>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <h2 className="text-xl font-bold tracking-[0.06em] text-[#13254d] uppercase">Detalle de operacion por ruta</h2>
                    <div className="inline-flex items-center gap-5 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />APROBADO</span>
                        <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" />PENDIENTE</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
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
                                            <h3 className="text-3xl font-semibold text-[#0f1e45]">Sin registros esta semana</h3>
                                            <p className="text-sm text-slate-500">La tabla se encuentra limpia para el nuevo ciclo operativo.</p>
                                            <button
                                                onClick={() => {
                                                    const week = toWeekKey(getStartOfWeek());
                                                    setSelectedWeek(week);
                                                    setTab('ACTIVOS');
                                                }}
                                                className="mt-2 rounded-full bg-indigo-50 px-6 py-2 text-xs font-bold tracking-[0.14em] text-indigo-500"
                                            >
                                                IR A SEMANA ACTUAL
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {tableRows.map((row) => (
                                <tr key={row.dayKey} className="border-t border-slate-100 text-sm text-slate-700">
                                    <td className="whitespace-nowrap px-6 py-3 font-bold text-[#16294d]">{row.label}</td>
                                    <td className="px-6 py-3 font-medium text-slate-500 uppercase text-xs">{row.route}</td>
                                    {COLUMN_ORDER.map((column) => {
                                        const value = row[column];
                                        const columnExpenses = row.byColumn[column];
                                        const canOpen = value > 0 && columnExpenses.length > 0;
                                        return (
                                            <td key={column} className="px-3 py-3 text-center">
                                                <button
                                                    onClick={() => openFromColumn(row, column)}
                                                    disabled={!canOpen}
                                                    className={`min-h-7 min-w-[90px] rounded-lg px-2 py-1 transition ${canOpen ? 'hover:bg-slate-100' : 'cursor-default'
                                                        }`}
                                                >
                                                    <span className={`text-sm font-semibold ${value > 0 ? 'text-[#12264f]' : 'text-slate-300'}`}>
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
                                            className="rounded-lg px-2 py-1 text-sm font-semibold text-[#0f2349] transition hover:bg-slate-100"
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
                                    <td className="px-6 py-5 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-[#11254c]" colSpan={2}>
                                        Resumen semanal
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Combustible</p>
                                        <p className="mt-1 text-xl font-semibold text-[#12264f]">{formatCurrency(categoryTotals.fuel)}</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Comida</p>
                                        <p className="mt-1 text-xl font-semibold text-[#12264f]">{formatCurrency(categoryTotals.meals)}</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Mantenim.</p>
                                        <p className="mt-1 text-xl font-semibold text-[#12264f]">{formatCurrency(categoryTotals.maintenance)}</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Hotel</p>
                                        <p className="mt-1 text-xl font-semibold text-[#12264f]">{formatCurrency(categoryTotals.hotel)}</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Peajes</p>
                                        <p className="mt-1 text-xl font-semibold text-[#12264f]">{formatCurrency(categoryTotals.tolls)}</p>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Parqueo</p>
                                        <p className="mt-1 text-xl font-semibold text-[#12264f]">{formatCurrency(categoryTotals.parking)}</p>
                                    </td>
                                    <td className="bg-gradient-to-r from-[#5342f5] to-[#4639d8] px-4 py-5 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-100">Total general</p>
                                        <p className="mt-1 text-3xl font-semibold">{formatCurrency(tableRows.reduce((sum, row) => sum + row.totalDay, 0))}</p>
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {selectedExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08112f]/40 p-4 backdrop-blur-sm">
                    <div className="relative grid h-[82vh] w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/20 bg-white shadow-[0_40px_100px_-40px_rgba(14,23,38,0.7)] lg:grid-cols-[1.35fr_0.85fr]">
                        <div className="relative hidden lg:block">
                            {getPrimaryEvidence(selectedExpense) ? (
                                <img
                                    src={getPrimaryEvidence(selectedExpense)!}
                                    alt="Evidencia del gasto"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-[#08133b]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute bottom-8 left-8 text-white">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Evidencia digital</p>
                                <p className="mt-1 text-sm font-semibold">Capturado el {new Date(selectedExpense.expenseDate).toLocaleDateString('es-CO')}</p>
                            </div>
                        </div>

                        <div className="relative overflow-y-auto bg-white p-7">
                            <button
                                onClick={() => setSelectedExpense(null)}
                                className="absolute right-6 top-6 rounded-2xl bg-slate-100 p-2 text-slate-500 transition hover:text-slate-900"
                            >
                                <MdClose size={24} />
                            </button>

                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-500">
                                {STATUS_LABELS[selectedExpense.status]} <span className="mx-2 text-slate-300">•</span> {TYPE_LABELS[selectedExpense.type] ?? selectedExpense.type}
                            </p>
                            <h3 className="mt-3 text-5xl leading-none font-black text-[#0f1f45]">Auditoria de Gasto</h3>

                            <div className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Monto reportado</p>
                                <p className="mt-2 text-6xl leading-none font-black text-[#4d3df0]">{formatCurrency(selectedExpense.amount)}</p>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                                    <div className="rounded-xl bg-indigo-50 p-2 text-indigo-500"><MdPerson size={20} /></div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Conductor</p>
                                        <p className="text-xl font-bold text-slate-700">{selectedExpense.driver.fullName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                                    <div className="rounded-xl bg-slate-100 p-2 text-slate-500"><MdLocalShipping size={20} /></div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Vehiculo</p>
                                        <p className="text-xl font-bold text-slate-700">
                                            {selectedExpense.vehicle?.licensePlate ?? 'Sin placa'}
                                            {selectedExpense.vehicle ? ` - ${selectedExpense.vehicle.brand ?? ''} ${selectedExpense.vehicle.model ?? ''}` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Observaciones del conductor</p>
                                <p className="mt-2 text-lg font-medium italic text-slate-600">
                                    {selectedExpense.notes || selectedExpense.description || 'Sin observaciones registradas.'}
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <button
                                    disabled={isSubmitting}
                                    onClick={() => handleStatusChange('REJECTED')}
                                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-extrabold tracking-[0.12em] text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                                >
                                    RECHAZAR
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    onClick={() => handleStatusChange('APPROVED')}
                                    className="rounded-2xl bg-gradient-to-r from-[#5a4af6] to-[#4a3de6] px-4 py-3 text-sm font-extrabold tracking-[0.12em] text-white shadow-[0_14px_30px_-12px_rgba(74,61,230,0.85)] transition hover:brightness-105 disabled:opacity-60"
                                >
                                    APROBAR GASTO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </section>
    );
}
