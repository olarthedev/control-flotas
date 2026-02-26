import { Link, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdAttachMoney,
  MdBuild,
  MdPeople,
  MdDirectionsBus,
  MdNotifications,
  MdSettings,
  MdLogout
} from 'react-icons/md';

export function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const menuSections = [
    {
      title: 'PRINCIPAL',
      items: [{ path: '/', label: 'Dashboard', icon: MdDashboard }]
    },
    {
      title: 'OPERACIONES',
      items: [
        { path: '/expenses', label: 'Gastos', icon: MdAttachMoney, badge: '3' },
        { path: '/maintenance', label: 'Mantenimiento', icon: MdBuild }
      ]
    },
    {
      title: 'RECURSOS',
      items: [
        { path: '/drivers', label: 'Conductores', icon: MdPeople },
        { path: '/vehicles', label: 'Vehículos', icon: MdDirectionsBus }
      ]
    },
    {
      title: 'SISTEMA',
      items: [
        { path: '/notifications', label: 'Notificaciones', icon: MdNotifications },
        { path: '/settings', label: 'Configuración', icon: MdSettings }
      ]
    }
  ];

  return (
    <aside className="w-[240px] bg-white border-r border-gray-100 h-screen flex flex-col pt-6">

      {/* HEADER: Ajustado para que quepa perfectamente y no se vea gigante */}
      {/* Reemplaza solo el bloque del HEADER en tu Sidebar.tsx */}
      <div className="px-4 py-3 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-3">
          {/* Icono estándar */}
          <div className="w-8 h-8 bg-[#5c4df2] rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-sm">
            <MdDirectionsBus size={18} />
          </div>

          <div className="min-w-0">
            {/* Texto más profesional */}
            <div className="text-base font-bold text-[#444ce7] leading-tight whitespace-nowrap">
              LogiControl
            </div>
            <div className="text-[9px] font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Fleet Management System
            </div>
          </div>
        </div>
      </div>

      {/* MENU: Texto Gris Oscuro (No Negrita) para inactivos */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
        {menuSections.map(section => (
          <div key={section.title}>
            {/* Títulos de sección en gris claro y pequeño */}
            <h3 className="px-3 mb-2 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
              {section.title}
            </h3>

            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      group flex items-center justify-between px-3 py-2 rounded-xl transition-colors duration-150
                      ${active
                        ? 'bg-[#5c4df2] text-white shadow-sm shadow-indigo-100'
                        : 'text-[#64748b] hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icono en gris suave para inactivos */}
                      <Icon size={18} className={`${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className={`text-[13.5px] tracking-tight ${active ? 'font-semibold text-white' : 'font-medium text-[#475569]'}`}>
                        {item.label}
                      </span>
                    </div>

                    {item.badge && (
                      <span className={`
                        text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center
                        ${active ? 'bg-white/20 text-white' : 'bg-[#f26419] text-white'}
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER: Perfil compacto */}
      <div className="p-3 border-t border-gray-50">
        <div className="flex items-center justify-between p-2 bg-gray-50/50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e8eaf6] rounded-lg flex items-center justify-center text-[#5c4df2] font-bold text-xs">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#1a1a1a] truncate leading-none">Admin Demo</p>
              <p className="text-[9px] text-gray-500 truncate mt-1">admin@logicont...</p>
            </div>
          </div>
          <button className="p-1.5 bg-transparent text-[#5c4df2] border border-[#5c4df2] rounded-lg hover:bg-[#f0f4ff] transition-colors">
            <MdLogout size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}