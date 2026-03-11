import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Archive,
  Check,
  CheckCheck,
  ChevronRight,
  Circle,
  ExternalLink,
  Info,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Toast, type ToastType } from "../components/Toast";

type NotificationSeverity = "info" | "warning" | "critical" | "success";
type NotificationCategory = "operacion" | "finanzas" | "seguridad" | "sistema";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  moduleLabel: string;
  read: boolean;
  archived: boolean;
  actionPath?: string;
  actionLabel?: string;
}

type TabFilter = "all" | "unread" | NotificationCategory | "critical";

const STORAGE_KEY = "logi.notifications.center.v1";

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-001",
    title: "Gasto pendiente por aprobacion",
    message: "El gasto de peaje del vehiculo KXL-902 lleva 28 horas sin validar.",
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    severity: "warning",
    category: "finanzas",
    moduleLabel: "Gastos",
    read: false,
    archived: false,
    actionPath: "/expenses",
    actionLabel: "Ir a gastos",
  },
  {
    id: "n-002",
    title: "Mantenimiento vencido",
    message: "La unidad FTR-118 supero la fecha de mantenimiento preventivo.",
    createdAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    severity: "critical",
    category: "operacion",
    moduleLabel: "Mantenimiento",
    read: false,
    archived: false,
    actionPath: "/maintenance",
    actionLabel: "Ver mantenimientos",
  },
  {
    id: "n-003",
    title: "Intento de acceso bloqueado",
    message: "Se detecto un intento de inicio de sesion desde una IP no autorizada.",
    createdAt: new Date(Date.now() - 1000 * 60 * 93).toISOString(),
    severity: "critical",
    category: "seguridad",
    moduleLabel: "Seguridad",
    read: false,
    archived: false,
    actionPath: "/settings/advanced",
    actionLabel: "Revisar seguridad",
  },
  {
    id: "n-004",
    title: "Consignacion conciliada",
    message: "Se concilio correctamente una consignacion por $1.240.000.",
    createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    severity: "success",
    category: "finanzas",
    moduleLabel: "Consignaciones",
    read: true,
    archived: false,
    actionPath: "/consignments",
    actionLabel: "Ver consignaciones",
  },
  {
    id: "n-005",
    title: "Nuevo conductor sin documentos completos",
    message: "Faltan soportes obligatorios para completar el alta del conductor Diego M.",
    createdAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    severity: "warning",
    category: "operacion",
    moduleLabel: "Conductores",
    read: true,
    archived: false,
    actionPath: "/drivers",
    actionLabel: "Abrir conductores",
  },
  {
    id: "n-006",
    title: "Actualizacion del sistema aplicada",
    message: "El panel administrativo fue actualizado correctamente a la version 3.12.4.",
    createdAt: new Date(Date.now() - 1000 * 60 * 350).toISOString(),
    severity: "info",
    category: "sistema",
    moduleLabel: "Sistema",
    read: true,
    archived: false,
    actionPath: "/settings",
    actionLabel: "Ver configuracion",
  },
];

const loadNotifications = (): NotificationItem[] => {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATIONS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_NOTIFICATIONS;
    }

    const parsed = JSON.parse(raw) as NotificationItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_NOTIFICATIONS;
    }

    return parsed;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
};

const sortByDateDesc = (items: NotificationItem[]) =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const toRelativeTime = (isoDate: string): string => {
  const now = Date.now();
  const diffMs = now - new Date(isoDate).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (minutes < 60) {
    return `Hace ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Hace ${hours} h`;
  }

  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
};

const severityStyles: Record<NotificationSeverity, { dot: string; bg: string; text: string; icon: React.ReactNode }> = {
  info: {
    dot: "bg-sky-500",
    bg: "bg-sky-50",
    text: "text-sky-700",
    icon: <Info size={14} />,
  },
  warning: {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: <AlertTriangle size={14} />,
  },
  critical: {
    dot: "bg-rose-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    icon: <ShieldAlert size={14} />,
  },
  success: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: <Check size={14} />,
  },
};

export const NotificationsPage = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    sortByDateDesc(loadNotifications()),
  );
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(notifications[0]?.id ?? null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const persist = (next: NotificationItem[]) => {
    setNotifications(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read && !n.archived).length, [notifications]);
  const criticalCount = useMemo(
    () => notifications.filter((n) => n.severity === "critical" && !n.archived).length,
    [notifications],
  );
  const archivedCount = useMemo(() => notifications.filter((n) => n.archived).length, [notifications]);

  const visibleNotifications = useMemo(() => {
    return notifications
      .filter((n) => !n.archived)
      .filter((n) => {
        if (activeTab === "all") return true;
        if (activeTab === "unread") return !n.read;
        if (activeTab === "critical") return n.severity === "critical";
        return n.category === activeTab;
      })
      .filter((n) => {
        if (!query) return true;
        const text = `${n.title} ${n.message} ${n.moduleLabel} ${n.category}`.toLowerCase();
        return text.includes(query);
      });
  }, [notifications, activeTab, query]);

  const selected = visibleNotifications.find((n) => n.id === selectedId) ?? visibleNotifications[0] ?? null;

  const markAsRead = (id: string) => {
    const next = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    persist(next);
  };

  const markAllRead = () => {
    const next = notifications.map((n) => (n.archived ? n : { ...n, read: true }));
    persist(next);
    setToast({ message: "Todas las notificaciones se marcaron como leidas.", type: "success" });
  };

  const archiveNotification = (id: string) => {
    const next = notifications.map((n) => (n.id === id ? { ...n, archived: true, read: true } : n));
    persist(next);
    setToast({ message: "Notificacion archivada.", type: "info" });
  };

  const clearArchived = () => {
    const next = notifications.filter((n) => !n.archived);
    persist(next);
    setToast({ message: "Archivadas eliminadas.", type: "warning" });
  };

  const onSelectNotification = (item: NotificationItem) => {
    setSelectedId(item.id);
    if (!item.read) {
      markAsRead(item.id);
    }
  };

  return (
    <div className="space-y-5 pb-2">
      <PageHeader
        breadcrumbs={[{ label: "Inicio", to: "/" }, { label: "Notificaciones" }]}
        title="Centro de notificaciones"
        subtitle="Supervisa alertas operativas, financieras y de seguridad en una sola vista."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              <CheckCheck size={16} />
              Marcar todo leido
            </button>
            <button
              type="button"
              onClick={clearArchived}
              disabled={archivedCount === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              <Archive size={16} />
              Limpiar archivadas
            </button>
          </div>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <FilterButton label="Todas" active={activeTab === "all"} onClick={() => setActiveTab("all")} />
            <FilterButton
              label={`Sin leer (${unreadCount})`}
              active={activeTab === "unread"}
              onClick={() => setActiveTab("unread")}
            />
            <FilterButton
              label={`Criticas (${criticalCount})`}
              active={activeTab === "critical"}
              onClick={() => setActiveTab("critical")}
            />
            <FilterButton
              label="Operacion"
              active={activeTab === "operacion"}
              onClick={() => setActiveTab("operacion")}
            />
            <FilterButton
              label="Finanzas"
              active={activeTab === "finanzas"}
              onClick={() => setActiveTab("finanzas")}
            />
            <FilterButton
              label="Seguridad"
              active={activeTab === "seguridad"}
              onClick={() => setActiveTab("seguridad")}
            />
            <FilterButton
              label="Sistema"
              active={activeTab === "sistema"}
              onClick={() => setActiveTab("sistema")}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Mostrando {visibleNotifications.length} notificacion{visibleNotifications.length === 1 ? "" : "es"}
          </p>
        </div>

        <div className="grid min-h-[620px] lg:grid-cols-[370px_1fr]">
          <div className="border-r border-slate-200 bg-slate-50/60">
            <div className="max-h-[620px] overflow-y-auto p-2.5">
              {visibleNotifications.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  No hay notificaciones para este filtro.
                </div>
              )}

              {visibleNotifications.map((item) => {
                const severity = severityStyles[item.severity];
                const isActive = selected?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectNotification(item)}
                    className={`mb-2 w-full rounded-xl border p-3 text-left transition ${
                      isActive
                        ? "border-[#cdc8ff] bg-[#f4f2ff]"
                        : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.message}</p>
                      </div>
                      {!item.read ? <Circle size={10} className="mt-1 shrink-0 fill-[#5848f4] text-[#5848f4]" /> : null}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                      <span className={`h-2 w-2 rounded-full ${severity.dot}`} />
                      <span>{item.moduleLabel}</span>
                      <span>·</span>
                      <span>{toRelativeTime(item.createdAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {!selected && (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                Selecciona una notificacion para ver el detalle.
              </div>
            )}

            {selected && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold uppercase tracking-[0.08em] text-slate-600">
                      {selected.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${severityStyles[selected.severity].bg} ${severityStyles[selected.severity].text}`}
                    >
                      {severityStyles[selected.severity].icon}
                      {selected.severity === "critical" ? "Critica" : selected.severity === "warning" ? "Advertencia" : selected.severity === "success" ? "Correcta" : "Info"}
                    </span>
                    <span className="text-slate-500">{toRelativeTime(selected.createdAt)}</span>
                  </div>

                  <h2 className="text-[22px] leading-tight font-semibold text-[#0f1f47]">{selected.title}</h2>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm leading-relaxed text-slate-700">{selected.message}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => archiveNotification(selected.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Archive size={15} />
                    Archivar
                  </button>

                  {selected.actionPath ? (
                    <Link
                      to={selected.actionPath}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5848f4] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
                    >
                      {selected.actionLabel ?? "Abrir modulo"}
                      <ExternalLink size={15} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-500"
                      disabled
                    >
                      Sin accion directa
                      <ChevronRight size={15} />
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Acciones sugeridas</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to="/settings/advanced"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Ajustar reglas de alerta
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
        active
          ? "bg-[#edeafe] text-[#5848f4]"
          : "bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}
