import { MdClose } from 'react-icons/md';
import type { VehicleAssignmentHistoryItem } from '../../services/drivers.service';

interface DriverAssignmentHistoryModalProps {
    isOpen: boolean;
    driverName: string;
    history: VehicleAssignmentHistoryItem[];
    isLoading: boolean;
    onClose: () => void;
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Actual';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return '—';
    }

    return parsed.toLocaleString('es-CO');
}

export function DriverAssignmentHistoryModal({
    isOpen,
    driverName,
    history,
    isLoading,
    onClose,
}: DriverAssignmentHistoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Historial de furgones</h2>
                        <p className="mt-1 text-sm text-slate-500">Conductor: {driverName}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-700 transition hover:bg-slate-100"
                    >
                        <MdClose size={26} />
                    </button>
                </header>

                <div className="max-h-[420px] overflow-auto px-6 py-5">
                    {isLoading && <p className="text-sm text-slate-500">Cargando historial de asignaciones...</p>}

                    {!isLoading && history.length === 0 && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                            No hay cambios de furgón registrados para este conductor.
                        </div>
                    )}

                    {!isLoading && history.length > 0 && (
                        <table className="w-full table-fixed">
                            <thead className="border-b border-slate-200 text-left text-[12px] uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-2 py-3 font-semibold">Furgón</th>
                                    <th className="px-2 py-3 font-semibold">Desde</th>
                                    <th className="px-2 py-3 font-semibold">Hasta</th>
                                    <th className="px-2 py-3 font-semibold">Motivo</th>
                                    <th className="px-2 py-3 font-semibold">Registrado por</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, index) => (
                                    <tr key={`${item.vehicleId}-${item.startDate}-${index}`} className="border-b border-slate-100 text-sm text-slate-700">
                                        <td className="px-2 py-3 font-semibold text-[#5848f4]">{item.vehiclePlate}</td>
                                        <td className="px-2 py-3">{formatDate(item.startDate)}</td>
                                        <td className="px-2 py-3">{formatDate(item.endDate)}</td>
                                        <td className="px-2 py-3">{item.reason?.trim() || 'Sin motivo registrado'}</td>
                                        <td className="px-2 py-3">{item.changedBy?.trim() || 'Sistema'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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
