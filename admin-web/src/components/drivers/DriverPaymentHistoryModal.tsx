import { MdClose } from 'react-icons/md';
import type { DriverPayment } from '../../services/consignments.service';

interface DriverPaymentHistoryModalProps {
    isOpen: boolean;
    driverName: string;
    payments: DriverPayment[];
    isLoading: boolean;
    onClose: () => void;
}

function formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-CO')}`;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-CO');
}

export function DriverPaymentHistoryModal({
    isOpen,
    driverName,
    payments,
    isLoading,
    onClose,
}: DriverPaymentHistoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Historial de Pagos</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-700 transition hover:bg-slate-100"
                    >
                        <MdClose size={26} />
                    </button>
                </header>

                <div className="space-y-3 px-6 py-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Conductor</p>
                        <h3 className="text-lg font-semibold text-slate-900">{driverName}</h3>
                    </div>

                    <div className="max-h-[280px] space-y-2.5 overflow-auto pr-1">
                        {isLoading && <p className="text-sm text-slate-500">Cargando historial...</p>}

                        {!isLoading && payments.length === 0 && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                                No hay abonos registrados para este conductor.
                            </div>
                        )}

                        {!isLoading && payments.map((payment) => (
                            <article
                                key={payment.id}
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5"
                            >
                                <div>
                                    <p className="text-lg font-semibold leading-tight text-slate-800">{formatCurrency(payment.amount)}</p>
                                    <p className="mt-1.5 text-xs font-medium text-slate-400">{formatDate(payment.consignmentDate)}</p>
                                </div>
                                <p className="text-sm font-bold text-[#5848f4]">{payment.consignmentNumber}</p>
                            </article>
                        ))}
                    </div>
                </div>

                <footer className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-800 transition hover:bg-slate-100"
                    >
                        Cerrar
                    </button>
                </footer>
            </div>
        </div>
    );
}
