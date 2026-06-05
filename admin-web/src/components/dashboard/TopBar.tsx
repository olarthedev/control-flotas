import { Download, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function DashboardTopBar() {
    return (
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            {/* Left: breadcrumb + title */}
            <div className="min-w-0 flex-1">
                <nav className="mb-4 flex items-center gap-1.5 text-[12px]">
                    <Link to="/" className="font-medium text-gray-400 transition hover:text-gray-600">
                        Inicio
                    </Link>
                    <ChevronRight size={12} className="text-gray-300" />
                    <span className="font-semibold text-[#5B5CEB]">Dashboard</span>
                </nav>

                <h1 className="text-[26px] font-bold leading-tight tracking-tight text-gray-900">
                    Centro de control
                </h1>
                <p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-gray-500">
                    Estado financiero y operativo de la flota en una sola vista.
                    Detecta riesgos, prioriza acciones y toma decisiones con contexto.
                </p>
            </div>

            {/* Right: actions */}
            <div className="flex shrink-0 items-center gap-2.5">
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
            </div>
        </header>
    );
}
