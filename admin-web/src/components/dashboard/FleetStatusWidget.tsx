import { Link } from 'react-router-dom';

interface FleetStatusWidgetProps {
    total: number;
    active: number;
    inWorkshop: number;
    inactive: number;
    documentAlerts: number;
}

export function FleetStatusWidget({ total, active, inWorkshop, inactive, documentAlerts }: FleetStatusWidgetProps) {
    const activePct    = total > 0 ? (active    / total) * 100 : 0;
    const workshopPct  = total > 0 ? (inWorkshop / total) * 100 : 0;
    const inactivePct  = total > 0 ? (inactive  / total) * 100 : 0;

    return (
        <section
            className="flex h-full w-full flex-col rounded-2xl border bg-white p-5"
            style={{
                borderColor: '#ECECF3',
                boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)',
            }}
        >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                        Estado de flota
                    </p>
                    <h2 className="mt-0.5 text-[22px] font-bold leading-none text-gray-900">
                        {total} <span className="text-[15px] font-semibold text-gray-500">vehículos</span>
                    </h2>
                </div>
                <Link
                    to="/vehicles"
                    className="text-[12px] font-semibold text-[#5B5CEB] transition hover:opacity-80"
                >
                    Ver todos →
                </Link>
            </div>

            {/* Segmented bar */}
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                {activePct > 0 && (
                    <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${activePct}%` }}
                        title={`Activos: ${active}`}
                    />
                )}
                {workshopPct > 0 && (
                    <div
                        className="h-full bg-amber-400 transition-all"
                        style={{ width: `${workshopPct}%` }}
                        title={`En taller: ${inWorkshop}`}
                    />
                )}
                {inactivePct > 0 && (
                    <div
                        className="h-full bg-gray-300 transition-all"
                        style={{ width: `${inactivePct}%` }}
                        title={`Inactivos: ${inactive}`}
                    />
                )}
            </div>

            {/* Stats */}
            <div className="mt-4 flex justify-between text-center">
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-medium text-gray-500">Activos</span>
                    </div>
                    <p className="mt-1 text-[20px] font-bold leading-none text-gray-900">{active}</p>
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        <span className="text-[11px] font-medium text-gray-500">En taller</span>
                    </div>
                    <p className="mt-1 text-[20px] font-bold leading-none text-gray-900">{inWorkshop}</p>
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-gray-300" />
                        <span className="text-[11px] font-medium text-gray-500">Inactivos</span>
                    </div>
                    <p className="mt-1 text-[20px] font-bold leading-none text-gray-900">{inactive}</p>
                </div>
            </div>

            {/* Document alerts */}
            {documentAlerts > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <p className="text-[12px] font-medium text-amber-700">
                        {documentAlerts} alerta{documentAlerts !== 1 ? 's' : ''} de documentos
                    </p>
                </div>
            )}
        </section>
    );
}
