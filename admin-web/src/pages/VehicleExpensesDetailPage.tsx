import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ChevronLeft, ChevronRight, ChevronDown,
    Clock, Calendar, FileText, TrendingUp,
    DollarSign, SlidersHorizontal, Car,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    fetchExpensesByFilters,
    type ExpenseItem,
    type ExpenseStatus,
    updateExpenseStatus,
} from '../services/expenses.service';
import { fetchExpensesByVehicle, fetchAllVehiclesWithExpensesSummary, type VehicleExpenseSummary } from '../services/expenses-grouped.service';
import { fetchAllConsignments, createConsignment, type ConsignmentItem } from '../services/consignments.service';
import { Toast, type ToastType } from '../components/Toast';
import { ExpenseAuditModal } from '../components/expenses/ExpenseAuditModal';
import { ConsignmentModal } from '../components/expenses/ConsignmentModal';
import { formatCurrency } from '../utils/format';
import { getApiErrorMessage } from '../utils/api-error';
import {
    getCurrentWeekKey,
    getWeekRange,
    toLocalDateKey,
} from './expenses-week.utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabType = 'ACTIVOS' | 'HISTORIAL';
type CategoryFilter = 'all' | 'fuel' | 'food' | 'toll' | 'lodging' | 'parking' | 'maintenance' | 'other';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
    fuel:        { label: 'Combustible', color: '#5B5CEB' },
    food:        { label: 'Comida',      color: '#14B8A6' },
    toll:        { label: 'Peajes',      color: '#8B5CF6' },
    lodging:     { label: 'Hotel',       color: '#F43F5E' },
    parking:     { label: 'Parqueadero', color: '#10B981' },
    maintenance: { label: 'Mantenim.',   color: '#F97316' },
    other:       { label: 'Otro',        color: '#9CA3AF' },
};

const STATUS_LABELS: Record<StatusFilter, string> = {
    all:      'Todos los estados',
    pending:  'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
};

const CARD_SHADOW = '0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)';
const CARD_BORDER = '#ECECF3';

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function shiftWeek(weekKey: string, delta: number): string {
    const { start } = getWeekRange(weekKey);
    start.setDate(start.getDate() + delta * 7);
    return toLocalDateKey(start);
}

function formatWeekDisplay(weekKey: string): string {
    const { start, end } = getWeekRange(weekKey);
    const sun = new Date(end.getTime() - 86_400_000);
    const M = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${start.getDate()} - ${sun.getDate()} de ${M[sun.getMonth()]} ${sun.getFullYear()}`;
}

function formatExpenseDate(iso: string): { day: string; weekday: string } {
    const d = new Date(iso);
    const M = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const W = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    return { day: `${d.getDate()} de ${M[d.getMonth()]}`, weekday: W[d.getDay()] };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ExpenseStatus }) {
    if (status === 'approved') return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Aprobado
        </span>
    );
    if (status === 'rejected') return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />Rechazado
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Pendiente
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function VehicleExpensesDetailPage() {
    const [isLoading,       setIsLoading]       = useState(true);
    const [toast,           setToast]           = useState<{ message: string; type: ToastType } | null>(null);
    const [vehicleOptions,  setVehicleOptions]  = useState<VehicleExpenseSummary[]>([]);
    const [allExpenses,     setAllExpenses]     = useState<ExpenseItem[]>([]);
    const [consignments,    setConsignments]    = useState<ConsignmentItem[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
    const [consignVehicleId,  setConsignVehicleId]  = useState<number | null>(null);
    const [tab,             setTab]             = useState<TabType>('ACTIVOS');
    const [selectedWeek,    setSelectedWeek]    = useState<string>(getCurrentWeekKey());
    const [categoryFilter,  setCategoryFilter]  = useState<CategoryFilter>('all');
    const [statusFilter,    setStatusFilter]    = useState<StatusFilter>('all');
    const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
    const [isSubmitting,    setIsSubmitting]    = useState(false);
    const [showConsignment, setShowConsignment] = useState(false);
    const [vehicleMenuOpen, setVehicleMenuOpen] = useState(false);
    const [statusMenuOpen,  setStatusMenuOpen]  = useState(false);

    const vehicleMenuRef = useRef<HTMLDivElement>(null);
    const statusMenuRef  = useRef<HTMLDivElement>(null);

    // ── Close dropdowns on outside click ──────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (vehicleMenuRef.current && !vehicleMenuRef.current.contains(e.target as Node)) setVehicleMenuOpen(false);
            if (statusMenuRef.current  && !statusMenuRef.current.contains(e.target as Node))  setStatusMenuOpen(false);
        };
        window.addEventListener('mousedown', handler);
        return () => window.removeEventListener('mousedown', handler);
    }, []);

    // ── Load vehicle list + consignments (once) ───────────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const [vehicles, cons] = await Promise.all([
                    fetchAllVehiclesWithExpensesSummary(),
                    fetchAllConsignments(),
                ]);
                setVehicleOptions(vehicles);
                setConsignments(cons);
                setConsignVehicleId(vehicles[0]?.vehicleId ?? null);
            } catch (err) {
                setToast({ message: getApiErrorMessage(err, 'No se pudieron cargar los datos.'), type: 'error' });
            }
        };
        init();
    }, []);

    // ── Load expenses whenever vehicle or week changes ─────────────────────────
    const loadExpenses = useCallback(async (vehicleId: number | null, weekKey: string) => {
        const { start, end } = getWeekRange(weekKey);
        const dateFrom = start.toISOString();
        const dateTo   = end.toISOString();

        setIsLoading(true);
        try {
            const expenses = vehicleId === null
                ? await fetchExpensesByFilters({ dateFrom, dateTo })
                : await fetchExpensesByVehicle(vehicleId, { dateFrom, dateTo });
            setAllExpenses(expenses);
        } catch (err) {
            setToast({ message: getApiErrorMessage(err, 'No se pudieron cargar los gastos.'), type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadExpenses(selectedVehicleId, selectedWeek);
    }, [selectedVehicleId, selectedWeek, loadExpenses]);

    // ── Computed ──────────────────────────────────────────────────────────────
    const { start: weekStart, end: weekEnd } = getWeekRange(selectedWeek);

    const tabExpenses = tab === 'ACTIVOS'
        ? allExpenses
        : allExpenses.filter(e => e.status !== 'pending');

    const displayedExpenses = tabExpenses
        .filter(e => categoryFilter === 'all' || e.type === categoryFilter)
        .filter(e => statusFilter   === 'all' || e.status === statusFilter);

    const approvedExpenses = allExpenses.filter(e => e.status === 'approved');
    const pendingExpenses  = allExpenses.filter(e => e.status === 'pending');
    const approvedTotal    = approvedExpenses.reduce((s, e) => s + e.amount, 0);
    const pendingTotal     = pendingExpenses.reduce((s, e) => s + e.amount, 0);

    const totalConsigned = consignments
        .filter(c => {
            const d = new Date(c.consignmentDate);
            const inWeek = d >= weekStart && d < weekEnd;
            const forVehicle = selectedVehicleId === null || c.vehicle?.id === selectedVehicleId;
            return inWeek && forVehicle;
        })
        .reduce((s, c) => s + c.amount, 0);

    const balance = totalConsigned - approvedTotal;

    const selectedVehicleLabel = selectedVehicleId === null
        ? 'Todos los vehículos'
        : (vehicleOptions.find(v => v.vehicleId === selectedVehicleId)?.licensePlate ?? 'Vehículo');

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleWeekNav = (delta: -1 | 1) => {
        setSelectedWeek(w => shiftWeek(w, delta));
        setCategoryFilter('all');
        setStatusFilter('all');
    };

    const handleVehicleSelect = (id: number | null) => {
        setSelectedVehicleId(id);
        setConsignVehicleId(id ?? vehicleOptions[0]?.vehicleId ?? null);
        setVehicleMenuOpen(false);
        setCategoryFilter('all');
        setStatusFilter('all');
    };

    const handleStatusChange = async (status: ExpenseStatus) => {
        if (!selectedExpense) return;
        setIsSubmitting(true);
        try {
            const updated = await updateExpenseStatus(selectedExpense.id, { status });
            setAllExpenses(cur => cur.map(e => e.id === updated.id ? updated : e));
            if (status === 'approved' || status === 'rejected') {
                window.dispatchEvent(new Event('expenseUpdated'));
            }
            setSelectedExpense(null);
            setToast({
                message: status === 'approved' ? 'Gasto aprobado.' : 'Gasto rechazado.',
                type: 'success',
            });
        } catch (err) {
            setToast({ message: getApiErrorMessage(err, 'No se pudo actualizar el gasto.'), type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConsignmentConfirm = async (amount: number) => {
        const vehicle = vehicleOptions.find(v => v.vehicleId === consignVehicleId);
        if (!vehicle?.driverId) {
            setToast({ message: 'El vehículo no tiene conductor asignado.', type: 'error' });
            return;
        }
        setIsSubmitting(true);
        try {
            await createConsignment(vehicle.driverId, vehicle.vehicleId, amount, weekStart.toISOString());
            const updated = await fetchAllConsignments();
            setConsignments(updated);
            setShowConsignment(false);
            setToast({ message: `Consignación de ${formatCurrency(amount)} registrada.`, type: 'success' });
        } catch (err) {
            setToast({ message: getApiErrorMessage(err, 'No se pudo registrar la consignación.'), type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <section className="space-y-4">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <nav className="mb-3 flex items-center gap-1.5 text-[11px]">
                        <Link to="/" className="font-medium text-gray-400 hover:text-gray-600 transition">Inicio</Link>
                        <ChevronRight size={12} className="text-gray-300" />
                        <Link to="/expenses" className="font-medium text-gray-400 hover:text-gray-600 transition">Gastos</Link>
                        <ChevronRight size={12} className="text-gray-300" />
                        <span className="font-semibold text-[#5B5CEB]">Control por ruta</span>
                    </nav>
                    <h1 className="text-[22px] font-bold leading-tight tracking-tight text-gray-900">
                        Control de gastos
                    </h1>
                    <p className="mt-1.5 max-w-[560px] text-[13px] leading-relaxed text-gray-500">
                        Revisa y aprueba gastos por semana, visualiza saldos a favor y exporta reportes.
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                    {/* Vehicle dropdown */}
                    <div ref={vehicleMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setVehicleMenuOpen(o => !o)}
                            className="inline-flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2 text-[13px] font-medium text-gray-700 transition hover:bg-gray-50"
                            style={{ borderColor: CARD_BORDER }}
                        >
                            <Car size={14} className="text-gray-400" />
                            {selectedVehicleLabel}
                            <ChevronDown size={13} className={`text-gray-400 transition-transform ${vehicleMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {vehicleMenuOpen && (
                            <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[220px] overflow-hidden rounded-2xl border bg-white shadow-xl"
                                style={{ borderColor: CARD_BORDER, boxShadow: '0 16px 48px rgba(0,0,0,.12)' }}>
                                <div className="p-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handleVehicleSelect(null)}
                                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] transition ${selectedVehicleId === null ? 'bg-[rgba(91,92,235,0.1)] font-semibold text-[#5B5CEB]' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Todos los vehículos
                                    </button>
                                    {vehicleOptions.map(v => (
                                        <button
                                            key={v.vehicleId}
                                            type="button"
                                            onClick={() => handleVehicleSelect(v.vehicleId)}
                                            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition ${selectedVehicleId === v.vehicleId ? 'bg-[rgba(91,92,235,0.1)] font-semibold text-[#5B5CEB]' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-gray-600">
                                                {v.licensePlate}
                                            </span>
                                            <span className="truncate text-gray-500">{v.driverName}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Consignar */}
                    <button
                        type="button"
                        onClick={() => setShowConsignment(true)}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90"
                        style={{ background: '#5B5CEB' }}
                    >
                        <DollarSign size={14} />
                        Consignar
                    </button>
                </div>
            </header>

            {/* ── Tabs + legend ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 rounded-xl border bg-white p-1" style={{ borderColor: CARD_BORDER }}>
                    <button
                        type="button"
                        onClick={() => setTab('ACTIVOS')}
                        className={`rounded-lg px-5 py-1.5 text-[13px] font-medium transition ${tab === 'ACTIVOS' ? 'border border-gray-200 bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Activos
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('HISTORIAL')}
                        className={`flex items-center gap-1.5 rounded-lg px-5 py-1.5 text-[13px] font-medium transition ${tab === 'HISTORIAL' ? 'border border-gray-200 bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Clock size={13} />
                        Historial
                    </button>
                </div>

                <div className="flex items-center gap-4 text-[12px] text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Aprobado
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Pendiente
                    </span>
                </div>
            </div>

            {/* ── Week navigator + status filter ────────────────────────────── */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 rounded-xl border bg-white px-2 py-1.5" style={{ borderColor: CARD_BORDER }}>
                        <button
                            type="button"
                            onClick={() => handleWeekNav(-1)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <span className="flex items-center gap-2 px-1 text-[13px] font-medium text-gray-700">
                            <Calendar size={13} className="text-gray-400" />
                            {formatWeekDisplay(selectedWeek)}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleWeekNav(1)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                    <span className="text-[12px] text-gray-400">
                        Lun → Dom · {allExpenses.length} gasto{allExpenses.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Status filter */}
                <div ref={statusMenuRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setStatusMenuOpen(o => !o)}
                        className="inline-flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50"
                        style={{ borderColor: CARD_BORDER }}
                    >
                        {STATUS_LABELS[statusFilter]}
                        <ChevronDown size={13} className={`text-gray-400 transition-transform ${statusMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {statusMenuOpen && (
                        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-48 overflow-hidden rounded-2xl border bg-white shadow-xl"
                            style={{ borderColor: CARD_BORDER, boxShadow: '0 16px 48px rgba(0,0,0,.12)' }}>
                            <div className="p-1.5">
                                {(Object.keys(STATUS_LABELS) as StatusFilter[]).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => { setStatusFilter(s); setStatusMenuOpen(false); }}
                                        className={`flex w-full items-center rounded-xl px-3 py-2.5 text-[13px] transition ${statusFilter === s ? 'bg-[rgba(91,92,235,0.1)] font-semibold text-[#5B5CEB]' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {STATUS_LABELS[s]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Category chips ────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-[12px] text-gray-400">
                    <SlidersHorizontal size={13} />
                    Filtrar:
                </span>
                <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${categoryFilter === 'all' ? 'border-b-2 border-[#5B5CEB] text-[#5B5CEB]' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Todos
                </button>
                {(Object.entries(TYPE_CONFIG) as [CategoryFilter, { label: string; color: string }][]).map(([type, cfg]) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setCategoryFilter(type)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition ${categoryFilter === type ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <span className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                        {cfg.label}
                    </button>
                ))}
            </div>

            {/* ── Summary cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {/* Total Consignado */}
                <article className="rounded-2xl border bg-white p-5" style={{ borderColor: CARD_BORDER, boxShadow: CARD_SHADOW }}>
                    <div className="mb-3 flex items-center gap-2">
                        <FileText size={13} className="text-gray-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Total Consignado</span>
                    </div>
                    <p className="text-[26px] font-bold leading-none tracking-tight text-gray-900">
                        {formatCurrency(totalConsigned)}
                    </p>
                    <p className="mt-2 text-[12px] text-gray-400">
                        {selectedVehicleId === null ? `${vehicleOptions.length} vehículos` : '1 vehículo'}
                    </p>
                </article>

                {/* Gastos Aprobados */}
                <article className="rounded-2xl border bg-white p-5" style={{ borderColor: CARD_BORDER, boxShadow: CARD_SHADOW }}>
                    <div className="mb-3 flex items-center gap-2">
                        <TrendingUp size={13} className="text-gray-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Gastos Aprobados</span>
                    </div>
                    <p className="text-[26px] font-bold leading-none tracking-tight text-gray-900">
                        {formatCurrency(approvedTotal)}
                    </p>
                    <p className="mt-2 text-[12px] text-gray-400">{approvedExpenses.length} registros</p>
                </article>

                {/* Por Aprobar */}
                <article className="rounded-2xl border bg-white p-5" style={{ borderColor: CARD_BORDER, boxShadow: CARD_SHADOW }}>
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock size={13} className="text-gray-400" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Por Aprobar</span>
                        </div>
                        {pendingExpenses.length > 0 && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                {pendingExpenses.length} pend.
                            </span>
                        )}
                    </div>
                    <p className="text-[26px] font-bold leading-none tracking-tight text-gray-900">
                        {formatCurrency(pendingTotal)}
                    </p>
                    <p className="mt-2 text-[12px] text-gray-400">{pendingExpenses.length} gastos pendientes</p>
                </article>

                {/* Saldo a Favor */}
                <article className="rounded-2xl border bg-white p-5" style={{ borderColor: CARD_BORDER, boxShadow: CARD_SHADOW }}>
                    <div className="mb-3 flex items-center gap-2">
                        <DollarSign size={13} className="text-gray-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Saldo a Favor Empresa</span>
                    </div>
                    <p className={`text-[26px] font-bold leading-none tracking-tight ${balance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                        {formatCurrency(balance)}
                    </p>
                    <p className="mt-2 text-[12px] text-gray-400">disponible</p>
                </article>
            </div>

            {/* ── Table ─────────────────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: CARD_BORDER, boxShadow: CARD_SHADOW }}>
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="space-y-2 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#5B5CEB]" />
                            <p className="text-[13px] text-gray-400">Cargando gastos...</p>
                        </div>
                    </div>
                ) : displayedExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400">
                            <FileText size={22} />
                        </div>
                        <p className="text-[14px] font-medium text-gray-700">Sin registros esta semana</p>
                        <p className="text-[12px] text-gray-400">
                            {categoryFilter !== 'all' || statusFilter !== 'all'
                                ? 'Prueba cambiando los filtros.'
                                : 'No hay gastos para el período seleccionado.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-100 bg-gray-50/70">
                                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.10em] text-gray-400">
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Vehículo</th>
                                    <th className="px-6 py-4">Ruta / Destino</th>
                                    <th className="px-6 py-4">Conductor</th>
                                    <th className="px-6 py-4">Categoría</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayedExpenses.map(expense => {
                                    const { day, weekday } = formatExpenseDate(expense.expenseDate);
                                    const cfg = TYPE_CONFIG[expense.type] ?? TYPE_CONFIG.other;
                                    return (
                                        <tr
                                            key={expense.id}
                                            onClick={() => setSelectedExpense(expense)}
                                            className="cursor-pointer transition-colors hover:bg-gray-50/60"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-[13px] font-semibold text-gray-900">{day}</p>
                                                <p className="mt-0.5 text-[11px] text-gray-400">{weekday}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-[12px] font-semibold text-gray-600">
                                                    {expense.vehicle?.licensePlate ?? '—'}
                                                </span>
                                            </td>
                                            <td className="max-w-[200px] px-6 py-4">
                                                <p className="truncate text-[13px] font-medium text-gray-700">
                                                    {expense.description ?? '—'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[13px] font-medium text-gray-700">
                                                    {expense.driver.fullName}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
                                                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: cfg.color }} />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={expense.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-[13px] font-bold text-gray-900">
                                                        {formatCurrency(expense.amount)}
                                                    </span>
                                                    {expense.status !== 'pending' && (
                                                        <ChevronRight size={14} className="text-gray-300" />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modals ────────────────────────────────────────────────────── */}
            <ExpenseAuditModal
                isOpen={selectedExpense !== null}
                onClose={() => setSelectedExpense(null)}
                expense={selectedExpense}
                onStatusChange={handleStatusChange}
                isSubmitting={isSubmitting}
            />

            <ConsignmentModal
                isOpen={showConsignment}
                isSubmitting={isSubmitting}
                vehicleOptions={vehicleOptions}
                selectedVehicleId={consignVehicleId}
                selectedWeek={selectedWeek}
                onVehicleChange={setConsignVehicleId}
                onClose={() => setShowConsignment(false)}
                onConfirm={handleConsignmentConfirm}
            />

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </section>
    );
}
