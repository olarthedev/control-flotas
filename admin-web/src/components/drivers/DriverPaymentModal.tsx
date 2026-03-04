import { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';

interface DriverPaymentModalProps {
    isOpen: boolean;
    driverName: string;
    pendingBalance: number;
    onClose: () => void;
    onConfirm: (amount: number) => Promise<void>;
}

function formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-CO')}`;
}

function formatAmount(value: string): string {
    // Remover caracteres no numéricos
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';

    // Agregar separadores: . para el primer grupo de miles, ' para millones
    let formatted = '';
    const digits = numericValue.split('').reverse();

    for (let i = 0; i < digits.length; i++) {
        if (i > 0 && i % 3 === 0) {
            // Primera separación (posición 3) usa punto, las demás apóstrofe
            formatted = (i === 3 ? '.' : "'") + formatted;
        }
        formatted = digits[i] + formatted;
    }

    return formatted;
}

function parseAmount(formatted: string): number {
    return Number(formatted.replace(/[.']/g, ''));
}

export function DriverPaymentModal({
    isOpen,
    driverName,
    pendingBalance,
    onClose,
    onConfirm,
}: DriverPaymentModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setError(null);
            setIsSaving(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const parsedAmount = parseAmount(amount);
    const isInvalidAmount = !amount || parsedAmount <= 0 || parsedAmount > pendingBalance;

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatAmount(event.target.value);
        setAmount(formatted);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isInvalidAmount) {
            setError('Ingresa un monto válido (mayor a 0 y no mayor al saldo pendiente).');
            return;
        }

        try {
            setError(null);
            setIsSaving(true);
            await onConfirm(parsedAmount);
            onClose();
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'No se pudo registrar el abono.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Abonar a Salario</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-700 transition hover:bg-slate-100"
                    >
                        <MdClose size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                    <section className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-400">Conductor</p>
                        <h3 className="mt-1 text-lg font-semibold leading-tight text-indigo-950">{driverName}</h3>
                        <div className="mt-2.5 flex items-center justify-between">
                            <span className="text-sm font-medium text-indigo-600">Saldo Pendiente:</span>
                            <span className="text-lg font-semibold text-indigo-900">{formatCurrency(pendingBalance)}</span>
                        </div>
                    </section>

                    <div>
                        <label htmlFor="amount" className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                            Monto del abono
                        </label>
                        <div className="flex items-center rounded-xl border-2 border-indigo-100 bg-white px-3">
                            <span className="mr-2 text-xl font-semibold text-slate-400">$</span>
                            <input
                                id="amount"
                                type="text"
                                inputMode="numeric"
                                value={amount}
                                onChange={handleAmountChange}
                                className="h-12 w-full bg-transparent text-xl font-semibold text-slate-800 outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

                    <footer className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 rounded-xl border border-slate-200 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isInvalidAmount}
                            className="h-11 rounded-xl bg-[#9a93e9] text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? 'Guardando...' : 'Confirmar Abono'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
