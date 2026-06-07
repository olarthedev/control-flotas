import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Bell,
  Bus,
  ClipboardList,
  LayoutDashboard,
  Settings,
  UserRound,
  Wallet,
  Wrench,
} from "lucide-react";
import { fetchPendingExpensesCount } from "../services/expenses.service";

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

  useEffect(() => {
    const loadPendingCount = async () => {
      const count = await fetchPendingExpensesCount();
      setPendingExpensesCount(count);
    };

    loadPendingCount();

    const interval = setInterval(loadPendingCount, 30000);
    window.addEventListener('expenseUpdated', loadPendingCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('expenseUpdated', loadPendingCount);
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
        { path: "/maintenance", label: "Mantenimiento", icon: Wrench },
        { path: "/drivers/liquidation", label: "Liquidaciones", icon: ClipboardList }
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
    bg-white
    border-r border-gray-100
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
      <nav className="flex-1 overflow-y-auto px-3 pt-4">
        {menuSections.map(section => (
          <div key={section.title} className="mb-6 overflow-visible last:mb-0">
            {isExpanded && (
              <h3 className="px-3 mb-2 text-[11px] font-semibold text-gray-400 tracking-[0.14em] uppercase">
                {section.title}
              </h3>
            )}

            <div className="space-y-1 overflow-visible">
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
                justify-start px-3 py-3 rounded-[14px]
                transition-colors duration-300 ease-out
                ${active
                        ? "bg-[rgba(91,92,235,0.12)] text-[#5B5CEB]"
                        : "text-[#64748b] hover:bg-gray-50 hover:text-slate-700"
                      }
              `}
                  >

                    <div className="flex items-center gap-3">
                      <div
                        className={`
      flex h-5 w-5 items-center justify-center
      transition-colors duration-300 ease-out
      ${active
                            ? "text-[#5B5CEB]"
                            : "text-slate-400 group-hover:text-slate-600"
                          }
    `}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                      </div>

                      {isExpanded && (
                        <span
                          className={`
      text-[14px] tracking-tight whitespace-nowrap
      ${active
                              ? "font-semibold text-[#5B5CEB]"
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
                      <div className="relative ml-auto overflow-visible">
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
