import React from 'react';

export function TopBar() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="text-lg font-semibold">Panel de Control</div>
      <div className="flex items-center space-x-4">
        {/* placeholder for notifications/profile */}
        <span className="text-sm text-gray-600">Administrador Central</span>
      </div>
    </header>
  );
}
