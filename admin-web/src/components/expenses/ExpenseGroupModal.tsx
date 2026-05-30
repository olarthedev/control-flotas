import { MdClose, MdReceiptLong } from 'react-icons/md';
import { type ExpenseItem, type ExpenseStatus } from '../../services/expenses.service';
import { formatCurrency } from '../../utils/format';

export interface ExpenseSelectionState {
    title: string;
    subtitle: string;
    expenses: ExpenseItem[];
    total: number;
}

interface ExpenseGroupModalProps {
    group: ExpenseSelectionState | null;
    onClose: () => void;
    onSelectExpense: (expense: ExpenseItem) => void;
}

function getExpenseTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        fuel: 'Combustible',
        toll: 'Peajes',
        maintenance: 'Mantenimiento',
        food: 'Comida',
        lodging: 'Alojamiento',
        parking: 'Parqueadero',
        other: 'Otro',
    };
    return labels[type] ?? type;
}

function getStatusLabel(status: ExpenseStatus): string {
    const labels: Record<ExpenseStatus, string> = {
        pending: 'Pendiente',
        approved: 'Aprobado',
        rejected: 'Rechazado',
    };
    return labels[status];
}

function getStatusClasses(status: ExpenseStatus): string {
    const styles: Record<ExpenseStatus, string> = {
        pending: 'border-amber-200 bg-amber-50 text-amber-700',
        approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        rejected: 'border-rose-200 bg-rose-50 text-rose-700',
    };
    return styles[status];
}

export function ExpenseGroupModal({ group, onClose, onSelectExpense }: ExpenseGroupModalProps) {
    if (!group) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_40px_120px_-30px_rgba(15,23,42,0.45)]">
                <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
                                <MdReceiptLong size={14} />
                                Revision de gastos
                            </div>
                            <h3 className="mt-3 text-2xl font-semibold text-[#0f1f45]">{group.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">{group.subtitle}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
                        >
                            <MdClose size={22} />
                        </button>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-4 rounded-2xl border border-white/70 bg-white/90 px-4 py-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Total mostrado en tabla</p>
                            <p className="mt-1 text-3xl font-semibold text-slate-900">{formatCurrency(group.total)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Registros incluidos</p>
                            <p className="mt-1 text-lg font-semibold text-slate-700">{group.expenses.length}</p>
                        </div>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
                    <div className="space-y-3">
                        {group.expenses.map((expense) => (
                            <button
                                key={expense.id}
                                onClick={() => onSelectExpense(expense)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-slate-50 hover:shadow-sm"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold text-[#12264f]">{getExpenseTypeLabel(expense.type)}</span>
                                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(expense.status)}`}>
                                                {getStatusLabel(expense.status)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {new Date(expense.expenseDate).toLocaleString('es-CO', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                        <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-700">
                                            {expense.description ?? 'Sin observaciones registradas.'}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-left sm:text-right">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Monto</p>
                                        <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(expense.amount)}</p>
                                        <p className="mt-2 text-xs font-medium text-indigo-600">Abrir auditoria</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
