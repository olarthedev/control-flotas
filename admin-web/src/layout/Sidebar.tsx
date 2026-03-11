import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Bell,
  Bus,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Wallet,
  Wrench,
} from "lucide-react";
import { fetchPendingExpenses } from "../services/expenses.service";

interface SidebarProps {
  isCollapsed: boolean;
  isExpanded: boolean;
  sidebarWidth: number;
  onHoverChange: (isHovered: boolean) => void;
}

export function Sidebar({ isCollapsed, isExpanded, sidebarWidth, onHoverChange }: SidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [pendingExpensesCount, setPendingExpensesCount] = useState<number>(0);
  const [pendingVehiclePlates, setPendingVehiclePlates] = useState<string[]>([]);

  useEffect(() => {
    const loadPendingExpenses = async () => {
      const pendingExpenses = await fetchPendingExpenses();
      setPendingExpensesCount(pendingExpenses.length);

      const uniquePlates = Array.from(
        new Set(
          pendingExpenses
            .map((expense) => expense.vehicle?.licensePlate?.trim())
            .filter((plate): plate is string => Boolean(plate))
        )
      ).sort((a, b) => a.localeCompare(b));

      setPendingVehiclePlates(uniquePlates);
    };

    loadPendingExpenses();

    // Recargar cada 30 segundos
    const interval = setInterval(loadPendingExpenses, 30000);

    // Escuchar evento de actualización de gastos para recargar inmediatamente
    window.addEventListener('expenseUpdated', loadPendingExpenses);

    return () => {
      clearInterval(interval);
      window.removeEventListener('expenseUpdated', loadPendingExpenses);
    };
  }, []);

  const menuSections = [
    {
      title: "PRINCIPAL",
      items: [{ path: "/", label: "Dashboard", icon: LayoutDashboard }]
    },
    {
      title: "OPERACIONES",
      items: [
        { path: "/expenses", label: "Gastos", icon: Wallet, badge: pendingExpensesCount > 0 ? pendingExpensesCount.toString() : undefined },
        { path: "/maintenance", label: "Mantenimiento", icon: Wrench }
      ]
    },
    {
      title: "RECURSOS",
      items: [
        { path: "/drivers", label: "Conductores", icon: UserRound },
        { path: "/vehicles", label: "Vehículos", icon: Bus }
      ]
    },
    {
      title: "SISTEMA",
      items: [
        { path: "/notifications", label: "Notificaciones", icon: Bell },
        { path: "/settings", label: "Configuración", icon: Settings }
      ]
    }
  ];

  return (
    <aside
      data-sidebar-hover-zone="true"
      className={`
    fixed
    top-16
    left-0
    h-[calc(100vh-64px)]
    bg-[#f6f7fb]
    border-r border-gray-200
    flex flex-col
    transition-[width] duration-300 ease-out
    ${isCollapsed && isExpanded ? "z-[65]" : "z-40"}
    ${isCollapsed && isExpanded ? "shadow-xl" : ""}
  `}
      style={{ width: `${sidebarWidth}px` }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={(event) => {
        const next = event.relatedTarget as HTMLElement | null;
        if (next?.closest('[data-sidebar-hover-zone="true"]')) {
          return;
        }
        onHoverChange(false);
      }}
    >
      {/* MENU */}
      <nav className="flex-1 pt-4 space-y-6 overflow-y-auto overflow-x-hidden px-3">
        {menuSections.map(section => (
          <div key={section.title}>
            {isExpanded && (
              <h3 className="px-3 mb-2 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                {section.title}
              </h3>
            )}

            <div className="space-y-1">
              {section.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={`
                group relative flex items-center
                justify-start px-3 py-2.5 rounded-xl
                transition-colors duration-300 ease-out
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
      flex h-5 w-5 items-center justify-center
      transition-colors duration-300 ease-out
      ${active
                            ? "text-[#5c4df2]"
                            : "text-slate-400 group-hover:text-slate-700"
                          }
    `}
                      >
                        <Icon size={18} strokeWidth={2} />
                      </div>

                      {isExpanded && (
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
                      )}
                    </div>

                    {/* Badge */}
                    {isExpanded && item.badge && (
                      <div className="relative ml-auto">
                        <span
                          className="peer inline-flex min-w-[20px] justify-center rounded-full bg-[#f26419] px-1.5 py-0.5 text-[10px] font-bold text-white"
                        >
                          {item.badge}
                        </span>

                        {item.path === "/expenses" && pendingVehiclePlates.length > 0 && (
                          <div
                            className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 text-left opacity-0 shadow-lg transition-all duration-200 peer-hover:translate-y-0 peer-hover:opacity-100"
                          >
                            <p className="mb-2 text-[11px] font-medium text-slate-500">Vehículos con gastos pendientes</p>
                            <div className="space-y-1">
                              {pendingVehiclePlates.map((plate) => (
                                <p key={plate} className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
                                  {plate.toUpperCase()}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
          title="Cerrar sesión"
        >
          <LogOut size={16} strokeWidth={2} />
          {isExpanded && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}