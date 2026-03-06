import { Link, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdAttachMoney,
  MdBuild,
  MdPeople,
  MdDirectionsBus,
  MdNotifications,
  MdSettings,
  MdLogout
} from "react-icons/md";

export function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const menuSections = [
    {
      title: "PRINCIPAL",
      items: [{ path: "/", label: "Dashboard", icon: MdDashboard }]
    },
    {
      title: "OPERACIONES",
      items: [
        { path: "/expenses", label: "Gastos", icon: MdAttachMoney, badge: "3" },
        { path: "/maintenance", label: "Mantenimiento", icon: MdBuild }
      ]
    },
    {
      title: "RECURSOS",
      items: [
        { path: "/drivers", label: "Conductores", icon: MdPeople },
        { path: "/vehicles", label: "Vehículos", icon: MdDirectionsBus }
      ]
    },
    {
      title: "SISTEMA",
      items: [
        { path: "/notifications", label: "Notificaciones", icon: MdNotifications },
        { path: "/settings", label: "Configuración", icon: MdSettings }
      ]
    }
  ];

  return (
    <aside
      className={`
    fixed
    top-16
    left-0
    h-[calc(100vh-64px)]
    w-64
    bg-[#f6f7fb]
    border-r border-gray-200
    flex flex-col
    z-40
  `}
    >
      {/* MENU */}
      <nav className="flex-1 px-3 pt-4 space-y-6 overflow-y-auto overflow-x-hidden">
        {menuSections.map(section => (
          <div key={section.title}>
            <h3 className="px-3 mb-2 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
              {section.title}
            </h3>

            <div className="space-y-1">
              {section.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                group relative flex items-center justify-between
                px-3 py-2.5 rounded-xl
                transition-all duration-200
                ${active
                        ? "bg-[#e9e8fb] text-[#5c4df2]"
                  : "text-[#64748b] hover:bg-gray-100 hover:text-slate-700"
                      }
              `}
                  >

                    <span
                      className={`
    absolute left-0 top-1/2 -translate-y-1/2
    h-5 w-1 rounded-r
    transition-all duration-300 ease-in-out
    ${active ? "bg-[#5c4df2] opacity-100" : "opacity-0"}
  `}
                    />

                    <div className="flex items-center gap-3">
                      <div
                        className={`
      ${active
                            ? "text-[#5c4df2]"
                            : "text-slate-400 group-hover:text-slate-700"
                          }
    `}
                      >
                        <Icon size={20} />
                      </div>

                      <span
                        className={`
      text-[13.5px] tracking-tight whitespace-nowrap
      ${active
                            ? "font-semibold text-[#5c4df2]"
                            : "font-medium text-slate-600 group-hover:text-slate-700"
                          }
    `}
                      >
                        {item.label}
                      </span>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#f26419] text-white"
                      >
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

      {/* FOOTER */}
      <div className="mt-auto px-3 pb-4">
        <button
          className="
      w-full flex items-center justify-center gap-2
      py-2.5
      text-sm font-medium
      bg-transparent text-slate-500
      rounded-xl
      transition-all duration-300 ease-in-out
      
      outline-none ring-0
      focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0
      
      hover:text-red-600
      hover:bg-red-50
      
      active:scale-[0.98]
      active:bg-red-100
    "
        >
          <MdLogout size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}