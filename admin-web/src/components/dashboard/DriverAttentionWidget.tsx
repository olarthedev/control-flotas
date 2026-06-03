import { Link } from 'react-router-dom';
import type { DriverSummary } from '../../services/drivers.service';
import { formatCurrency } from '../../utils/format';

interface DriverAttentionWidgetProps {
    drivers: DriverSummary[];
}

const AVATAR_COLORS = [
    'bg-[#5B5CEB] text-white',
    'bg-emerald-500 text-white',
    'bg-amber-500 text-white',
    'bg-rose-500   text-white',
    'bg-sky-500    text-white',
];

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase() ?? '')
        .join('');
}

export function DriverAttentionWidget({ drivers }: DriverAttentionWidgetProps) {
    const shown = drivers.slice(0, 5);

    return (
        <section
            className="flex h-full w-full flex-col rounded-2xl border bg-white"
            style={{
                borderColor: '#ECECF3',
                boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
                <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                        Requieren atención
                    </p>
                    <h2 className="mt-0.5 text-[15px] font-semibold text-gray-900">Conductores</h2>
                </div>
                <Link
                    to="/drivers"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
                    style={{ borderColor: '#ECECF3' }}
                    title="Ver todos"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 2h8m0 0v8m0-8L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            </div>

            {/* List */}
            {shown.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                    <p className="text-[12px] text-gray-400">Todos los conductores al día</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100/60">
                    {shown.map((driver, index) => (
                        <li key={driver.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50/60">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
                                {getInitials(driver.fullName)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-semibold text-gray-900">
                                    {driver.fullName}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                    {driver.assignedVehiclePlate ?? 'Sin vehículo'}
                                    {driver.isActive ? '' : ' · Inactivo'}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-[13px] font-bold text-red-500">
                                    {formatCurrency(driver.pendingBalance)}
                                </p>
                                <p className="text-[10px] text-gray-400">saldo pendiente</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
