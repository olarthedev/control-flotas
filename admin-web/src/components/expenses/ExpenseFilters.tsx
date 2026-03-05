import { MdFilterList, MdClose } from 'react-icons/md';
import type { ExpenseStatus } from '../../services/expenses.service';

interface ExpenseFiltersProps {
    statuses: ExpenseStatus[];
    types: string[];
    dateRange: { from: string; to: string };
    onStatusChange: (statuses: ExpenseStatus[]) => void;
    onTypeChange: (types: string[]) => void;
    onDateChange: (range: { from: string; to: string }) => void;
    onReset: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

const STATUS_LABELS: Record<ExpenseStatus, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    OBSERVED: 'Observado',
    REJECTED: 'Rechazado',
};

const TYPE_LABELS: Record<string, string> = {
    FUEL: 'Combustible',
    TOLLS: 'Peajes',
    MEALS: 'Alimentación',
    PARKING: 'Parqueadero',
    MAINTENANCE: 'Mantenimiento',
    LOADING_UNLOADING: 'Cargue y Descargue',
    OTHER: 'Otro',
};

const ALL_STATUS: ExpenseStatus[] = ['PENDING', 'APPROVED', 'OBSERVED', 'REJECTED'];
const ALL_TYPES = ['FUEL', 'TOLLS', 'MEALS', 'PARKING', 'MAINTENANCE', 'LOADING_UNLOADING', 'OTHER'];

export function ExpenseFilters({
    statuses,
    types,
    dateRange,
    onStatusChange,
    onTypeChange,
    onDateChange,
    onReset,
    isOpen,
    onToggle,
}: ExpenseFiltersProps) {
    const activeFiltersCount = statuses.length + types.length + (dateRange.from ? 1 : 0) + (dateRange.to ? 1 : 0);

    const toggleStatus = (status: ExpenseStatus) => {
        onStatusChange(statuses.includes(status) ? statuses.filter((s) => s !== status) : [...statuses, status]);
    };

    const toggleType = (type: string) => {
        onTypeChange(types.includes(type) ? types.filter((t) => t !== type) : [...types, type]);
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
            >
                <div className="flex items-center gap-2">
                    <MdFilterList size={18} className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">Filtros</span>
                    {activeFiltersCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                <span className="text-slate-400">{isOpen ? '▼' : '▶'}</span>
            </button>

            {/* Contenido */}
            {isOpen && (
                <div className="border-t border-slate-200 p-4 space-y-4">
                    {/* Estados */}
                    <div>
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Estado</h4>
                        <div className="space-y-2">
                            {ALL_STATUS.map((status) => (
                                <label key={status} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={statuses.includes(status)}
                                        onChange={() => toggleStatus(status)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">{STATUS_LABELS[status]}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Tipos de gasto */}
                    <div>
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Tipo de gasto</h4>
                        <div className="space-y-2">
                            {ALL_TYPES.map((type) => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={types.includes(type)}
                                        onChange={() => toggleType(type)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">{TYPE_LABELS[type]}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Rango de fechas */}
                    <div>
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Fecha</h4>
                        <div className="space-y-2">
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => onDateChange({ ...dateRange, from: e.target.value })}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Desde"
                            />
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => onDateChange({ ...dateRange, to: e.target.value })}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Hasta"
                            />
                        </div>
                    </div>

                    {/* Botón reset */}
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={onReset}
                            className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <MdClose size={14} />
                                Limpiar filtros
                            </div>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
