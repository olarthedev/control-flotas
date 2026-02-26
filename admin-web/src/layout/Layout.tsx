import React from 'react';
import { Sidebar } from "./Sidebar";

// Definimos la interfaz correctamente para evitar el error en Props
interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar con ancho fijo para que no se mueva */}
      <div className="w-[240px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Área principal con scroll independiente */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          {/* Título alineado correctamente según el mockup */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1e1b4b]">Panel de Control</h2>
              <p className="text-sm text-gray-400 mt-1 font-medium">
                Estado actual financiero de la flota
              </p>
            </div>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 shadow-sm">
              Exportar Reporte
            </button>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};