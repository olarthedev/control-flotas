import { useNavigate } from 'react-router-dom';
import { MdArrowForward, MdCheckCircle, MdPending, MdWarning } from 'react-icons/md';
import type { VehicleExpenseSummary } from '../../services/expenses-grouped.service';

interface VehicleExpenseCardProps {
    vehicle: VehicleExpenseSummary;
}

function formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-CO')}`;
}

export function VehicleExpenseCard({ vehicle }: VehicleExpenseCardProps) {
    const navigate = useNavigate();

    const totalReceipts = vehicle.pendingCount + vehicle.approvedCount + vehicle.observedCount + vehicle.rejectedCount;

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">{vehicle.licensePlate.toUpperCase()}</h3>
                    <p className="text-xs text-slate-500">
                        {vehicle.brand} {vehicle.model} • {vehicle.driverName}
                    </p>
                </div>
            </div>

            {/* Estadísticas principales */}
            <div className="mb-4 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Gastos mes actual</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(vehicle.monthlyTotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Total recibos</span>
                    <span className="text-sm font-medium text-slate-700">{totalReceipts}</span>
                </div>
            </div>

            {/* Estado de recibos */}
            <div className="mb-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                {/* Pendientes */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <MdPending size={14} className="text-orange-500" />
                        <span className="font-semibold text-orange-600">{vehicle.pendingCount}</span>
                    </div>
                    <p className="text-xs text-slate-500">Pendientes</p>
                </div>

                {/* Aprobados */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <MdCheckCircle size={14} className="text-emerald-500" />
                        <span className="font-semibold text-emerald-600">{vehicle.approvedCount}</span>
                    </div>
                    <p className="text-xs text-slate-500">Aprobados</p>
                </div>

                {/* Observados */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <MdWarning size={14} className="text-amber-500" />
                        <span className="font-semibold text-amber-600">{vehicle.observedCount}</span>
                    </div>
                    <p className="text-xs text-slate-500">Observados</p>
                </div>
            </div>

            {/* Botón de acción */}
            <button
                onClick={() => navigate(`/expenses/vehicle/${vehicle.vehicleId}`)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
                <div className="flex items-center justify-center gap-2">
                    Ver gastos
                    <MdArrowForward size={14} />
                </div>
            </button>
        </div>
    );
}
