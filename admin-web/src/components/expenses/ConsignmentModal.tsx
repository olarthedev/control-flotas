import { useEffect, useState } from 'react';
import { MdAttachMoney, MdClose, MdPerson } from 'react-icons/md';
import { type VehicleExpenseSummary } from '../../services/expenses-grouped.service';
import { getWeekLabel } from '../../pages/expenses-week.utils';

interface ConsignmentModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    vehicleOptions: VehicleExpenseSummary[];
    selectedVehicleId: number | null;
    selectedWeek: string;
    onVehicleChange: (vehicleId: number) => void;
    onClose: () => void;
    onConfirm: (amount: number) => Promise<void>;
}

export function ConsignmentModal({
    isOpen,
    isSubmitting,
    vehicleOptions,
    selectedVehicleId,
    selectedWeek,
    onVehicleChange,
    onClose,
    onConfirm,
}: ConsignmentModalProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        }

        setIsVisible(false);
        const timer = setTimeout(() => {
            setShouldRender(false);
            setAmount('');
        }, 200);
        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleConfirm = async () => {
        const parsed = parseFloat(amount);
        if (Number.isNaN(parsed) || parsed <= 0) return;
        await onConfirm(parsed);
        setAmount('');
    };

    const selectedVehicleDriver = vehicleOptions.find(
        (vehicleSummary) => vehicleSummary.vehicleId === selectedVehicleId,
    )?.driverName ?? 'Sin conductor';

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div
                className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'}`}
            >
                <div className="border-b border-slate-200 bg-white px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-100 p-2">
                                <MdAttachMoney size={20} className="text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-normal text-slate-800">Nueva Consignación</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <MdClose size={20} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 p-6">
                    <div>
                        <label className="mb-2 block text-xs font-normal text-slate-500">Vehículo</label>
                        <select
                            value={selectedVehicleId ?? ''}
                            onChange={(e) => onVehicleChange(Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            {vehicleOptions.map((vehicleSummary) => (
                                <option key={vehicleSummary.vehicleId} value={vehicleSummary.vehicleId}>
                                    {vehicleSummary.licensePlate.toUpperCase()} - {vehicleSummary.driverName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-600">
                            <MdPerson size={16} />
                            <p className="text-sm font-normal">{selectedVehicleDriver}</p>
                        </div>
                        <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-500">
                            {getWeekLabel(selectedWeek)}
                        </span>
                    </div>

                    <div>
                        <label
                            htmlFor="consignment-amount"
                            className="mb-2 block text-xs font-normal text-slate-500"
                        >
                            Monto a Consignar
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-normal text-slate-400">$</span>
                            <input
                                id="consignment-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-lg font-normal text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50 p-4">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-sm font-normal text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Procesando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
