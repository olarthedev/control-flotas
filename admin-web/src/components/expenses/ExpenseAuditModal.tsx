import { useState, useEffect } from 'react';
import { MdClose, MdPerson, MdLocalShipping } from 'react-icons/md';
import type { ExpenseItem, ExpenseStatus } from '../../services/expenses.service';

interface ExpenseAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense: ExpenseItem | null;
    onStatusChange: (status: ExpenseStatus) => Promise<void>;
    isSubmitting: boolean;
}

const STATUS_LABELS: Record<ExpenseStatus, string> = {
    APPROVED: 'Aprobado',
    PENDING: 'Pendiente',
    OBSERVED: 'Observado',
    REJECTED: 'Rechazado',
};

const STATUS_HEADER_TEXT_COLOR: Record<ExpenseStatus, string> = {
    APPROVED: 'text-emerald-600',
    PENDING: 'text-amber-500',
    OBSERVED: 'text-sky-600',
    REJECTED: 'text-rose-600',
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

function formatCurrency(value: number): string {
    return `$${Math.round(value).toLocaleString('es-CO')}`;
}

function getPrimaryEvidence(expense: ExpenseItem): string | null {
    const primary = expense.evidence.find((e) => e.isPrimary);
    return primary ? primary.fileUrl : expense.evidence[0]?.fileUrl ?? null;
}

export function ExpenseAuditModal({ isOpen, onClose, expense, onStatusChange, isSubmitting }: ExpenseAuditModalProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Dar tiempo al navegador para renderizar el DOM antes de animar
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        }

        setIsVisible(false);
        const timeout = setTimeout(() => setShouldRender(false), 200);
        return () => clearTimeout(timeout);
    }, [isOpen]);

    if (!shouldRender || !expense) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />
            <div
                className={`relative z-10 grid h-[82vh] w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/20 bg-white shadow-[0_40px_100px_-40px_rgba(14,23,38,0.7)] lg:grid-cols-[1.35fr_0.85fr] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
                    }`}
            >
                <div className="relative hidden lg:block">
                    {getPrimaryEvidence(expense) ? (
                        <img
                            src={getPrimaryEvidence(expense)!}
                            alt="Evidencia del gasto"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-[#08133b]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Evidencia digital</p>
                        <p className="mt-1 text-sm font-semibold">
                            Capturado el {new Date(expense.expenseDate).toLocaleDateString('es-CO')}
                        </p>
                    </div>
                </div>

                <div className="relative overflow-y-auto bg-white p-6 lg:p-7">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <MdClose size={24} />
                    </button>

                    <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${STATUS_HEADER_TEXT_COLOR[expense.status]}`}>
                        {STATUS_LABELS[expense.status]} <span className="mx-2 text-slate-300">•</span>{' '}
                        {TYPE_LABELS[expense.type] ?? expense.type}
                    </p>
                    <h3 className="mt-2 text-2xl leading-tight font-semibold text-[#0f1f45] lg:text-3xl">
                        Auditoria de Gasto
                    </h3>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Monto reportado</p>
                        <p className="mt-1.5 text-3xl leading-none font-semibold text-slate-900 lg:text-4xl">
                            {formatCurrency(expense.amount)}
                        </p>
                    </div>

                    <div className="mt-5 space-y-2.5">
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5">
                            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-500">
                                <MdPerson size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Conductor</p>
                                <p className="text-sm leading-tight font-semibold text-slate-700">
                                    {expense.driver.fullName}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5">
                            <div className="rounded-lg bg-slate-100 p-1.5 text-slate-500">
                                <MdLocalShipping size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Vehiculo</p>
                                <p className="text-sm leading-tight font-semibold text-slate-700">
                                    {expense.vehicle?.licensePlate ?? 'Sin placa'}
                                    {expense.vehicle
                                        ? ` - ${expense.vehicle.brand ?? ''} ${expense.vehicle.model ?? ''}`
                                        : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Observaciones del conductor
                        </p>
                        <p className="mt-1.5 text-sm font-medium italic text-slate-600">
                            {expense.notes || expense.description || 'Sin observaciones registradas.'}
                        </p>
                    </div>

                    <div className="sticky bottom-0 mt-5 grid grid-cols-2 gap-2.5 border-t border-slate-200 bg-white/95 pt-4 backdrop-blur">
                        <button
                            disabled={isSubmitting}
                            onClick={() => onStatusChange('REJECTED')}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium tracking-[0.12em] text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                        >
                            RECHAZAR
                        </button>
                        <button
                            disabled={isSubmitting}
                            onClick={() => onStatusChange('APPROVED')}
                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium tracking-[0.12em] text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-60"
                        >
                            APROBAR GASTO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
