import { FaDownload } from 'react-icons/fa';
import { PageHeader } from '../layout/PageHeader';

export function DashboardTopBar() {
  return (
    <PageHeader
      breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Dashboard' }]}
      title="Resumen General"
      subtitle="Monitorea el estado financiero de la flota, detecta riesgos tempranos y toma decisiones operativas con mejor contexto."
      actions={
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <FaDownload className="text-slate-500" />
          Exportar reporte
        </button>
      }
    />
  );
}
