import { FaDownload } from 'react-icons/fa';

export function DashboardTopBar() {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[16px] font-semibold text-gray-900 mb-1 tracking-tight leading-5">
          Resumen General
        </h1>
        <p className="text-gray-500 text-sm font-normal">
          Estado actual financiero de la flota
        </p>
      </div>
      <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm">
        <FaDownload className="text-gray-600" />
        <span className="font-medium">Exportar Reporte</span>
      </button>
    </div>
  );
}
