import { Link } from 'react-router-dom';
import React from 'react';

// simple sidebar styled with Tailwind
export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-gray-100 flex flex-col">
      <div className="p-4 text-xl font-bold">
        LogiControl
      </div>
      <nav className="flex-1 px-2 space-y-1">
        <Link
          to="/"
          className="block py-2 px-3 rounded hover:bg-gray-700"
        >
          Dashboard
        </Link>
        <Link
          to="/reports"
          className="block py-2 px-3 rounded hover:bg-gray-700"
        >
          Reportes
        </Link>
        <Link
          to="/expenses"
          className="block py-2 px-3 rounded hover:bg-gray-700"
        >
          Gastos
        </Link>
        <Link
          to="/maintenance"
          className="block py-2 px-3 rounded hover:bg-gray-700"
        >
          Mantenimiento
        </Link>
        <Link
          to="/drivers"
          className="block py-2 px-3 rounded hover:bg-gray-700"
        >
          Conductores
        </Link>
        <Link
          to="/vehicles"
          className="block py-2 px-3 rounded hover:bg-gray-700"
        >
          Vehículos
        </Link>
      </nav>
      <div className="p-4 text-sm">
        Admin Demo
      </div>
    </aside>
  );
}
