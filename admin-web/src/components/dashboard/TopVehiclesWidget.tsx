import type { VehicleExpenseSummary } from '../../services/expenses-grouped.service';
import { formatCurrency } from '../../utils/format';

interface TopVehiclesWidgetProps {
    vehicles: VehicleExpenseSummary[];
}

export function TopVehiclesWidget({ vehicles }: TopVehiclesWidgetProps) {
    const top = vehicles.slice(0, 6);
    const max = top[0]?.totalExpenses ?? 1;

    return (
        <section
            className="flex h-full w-full flex-col rounded-2xl border bg-white p-5"
            style={{
                borderColor: '#ECECF3',
                boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)',
            }}
        >
            {/* Header */}
            <div className="mb-4">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                    Costo acumulado
                </p>
                <h2 className="mt-0.5 text-[15px] font-semibold text-gray-900">Top vehículos</h2>
            </div>

            {top.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-6">
                    <p className="text-[12px] text-gray-400">Sin datos de gastos</p>
                </div>
            ) : (
                <ul className="flex flex-col gap-3">
                    {top.map((v) => {
                        const barWidth = max > 0 ? (v.totalExpenses / max) * 100 : 0;
                        return (
                            <li key={v.vehicleId} className="flex items-center gap-3">
                                <span className="w-[68px] shrink-0 text-[12px] font-semibold text-gray-700">
                                    {v.licensePlate}
                                </span>
                                <div className="relative flex-1 overflow-hidden rounded-full bg-gray-100" style={{ height: '8px' }}>
                                    <div
                                        className="absolute left-0 top-0 h-full rounded-full transition-all"
                                        style={{
                                            width: `${barWidth}%`,
                                            background: 'linear-gradient(90deg, #5B5CEB 0%, #7C7DF8 100%)',
                                        }}
                                    />
                                </div>
                                <span className="w-[80px] shrink-0 text-right text-[12px] font-semibold text-gray-900">
                                    {formatCurrency(v.totalExpenses)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
