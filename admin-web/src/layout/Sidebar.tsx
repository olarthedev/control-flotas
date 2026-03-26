import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { fetchPendingExpenseVehiclePlates, fetchPendingExpensesCount } from "../services/expenses.service";

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
  const [pendingExpenseVehicles, setPendingExpenseVehicles] = useState<string[]>([]);
  const [isExpensesTooltipOpen, setIsExpensesTooltipOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const expensesBadgeRef = useRef<HTMLSpanElement | null>(null);
  const closeTooltipTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const loadPendingCount = async () => {
      const [count, vehicles] = await Promise.all([
        fetchPendingExpensesCount(),
        fetchPendingExpenseVehiclePlates(),
      ]);
      setPendingExpensesCount(count);
      setPendingExpenseVehicles(vehicles);
    };

    loadPendingCount();

    // Recargar cada 30 segundos
    const interval = setInterval(loadPendingCount, 30000);

    // Escuchar evento de actualización de gastos para recargar inmediatamente
    window.addEventListener('expenseUpdated', loadPendingCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('expenseUpdated', loadPendingCount);
    };
  }, []);

  useEffect(() => {
    if (!isExpensesTooltipOpen) {
      return;
    }

    const updateTooltipPosition = () => {
      if (!expensesBadgeRef.current) {
        return;
      }

      const rect = expensesBadgeRef.current.getBoundingClientRect();
      const tooltipWidth = 320;
      const gap = 18;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = rect.right + gap;
      if (left + tooltipWidth > viewportWidth - 24) {
        left = Math.max(24, rect.left - tooltipWidth - gap);
      }

      const top = Math.min(
        Math.max(88, rect.top + rect.height / 2 - 110),
        viewportHeight - 260,
      );

      setTooltipPosition({ top, left });
    };

    updateTooltipPosition();
    window.addEventListener('resize', updateTooltipPosition);
    window.addEventListener('scroll', updateTooltipPosition, true);

    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition, true);
    };
  }, [isExpensesTooltipOpen, sidebarWidth, isExpanded]);

  useEffect(() => {
    if (pendingExpensesCount <= 0) {
      setIsExpensesTooltipOpen(false);
    }
  }, [pendingExpensesCount]);

  const clearTooltipCloseTimeout = () => {
    if (closeTooltipTimeoutRef.current !== null) {
      window.clearTimeout(closeTooltipTimeoutRef.current);
      closeTooltipTimeoutRef.current = null;
    }
  };

  const openExpensesTooltip = () => {
    clearTooltipCloseTimeout();
    setIsExpensesTooltipOpen(true);
  };

  const scheduleExpensesTooltipClose = () => {
    clearTooltipCloseTimeout();
    closeTooltipTimeoutRef.current = window.setTimeout(() => {
      setIsExpensesTooltipOpen(false);
    }, 120);
  };

  useEffect(() => {
    return () => {
      clearTooltipCloseTimeout();
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
      <nav className="flex-1 overflow-y-auto px-3 pt-4">
        {menuSections.map(section => (
          <div key={section.title} className="mb-6 overflow-visible last:mb-0">
            {isExpanded && (
              <h3 className="px-3 mb-2 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
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
                      <div className="relative ml-auto overflow-visible">
                        <span
                          ref={item.path === "/expenses" ? expensesBadgeRef : null}
                          onMouseEnter={item.path === "/expenses" ? openExpensesTooltip : undefined}
                          onMouseLeave={item.path === "/expenses" ? scheduleExpensesTooltipClose : undefined}
                          className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#f26419] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm"
                        >
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

      {isExpensesTooltipOpen && pendingExpensesCount > 0 && createPortal(
        <div
          data-sidebar-hover-zone="true"
          onMouseEnter={openExpensesTooltip}
          onMouseLeave={scheduleExpensesTooltipClose}
          className="fixed z-[120] w-80"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/96 shadow-[0_35px_90px_-24px_rgba(15,23,42,0.42)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,_rgba(88,72,244,0.16),_transparent_58%),radial-gradient(circle_at_top_right,_rgba(242,100,25,0.12),_transparent_52%)]" />

            <div className="relative px-5 pb-5 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Revision pendiente
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#12264f]">
                    Gastos por auditar
                  </h3>
                </div>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  {pendingExpensesCount} pendiente{pendingExpensesCount === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-medium text-slate-600">
                  Vehiculos con registros pendientes de validacion
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pendingExpenseVehicles.length > 0 ? (
                    pendingExpenseVehicles.map((plate) => (
                      <span
                        key={plate}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-slate-700 shadow-sm"
                      >
                        {plate}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No hay placas disponibles para mostrar.</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
                <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <p className="text-[12px] leading-5 text-slate-600">
                  Entra a la seccion de Gastos para revisar soportes, validar montos y aprobar o rechazar cada registro pendiente.
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </aside>
  );
}