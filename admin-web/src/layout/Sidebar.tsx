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
        bg-white
        border-r border-gray-100
        flex flex-col
        z-40
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
      `}
    >
      {/* MENU */}
      <nav className="flex-1 px-3 pt-4 space-y-6 overflow-y-auto overflow-x-hidden">
        {menuSections.map(section => (
          <div key={section.title}>
            <h3
              className="
                px-3 mb-2 text-[10px] font-bold text-gray-400 tracking-widest uppercase
              "
            >
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
                      group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-200
                      ${active
                        ? "bg-[#5c4df2] text-white shadow-sm shadow-indigo-100"
                        : "text-[#64748b] hover:bg-gray-50 hover:text-[#5c4df2]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`relative ${active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-[#5c4df2]"
                          }`}
                      >
                        <Icon size={20} />
                      </div>

                      <span
                        className={`
                          text-[13.5px] tracking-tight whitespace-nowrap
                          ${active
                            ? "font-semibold text-white"
                            : "font-medium text-slate-600 group-hover:text-[#5c4df2]"
                          }
                        `}
                      >
                        {item.label}
                      </span>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className={`
                          text-[10px] font-bold px-1.5 py-0.5 rounded-full
                          ${active
                            ? "bg-white/20 text-white"
                            : "bg-[#f26419] text-white"
                          }
                        `}
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