import { useState } from 'react';
import { MdCheckCircle, MdClose, MdVisibility } from 'react-icons/md';
import type { ExpenseItem, ExpenseStatus } from '../../services/expenses.service';

interface ExpenseCardProps {
    expense: ExpenseItem;
    onStatusUpdate?: (status: ExpenseStatus) => void;
    showActions?: boolean;
}

const STATUS_STYLES: Record<string, { label: string; bgColor: string; textColor: string }> = {
    approved: {
        label: 'Aprobado',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
    },
    pending: {
        label: 'Pendiente',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
    },
    rejected: {
        label: 'Rechazado',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
    },
};

const TYPE_ICONS: Record<string, string> = {
    fuel: '🛢️',
    toll: '🚧',
    food: '🍽️',
    parking: '🅿️',
    maintenance: '🔧',
    lodging: '🏨',
    other: '📝',
};

const TYPE_LABELS: Record<string, string> = {
    fuel: 'Combustible',
    toll: 'Peajes',
    food: 'Alimentación',
    parking: 'Parqueadero',
    maintenance: 'Mantenimiento',
    lodging: 'Alojamiento',
    other: 'Otro',
};

function formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-CO')}`;
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ExpenseCard({ expense, onStatusUpdate, showActions = false }: ExpenseCardProps) {
    const [showDetails, setShowDetails] = useState(false);
    const statusStyle = STATUS_STYLES[expense.status] ?? STATUS_STYLES['pending'];
    const typeIcon = TYPE_ICONS[expense.type] || '📄';
    const typeLabel = TYPE_LABELS[expense.type] || expense.type;
    const hasPrimaryImage = expense.evidence.some((e) => e.isPrimary);

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-1 text-xl">{typeIcon}</div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900">{typeLabel}</h4>
                        <p className="text-xs text-slate-500">{formatDate(expense.expenseDate)}</p>
                    </div>
                </div>
                <div
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}
                >
                    {statusStyle.label}
                </div>
            </div>

            <div className="mb-3 border-t border-slate-100 pt-3">
                <p className="text-lg font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
                {expense.description && <p className="text-xs text-slate-600">{expense.description}</p>}
            </div>

            {hasPrimaryImage && (
                <div className="mb-3">
                    <div className="relative h-32 w-full overflow-hidden rounded-md bg-slate-100">
                        <img
                            src={expense.evidence.find((e) => e.isPrimary)?.fileUrl}
                            alt="Evidencia principal"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                    <div className="flex items-center justify-center gap-1.5">
                        <MdVisibility size={14} />
                        Detalles
                    </div>
                </button>

                {showActions && onStatusUpdate && expense.status === 'pending' && (
                    <button
                        onClick={() => onStatusUpdate('approved')}
                        className="flex-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                        <div className="flex items-center justify-center gap-1.5">
                            <MdCheckCircle size={14} />
                            Aprobar
                        </div>
                    </button>
                )}

                {showActions && onStatusUpdate && expense.status === 'pending' && (
                    <button
                        onClick={() => onStatusUpdate('rejected')}
                        className="flex-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
                    >
                        <div className="flex items-center justify-center gap-1.5">
                            <MdClose size={14} />
                            Rechazar
                        </div>
                    </button>
                )}
            </div>

            {showDetails && (
                <div className="mt-3 border-t border-slate-100 pt-3 space-y-2 text-xs">
                    {expense.rejectionReason && (
                        <div>
                            <p className="font-medium text-slate-700">Razón de rechazo:</p>
                            <p className="text-red-600">{expense.rejectionReason}</p>
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-slate-700">ID:</p>
                        <p className="font-mono text-slate-600">#{expense.id}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
