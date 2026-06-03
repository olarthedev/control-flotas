import { Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MaintenanceRecord, MaintenanceType } from '../../services/maintenance.service';

interface MaintenanceListWidgetProps {
    records: MaintenanceRecord[];
}

const PRIORITY: Record<MaintenanceType, { label: string; style: string }> = {
    emergency:  { label: 'alta',   style: 'bg-red-50    text-red-600    border border-red-200' },
    corrective: { label: 'media',  style: 'bg-amber-50  text-amber-700  border border-amber-200' },
    preventive: { label: 'baja',   style: 'bg-gray-100  text-gray-500   border border-gray-200' },
};

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function MaintenanceListWidget({ records }: MaintenanceListWidgetProps) {
    const shown = records.slice(0, 5);

    return (
        <section
            className="flex flex-col rounded-2xl border bg-white"
            style={{
                borderColor: '#ECECF3',
                boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between border-b px-5 py-4" style={{ borderColor: '#F3F4F6' }}>
                <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                        Próximos servicios
                    </p>
                    <h2 className="mt-0.5 text-[15px] font-semibold text-gray-900">Mantenimientos</h2>
                </div>
                <Link
                    to="/maintenance"
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
                    <Wrench size={20} className="text-gray-300" />
                    <p className="text-[12px] text-gray-400">Sin mantenimientos próximos</p>
                </div>
            ) : (
                <ul className="divide-y" style={{ borderColor: '#F9FAFB' }}>
                    {shown.map((record) => {
                        const p = PRIORITY[record.type];
                        return (
                            <li key={record.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50/60">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                    <Wrench size={14} className="text-gray-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-semibold text-gray-900">
                                        {record.title}
                                    </p>
                                    <p className="text-[11px] text-gray-400">
                                        {record.vehicle.licensePlate} · {formatDate(record.maintenanceDate)}
                                    </p>
                                </div>
                                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${p.style}`}>
                                    {p.label}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
