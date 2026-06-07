import { Download, CalendarDays } from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';

export function DashboardTopBar() {
    return (
        <PageHeader
            breadcrumbs={[{ label: 'Inicio', to: '/' }, 'Dashboard']}
            title="Centro de control"
            subtitle="Estado financiero y operativo de la flota en una sola vista. Detecta riesgos, prioriza acciones y toma decisiones con contexto."
            actions={
                <>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50"
                        style={{ borderColor: 'var(--card-border)' }}
                    >
                        <CalendarDays size={14} className="text-gray-400" />
                        Esta semana
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-gray-400">
                            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90"
                        style={{ background: '#5B5CEB' }}
                    >
                        <Download size={14} />
                        Exportar reporte
                    </button>
                </>
            }
        />
    );
}
