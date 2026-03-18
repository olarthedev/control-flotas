import {
  useRef,
  useState,
  useMemo,
  type ComponentType,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  Code2,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Key,
  Lock,
  Monitor,
  Navigation,
  Palette,
  RefreshCcw,
  Save,
  Shield,
  ShieldAlert,
  Upload,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { Toast, type ToastType } from "../components/Toast";

// --- Section types ---

type Section =
  | "company-profile"
  | "company-logo"
  | "notif-channels"
  | "notif-preferences"
  | "security-auth"
  | "security-access"
  | "security-sessions"
  | "appearance-display"
  | "appearance-locale"
  | "int-gps"
  | "int-erp"
  | "int-billing"
  | "int-webhooks"
  | "system-export"
  | "system-restore";

interface NavItem {
  id: Section;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    group: "Cuenta",
    items: [
      { id: "company-profile", label: "Perfil de empresa", icon: Building2 },
      { id: "company-logo", label: "Logo y marca", icon: Camera },
    ],
  },
  {
    group: "Notificaciones",
    items: [
      { id: "notif-channels", label: "Canales de alerta", icon: Bell },
      { id: "notif-preferences", label: "Preferencias", icon: Zap },
    ],
  },
  {
    group: "Seguridad",
    items: [
      { id: "security-auth", label: "Autenticacion", icon: Shield },
      { id: "security-access", label: "Accesos e IPs", icon: Lock },
      { id: "security-sessions", label: "Sesiones", icon: Monitor },
    ],
  },
  {
    group: "Experiencia",
    items: [
      { id: "appearance-display", label: "Apariencia", icon: Palette },
      { id: "appearance-locale", label: "Idioma y region", icon: Globe },
    ],
  },
  {
    group: "Integraciones",
    items: [
      { id: "int-gps", label: "GPS y rastreo", icon: Navigation },
      { id: "int-erp", label: "ERP y contabilidad", icon: Database },
      { id: "int-billing", label: "Facturacion electronica", icon: FileText },
      { id: "int-webhooks", label: "Webhooks", icon: Code2 },
    ],
  },
  {
    group: "Sistema",
    items: [
      { id: "system-export", label: "Exportar datos", icon: Download },
      { id: "system-restore", label: "Restaurar", icon: RefreshCcw },
    ],
  },
];

type IntStatusKey = "gpsEnabled" | "erpEnabled" | "billingEnabled";
const INTEGRATION_STATUS_MAP: Record<string, IntStatusKey> = {
  "int-gps": "gpsEnabled",
  "int-erp": "erpEnabled",
  "int-billing": "billingEnabled",
};

// --- Settings state ---

interface AppSettings {
  companyName: string;
  nit: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logoDataUrl: string;
  notifPush: boolean;
  notifEmail: boolean;
  notifSms: boolean;
  notifWhatsapp: boolean;
  alertEmail: string;
  alertOnExpense: boolean;
  alertOnMaintenance: boolean;
  alertOnDriver: boolean;
  alertOnVehicle: boolean;
  mfaRequired: boolean;
  emailVerification: boolean;
  passwordRotationDays: number;
  ipRestrictionEnabled: boolean;
  allowedIPs: string;
  sessionTimeoutMinutes: number;
  logoutOnInactivity: boolean;
  compactMode: boolean;
  showHelperTexts: boolean;
  dateFormat: string;
  currency: string;
  language: string;
  timezone: string;
  defaultLanding: string;
  gpsEnabled: boolean;
  gpsProvider: string;
  gpsApiKey: string;
  erpEnabled: boolean;
  erpProvider: string;
  erpWebhookUrl: string;
  billingEnabled: boolean;
  billingProvider: string;
  billingApiKey: string;
  whatsappEnabled: boolean;
  whatsappToken: string;
  webhookUrl: string;
  webhookSecret: string;
  webhookPayloadFormat: string;
}

const STORAGE_KEY = "logi.settings.v2";

const DEFAULTS: AppSettings = {
  companyName: "LogiFleet Colombia",
  nit: "901.234.567-8",
  email: "operaciones@logifleet.co",
  phone: "+57 300 123 4567",
  address: "Calle 80 # 12-34",
  city: "Bogota",
  country: "Colombia",
  logoDataUrl: "",
  notifPush: true,
  notifEmail: true,
  notifSms: false,
  notifWhatsapp: false,
  alertEmail: "alertas@logifleet.co",
  alertOnExpense: true,
  alertOnMaintenance: true,
  alertOnDriver: false,
  alertOnVehicle: true,
  mfaRequired: true,
  emailVerification: true,
  passwordRotationDays: 90,
  ipRestrictionEnabled: false,
  allowedIPs: "",
  sessionTimeoutMinutes: 60,
  logoutOnInactivity: true,
  compactMode: false,
  showHelperTexts: true,
  dateFormat: "dd/MM/yyyy",
  currency: "COP",
  language: "es-CO",
  timezone: "America/Bogota",
  defaultLanding: "dashboard",
  gpsEnabled: true,
  gpsProvider: "traccar",
  gpsApiKey: "",
  erpEnabled: false,
  erpProvider: "siigo",
  erpWebhookUrl: "",
  billingEnabled: false,
  billingProvider: "factus",
  billingApiKey: "",
  whatsappEnabled: false,
  whatsappToken: "",
  webhookUrl: "",
  webhookSecret: "",
  webhookPayloadFormat: "json",
};

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULTS;
  }
}

// --- Primitive components ---

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-800">{label}</label>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  mono = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400
        ${mono ? "font-mono tracking-tight" : ""}
        ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-500" : "focus:border-[#5848f4] focus:ring-2 focus:ring-[#5848f4]/20"}`}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  mono = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#5848f4] focus:ring-2 focus:ring-[#5848f4]/20 placeholder:text-slate-400
        ${mono ? "font-mono text-xs tracking-tight" : ""}`}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#5848f4] focus:ring-2 focus:ring-[#5848f4]/20"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5848f4]/30 ${
          checked ? "bg-[#5848f4]" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
  badge,
  badgeVariant = "default",
}: {
  icon?: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "danger" | "purple";
}) {
  const badgeStyles: Record<string, string> = {
    default: "bg-slate-100 text-slate-600 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-[#f0eeff] text-[#5848f4] border-[#d9d5ff]",
  };
  return (
    <div className="mb-7 pb-5 border-b border-slate-200 flex-1 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon size={16} />
            </div>
          )}
          <h2 className="text-[17px] font-semibold text-slate-900">{title}</h2>
        </div>
        {badge && (
          <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeStyles[badgeVariant]}`}>
            {badge}
          </span>
        )}
      </div>
      <p className={`mt-2 text-sm text-slate-500 leading-relaxed ${Icon ? "pl-11" : ""}`}>
        {description}
      </p>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">{children}</div>
  );
}

function SecretInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white pl-3 pr-10 py-2 text-sm font-mono tracking-tight text-slate-900 outline-none transition focus:border-[#5848f4] focus:ring-2 focus:ring-[#5848f4]/20 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function StatusBadge({
  active,
  activeLabel = "Conectado",
  inactiveLabel = "Sin conectar",
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      <CheckCircle2 size={10} />
      {activeLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
      <WifiOff size={10} />
      {inactiveLabel}
    </span>
  );
}

function EditActionButtons({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200/80 pt-3">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <X size={14} />
        Cancelar
      </button>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#5848f4] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4f46e5]"
      >
        <Save size={14} />
        Guardar cambios
      </button>
    </div>
  );
}

function InfoBanner({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "warning" | "danger";
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: { wrap: "border-blue-200 bg-blue-50", icon: "text-blue-500", title: "text-blue-800", text: "text-blue-700" },
    warning: { wrap: "border-amber-200 bg-amber-50", icon: "text-amber-500", title: "text-amber-800", text: "text-amber-700" },
    danger: { wrap: "border-red-200 bg-red-50", icon: "text-red-500", title: "text-red-900", text: "text-red-700" },
  };
  const s = styles[variant];
  return (
    <div className={`flex gap-3 rounded-xl border p-4 ${s.wrap}`}>
      <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${s.icon}`} />
      <div>
        {title && <p className={`text-sm font-semibold ${s.title}`}>{title}</p>}
        <div className={`text-sm leading-relaxed ${s.text} ${title ? "mt-1" : ""}`}>{children}</div>
      </div>
    </div>
  );
}

// --- Main export ---

export const AdvancedSettingsPage = () => {
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [section, setSection] = useState<Section>("company-profile");
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [lastSaved, setLastSaved] = useState(() => JSON.stringify(loadSettings()));
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Company profile edit state
  const [editingCompanyProfile, setEditingCompanyProfile] = useState(false);
  const [tempCompanyProfile, setTempCompanyProfile] = useState(() => {
    const s = loadSettings();
    return { companyName: s.companyName, nit: s.nit, email: s.email, phone: s.phone, address: s.address, city: s.city, country: s.country };
  });

  const startEditingCompanyProfile = () => {
    setTempCompanyProfile({ companyName: settings.companyName, nit: settings.nit, email: settings.email, phone: settings.phone, address: settings.address, city: settings.city, country: settings.country });
    setEditingCompanyProfile(true);
  };
  const saveCompanyProfileChanges = () => {
    setSettings((s) => ({ ...s, ...tempCompanyProfile }));
    setEditingCompanyProfile(false);
    setToast({ message: "Perfil de empresa actualizado. Guarda para confirmar.", type: "info" });
  };
  const cancelCompanyProfileEditing = () => setEditingCompanyProfile(false);

  const hasChanges = useMemo(() => JSON.stringify(settings) !== lastSaved, [settings, lastSaved]);

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const saveSettings = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setLastSaved(JSON.stringify(settings));
    setLastSavedAt(new Date());
    setToast({ message: "Configuracion guardada correctamente.", type: "success" });
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `config-logifleet-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: "Configuracion exportada.", type: "info" });
  };

  const importSettings = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as Partial<AppSettings>;
        setSettings({ ...DEFAULTS, ...imported });
        setToast({ message: "Configuracion importada. Guarda para confirmar.", type: "success" });
      } catch {
        setToast({ message: "Archivo invalido.", type: "error" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const restoreDefaults = () => {
    setSettings(DEFAULTS);
    setToast({ message: "Valores por defecto cargados. Guarda para confirmar.", type: "warning" });
  };

  const updateLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      set("logoDataUrl", String(reader.result ?? ""));
      setToast({ message: "Logo actualizado. Guarda para aplicar.", type: "info" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const activeIntegrations = [settings.gpsEnabled, settings.erpEnabled, settings.billingEnabled].filter(Boolean).length;

  return (
    <div className="pb-2">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* ── Panel top bar ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0eeff] text-[#5848f4]">
              <Key size={16} />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-slate-900 leading-tight">Ajustes avanzados</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">v3.12.4 · LogiFleet</p>
            </div>
            <span className="ml-1 inline-flex items-center rounded-full border border-[#d9d5ff] bg-[#f0eeff] px-2.5 py-1 text-[11px] font-semibold text-[#5848f4]">
              Zona avanzada
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeIntegrations > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {activeIntegrations} integr. activa{activeIntegrations > 1 ? "s" : ""}
              </span>
            )}
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={13} />
              Volver a basicos
            </Link>
          </div>
        </div>

        <div className="flex min-h-[600px]">
          <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importSettings} />
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={updateLogo} />

          {/* Left nav */}
          <nav className="w-[220px] shrink-0 border-r border-slate-200 bg-slate-50/60 overflow-y-auto py-4">
            <div className="px-3 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secciones</p>
            </div>

            {NAV.map((group) => (
              <div key={group.group} className="mb-5">
                <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {group.group}
                </span>
                <div className="mt-1.5 space-y-0.5 px-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = section === item.id;
                    const statusKey = INTEGRATION_STATUS_MAP[item.id];
                    const intStatus = statusKey ? (settings[statusKey] as boolean) : null;
                    const isWebhookActive = item.id === "int-webhooks" && settings.webhookUrl.length > 0;
                    const showDot = intStatus !== null || item.id === "int-webhooks";
                    const dotActive = intStatus === true || isWebhookActive;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSection(item.id)}
                        className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-left transition ${
                          active
                            ? "bg-white text-[#5848f4] font-semibold border border-[#d9d5ff] shadow-sm"
                            : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                        }`}
                      >
                        <Icon size={14} className={active ? "text-[#5848f4]" : "text-slate-400"} />
                        <span className="flex-1 text-sm">{item.label}</span>
                        {showDot && (
                          <span className={`h-2 w-2 shrink-0 rounded-full ${dotActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Right content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl px-8 py-7">

                {section === "company-profile" && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <SectionTitle
                        icon={Building2}
                        title="Perfil de empresa"
                        description="Informacion basica que identifica a tu organizacion dentro del sistema."
                      />
                      {!editingCompanyProfile && (
                        <button
                          type="button"
                          onClick={startEditingCompanyProfile}
                          className="mt-0.5 shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Nombre de empresa">
                        <TextInput value={editingCompanyProfile ? tempCompanyProfile.companyName : settings.companyName} onChange={(v) => editingCompanyProfile && setTempCompanyProfile((s) => ({ ...s, companyName: v }))} disabled={!editingCompanyProfile} placeholder="Mi Empresa SAS" />
                      </Field>
                      <Field label="NIT / RUC / Documento fiscal">
                        <TextInput value={editingCompanyProfile ? tempCompanyProfile.nit : settings.nit} onChange={(v) => editingCompanyProfile && setTempCompanyProfile((s) => ({ ...s, nit: v }))} disabled={!editingCompanyProfile} placeholder="900.123.456-7" mono />
                      </Field>
                      <Field label="Correo de contacto">
                        <TextInput value={editingCompanyProfile ? tempCompanyProfile.email : settings.email} onChange={(v) => editingCompanyProfile && setTempCompanyProfile((s) => ({ ...s, email: v }))} disabled={!editingCompanyProfile} type="email" placeholder="empresa@correo.com" />
                      </Field>
                      <Field label="Telefono">
                        <TextInput value={editingCompanyProfile ? tempCompanyProfile.phone : settings.phone} onChange={(v) => editingCompanyProfile && setTempCompanyProfile((s) => ({ ...s, phone: v }))} disabled={!editingCompanyProfile} placeholder="+57 300 000 0000" />
                      </Field>
                      <Field label="Direccion" hint="Sede principal de la empresa.">
                        <TextInput value={editingCompanyProfile ? tempCompanyProfile.address : settings.address} onChange={(v) => editingCompanyProfile && setTempCompanyProfile((s) => ({ ...s, address: v }))} disabled={!editingCompanyProfile} placeholder="Calle 80 # 12-34" />
                      </Field>
                      <Field label="Ciudad">
                        <TextInput value={editingCompanyProfile ? tempCompanyProfile.city : settings.city} onChange={(v) => editingCompanyProfile && setTempCompanyProfile((s) => ({ ...s, city: v }))} disabled={!editingCompanyProfile} placeholder="Bogota" />
                      </Field>
                      <Field label="Pais">
                        {editingCompanyProfile ? (
                          <SelectInput value={tempCompanyProfile.country} onChange={(v) => setTempCompanyProfile((s) => ({ ...s, country: v }))} options={[{ label: "Colombia", value: "Colombia" }, { label: "Mexico", value: "Mexico" }, { label: "Peru", value: "Peru" }, { label: "Chile", value: "Chile" }, { label: "Ecuador", value: "Ecuador" }, { label: "Venezuela", value: "Venezuela" }]} />
                        ) : (
                          <TextInput value={settings.country} onChange={() => {}} disabled />
                        )}
                      </Field>
                    </div>
                    {editingCompanyProfile && (
                      <EditActionButtons onSave={saveCompanyProfileChanges} onCancel={cancelCompanyProfileEditing} />
                    )}
                  </div>
                )}

                {section === "company-logo" && (
                  <div className="space-y-6">
                    <SectionTitle icon={Camera} title="Logo y marca" description="El logo aparece en reportes, encabezados y documentos exportados del sistema." />
                    <Card>
                      <div className="p-6 flex items-center gap-6">
                        <div className="h-20 w-20 shrink-0 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                          {settings.logoDataUrl ? (
                            <img src={settings.logoDataUrl} alt="Logo empresa" className="h-full w-full object-cover" />
                          ) : (
                            <Building2 size={32} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{settings.companyName || "Tu empresa"}</p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG o SVG · Maximo 2 MB · Recomendado 256x256 px</p>
                          <div className="mt-3 flex gap-2">
                            <button type="button" onClick={() => logoInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                              <Upload size={13} />
                              Cambiar logo
                            </button>
                            {settings.logoDataUrl && (
                              <button type="button" onClick={() => set("logoDataUrl", "")} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-200">
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                    <InfoBanner variant="info">
                      El logo actualizado se reflejara en los proximos reportes y documentos generados. Los ya exportados no seran modificados.
                    </InfoBanner>
                  </div>
                )}

                {section === "notif-channels" && (
                  <div className="space-y-6">
                    <SectionTitle icon={Bell} title="Canales de alerta" description="Elige como quieres recibir notificaciones del sistema." />
                    <Card>
                      <Toggle checked={settings.notifPush} onChange={(v) => set("notifPush", v)} label="Notificaciones push" description="Avisos instantaneos dentro de la aplicacion web." />
                      <Toggle checked={settings.notifEmail} onChange={(v) => set("notifEmail", v)} label="Correo electronico" description="Recibe alertas y resumenes por correo." />
                      <Toggle checked={settings.notifSms} onChange={(v) => set("notifSms", v)} label="SMS" description="Mensajes de texto para eventos criticos." />
                      <Toggle checked={settings.notifWhatsapp} onChange={(v) => set("notifWhatsapp", v)} label="WhatsApp" description="Notificaciones por WhatsApp Business." />
                    </Card>
                    {settings.notifWhatsapp && (
                      <Field label="Token de WhatsApp Business" hint="Obtenido desde Meta for Developers.">
                        <SecretInput value={settings.whatsappToken} onChange={(v) => set("whatsappToken", v)} placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxx" />
                      </Field>
                    )}
                  </div>
                )}

                {section === "notif-preferences" && (
                  <div className="space-y-6">
                    <SectionTitle icon={Zap} title="Preferencias de alertas" description="Define que eventos generan notificaciones y donde enviarlas." />
                    <Field label="Correo para alertas" hint="Puede ser diferente al correo de contacto principal.">
                      <TextInput value={settings.alertEmail} onChange={(v) => set("alertEmail", v)} type="email" placeholder="alertas@empresa.com" />
                    </Field>
                    <div>
                      <p className="mb-1 text-sm font-medium text-slate-800">Eventos que generan alerta</p>
                      <p className="mb-3 text-xs text-slate-500">Selecciona los modulos que envian notificaciones automaticas.</p>
                      <Card>
                        <Toggle checked={settings.alertOnExpense} onChange={(v) => set("alertOnExpense", v)} label="Gastos pendientes" description="Cuando un gasto queda sin aprobar por mas de 24 horas." />
                        <Toggle checked={settings.alertOnMaintenance} onChange={(v) => set("alertOnMaintenance", v)} label="Mantenimiento vencido" description="Cuando un vehiculo supera su fecha programada de mantenimiento." />
                        <Toggle checked={settings.alertOnVehicle} onChange={(v) => set("alertOnVehicle", v)} label="Estado de vehiculos" description="Cambios en disponibilidad o documentacion de la flota." />
                        <Toggle checked={settings.alertOnDriver} onChange={(v) => set("alertOnDriver", v)} label="Conductores" description="Licencias proximas a vencer o incidentes reportados." />
                      </Card>
                    </div>
                  </div>
                )}

                {section === "security-auth" && (
                  <div className="space-y-6">
                    <SectionTitle icon={Shield} title="Autenticacion" description="Configura los requisitos de acceso y politicas de contrasena." badge="Alta seguridad" badgeVariant="danger" />
                    <InfoBanner variant="warning" title="Cambios con impacto global">
                      Modificar estas opciones afecta a todos los usuarios de la plataforma. Asegurate de comunicar los cambios antes de guardar.
                    </InfoBanner>
                    <Card>
                      <Toggle checked={settings.mfaRequired} onChange={(v) => set("mfaRequired", v)} label="Autenticacion de dos factores (MFA)" description="Obliga a todos los usuarios a usar un segundo factor al ingresar." />
                      <Toggle checked={settings.emailVerification} onChange={(v) => set("emailVerification", v)} label="Verificacion de correo" description="Usuarios nuevos deben verificar su correo antes de acceder." />
                    </Card>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Rotacion de contrasena" hint="Con que frecuencia se obliga a cambiar la clave.">
                        <SelectInput value={String(settings.passwordRotationDays)} onChange={(v) => set("passwordRotationDays", Number(v))} options={[{ label: "Nunca", value: "0" }, { label: "Cada 60 dias", value: "60" }, { label: "Cada 90 dias", value: "90" }, { label: "Cada 120 dias", value: "120" }, { label: "Cada 180 dias", value: "180" }]} />
                      </Field>
                    </div>
                  </div>
                )}

                {section === "security-access" && (
                  <div className="space-y-6">
                    <SectionTitle icon={Lock} title="Accesos e IPs" description="Restringe el acceso al sistema segun la red de origen." badge="Zona restringida" badgeVariant="warning" />
                    <Card>
                      <Toggle checked={settings.ipRestrictionEnabled} onChange={(v) => set("ipRestrictionEnabled", v)} label="Restriccion por IP" description="Solo las IPs autorizadas podran iniciar sesion en el sistema." />
                    </Card>
                    {settings.ipRestrictionEnabled && (
                      <>
                        <InfoBanner variant="warning" title="Cuidado con esta configuracion">
                          Si tu IP actual no esta en la lista permitida, podrias bloquearte el acceso. Verifica tu IP antes de guardar.
                        </InfoBanner>
                        <Field label="IPs permitidas" hint="Una por linea. Soporta rangos CIDR como 192.168.1.0/24.">
                          <TextArea value={settings.allowedIPs} onChange={(v) => set("allowedIPs", v)} placeholder={"192.168.1.0/24\n10.0.0.1"} rows={5} mono />
                        </Field>
                      </>
                    )}
                  </div>
                )}

                {section === "security-sessions" && (
                  <div className="space-y-6">
                    <SectionTitle icon={Monitor} title="Sesiones" description="Controla cuanto tiempo permanecen activas las sesiones de usuario." />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Tiempo maximo de sesion">
                        <SelectInput value={String(settings.sessionTimeoutMinutes)} onChange={(v) => set("sessionTimeoutMinutes", Number(v))} options={[{ label: "30 minutos", value: "30" }, { label: "1 hora", value: "60" }, { label: "2 horas", value: "120" }, { label: "4 horas", value: "240" }, { label: "8 horas", value: "480" }]} />
                      </Field>
                    </div>
                    <Card>
                      <Toggle checked={settings.logoutOnInactivity} onChange={(v) => set("logoutOnInactivity", v)} label="Cerrar sesion por inactividad" description="La sesion expira automaticamente si el usuario no realiza acciones." />
                    </Card>
                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-800">Sesiones recientes</p>
                      <Card>
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Dispositivo</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ultima actividad</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">IP</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {[
                              { device: "Chrome · Windows 11", time: "Hace 5 min", ip: "181.52.14.xx", current: true },
                              { device: "Safari · iPhone 15", time: "Hace 2 horas", ip: "200.23.88.xx", current: false },
                              { device: "Firefox · macOS 14", time: "Ayer", ip: "192.168.1.xx", current: false },
                            ].map((row, i) => (
                              <tr key={i} className="bg-white hover:bg-slate-50 transition">
                                <td className="px-4 py-3 text-slate-700">
                                  <div className="flex items-center gap-2">
                                    {row.current && <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                                    {row.device}
                                    {row.current && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">actual</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{row.time}</td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.ip}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Card>
                    </div>
                  </div>
                )}

                {section === "appearance-display" && (
                  <div className="space-y-6">
                    <SectionTitle icon={Palette} title="Apariencia" description="Personaliza como se ve la interfaz del sistema." />
                    <Card>
                      <Toggle checked={settings.compactMode} onChange={(v) => set("compactMode", v)} label="Modo compacto" description="Reduce el espaciado para mostrar mas informacion en pantalla." />
                      <Toggle checked={settings.showHelperTexts} onChange={(v) => set("showHelperTexts", v)} label="Mostrar textos de ayuda" description="Muestra descripciones y ejemplos en formularios." />
                    </Card>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Formato de fecha">
                        <SelectInput value={settings.dateFormat} onChange={(v) => set("dateFormat", v)} options={[{ label: "DD/MM/AAAA (31/01/2025)", value: "dd/MM/yyyy" }, { label: "MM/DD/AAAA (01/31/2025)", value: "MM/dd/yyyy" }, { label: "AAAA-MM-DD ISO (2025-01-31)", value: "yyyy-MM-dd" }]} />
                      </Field>
                      <Field label="Moneda visualizada">
                        <SelectInput value={settings.currency} onChange={(v) => set("currency", v)} options={[{ label: "COP - Peso colombiano", value: "COP" }, { label: "MXN - Peso mexicano", value: "MXN" }, { label: "PEN - Sol peruano", value: "PEN" }, { label: "CLP - Peso chileno", value: "CLP" }, { label: "USD - Dolar americano", value: "USD" }]} />
                      </Field>
                    </div>
                  </div>
                )}

                {section === "appearance-locale" && (
                  <div className="space-y-6">
                    <SectionTitle icon={Globe} title="Idioma y region" description="Determina el idioma de la interfaz y la zona horaria para reportes." />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Idioma de la aplicacion">
                        <SelectInput value={settings.language} onChange={(v) => set("language", v)} options={[{ label: "Espanol Colombia", value: "es-CO" }, { label: "Espanol Mexico", value: "es-MX" }, { label: "Espanol Peru", value: "es-PE" }, { label: "Ingles", value: "en-US" }]} />
                      </Field>
                      <Field label="Zona horaria">
                        <SelectInput value={settings.timezone} onChange={(v) => set("timezone", v)} options={[{ label: "America/Bogota (UTC-5)", value: "America/Bogota" }, { label: "America/Mexico_City (UTC-6)", value: "America/Mexico_City" }, { label: "America/Lima (UTC-5)", value: "America/Lima" }, { label: "America/Santiago (UTC-4)", value: "America/Santiago" }, { label: "America/New_York (UTC-5)", value: "America/New_York" }]} />
                      </Field>
                      <Field label="Pantalla de inicio" hint="Modulo que se carga al entrar al sistema.">
                        <SelectInput value={settings.defaultLanding} onChange={(v) => set("defaultLanding", v)} options={[{ label: "Dashboard", value: "dashboard" }, { label: "Gastos", value: "expenses" }, { label: "Mantenimiento", value: "maintenance" }, { label: "Conductores", value: "drivers" }, { label: "Vehiculos", value: "vehicles" }]} />
                      </Field>
                    </div>
                  </div>
                )}

                {section === "int-gps" && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <SectionTitle icon={Navigation} title="GPS y rastreo" description="Conecta tu proveedor de GPS para monitorear la ubicacion de tu flota en tiempo real." />
                      <div className="mt-0.5 shrink-0">
                        <StatusBadge active={settings.gpsEnabled} activeLabel="Activo" inactiveLabel="Desactivado" />
                      </div>
                    </div>
                    <Card>
                      <Toggle checked={settings.gpsEnabled} onChange={(v) => set("gpsEnabled", v)} label="Activar integracion GPS" description="Habilita el rastreo de vehiculos desde un proveedor externo." />
                    </Card>
                    {settings.gpsEnabled && (
                      <>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field label="Proveedor GPS">
                            <SelectInput value={settings.gpsProvider} onChange={(v) => set("gpsProvider", v)} options={[{ label: "Traccar", value: "traccar" }, { label: "Wialon", value: "wialon" }, { label: "Fleet Complete", value: "fleet-complete" }, { label: "Samsara", value: "samsara" }, { label: "Personalizado", value: "custom" }]} />
                          </Field>
                          <Field label="Clave API" hint="Obtenida desde el panel de tu proveedor GPS.">
                            <SecretInput value={settings.gpsApiKey} onChange={(v) => set("gpsApiKey", v)} placeholder="key_xxxxxxxxxxxxxxxx" />
                          </Field>
                        </div>
                        <InfoBanner variant="info">
                          Las claves API se almacenan localmente en tu navegador. En produccion, considera usar variables de entorno en el servidor para mayor seguridad.
                        </InfoBanner>
                      </>
                    )}
                  </div>
                )}

                {section === "int-erp" && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <SectionTitle icon={Database} title="ERP y contabilidad" description="Sincroniza gastos y movimientos con tu sistema de contabilidad o ERP." />
                      <div className="mt-0.5 shrink-0">
                        <StatusBadge active={settings.erpEnabled} activeLabel="Sincronizando" inactiveLabel="Desactivado" />
                      </div>
                    </div>
                    <Card>
                      <Toggle checked={settings.erpEnabled} onChange={(v) => set("erpEnabled", v)} label="Activar sincronizacion ERP" description="Los gastos aprobados se envian automaticamente al sistema contable." />
                    </Card>
                    {settings.erpEnabled && (
                      <div className="grid gap-5">
                        <Field label="Sistema ERP">
                          <SelectInput value={settings.erpProvider} onChange={(v) => set("erpProvider", v)} options={[{ label: "Siigo", value: "siigo" }, { label: "Helisa", value: "helisa" }, { label: "SAP Business One", value: "sap" }, { label: "Odoo", value: "odoo" }, { label: "Personalizado", value: "custom" }]} />
                        </Field>
                        <Field label="URL del webhook ERP" hint="El sistema enviara los datos sincronizados a este endpoint.">
                          <TextInput value={settings.erpWebhookUrl} onChange={(v) => set("erpWebhookUrl", v)} placeholder="https://erp.empresa.com/api/webhook" mono />
                        </Field>
                      </div>
                    )}
                  </div>
                )}

                {section === "int-billing" && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <SectionTitle icon={FileText} title="Facturacion electronica" description="Integra con tu proveedor para generar documentos electronicos automaticamente." />
                      <div className="mt-0.5 shrink-0">
                        <StatusBadge active={settings.billingEnabled} activeLabel="Activo" inactiveLabel="Desactivado" />
                      </div>
                    </div>
                    <Card>
                      <Toggle checked={settings.billingEnabled} onChange={(v) => set("billingEnabled", v)} label="Activar facturacion electronica" description="Genera documentos electronicos directamente desde el sistema." />
                    </Card>
                    {settings.billingEnabled && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Proveedor de facturacion">
                          <SelectInput value={settings.billingProvider} onChange={(v) => set("billingProvider", v)} options={[{ label: "Factus", value: "factus" }, { label: "SIFAC", value: "sifac" }, { label: "Siigo Facturacion", value: "siigo-billing" }, { label: "Carvajal", value: "carvajal" }]} />
                        </Field>
                        <Field label="Clave API del proveedor">
                          <SecretInput value={settings.billingApiKey} onChange={(v) => set("billingApiKey", v)} placeholder="key_xxxxxxxxxxxxxxxx" />
                        </Field>
                      </div>
                    )}
                  </div>
                )}

                {section === "int-webhooks" && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <SectionTitle icon={Code2} title="Webhooks" description="Recibe notificaciones automaticas en tu servidor cuando ocurran eventos clave del sistema." badge="Tecnico" badgeVariant="purple" />
                      <div className="mt-0.5 shrink-0">
                        <StatusBadge active={settings.webhookUrl.length > 0} activeLabel="Configurado" inactiveLabel="No configurado" />
                      </div>
                    </div>
                    <Field label="URL del endpoint" hint="El sistema enviara peticiones POST a esta URL.">
                      <TextInput value={settings.webhookUrl} onChange={(v) => set("webhookUrl", v)} placeholder="https://miservidor.com/webhook" mono />
                    </Field>
                    <Field label="Secreto de firma (HMAC-SHA256)" hint="Se usa para verificar la autenticidad de cada peticion recibida. Guardalo de forma segura.">
                      <SecretInput value={settings.webhookSecret} onChange={(v) => set("webhookSecret", v)} placeholder="whsec_xxxxxxxxxxxxxxxx" />
                    </Field>
                    <Field label="Formato del payload">
                      <SelectInput value={settings.webhookPayloadFormat} onChange={(v) => set("webhookPayloadFormat", v)} options={[{ label: "JSON (application/json)", value: "json" }, { label: "Form-encoded (application/x-www-form-urlencoded)", value: "form" }]} />
                    </Field>
                    <InfoBanner variant="info" title="Como verificar la firma">
                      Cada peticion incluye el header X-LogiFleet-Signature. Compara el HMAC-SHA256 del body usando tu secreto para validar la autenticidad del evento recibido.
                    </InfoBanner>
                  </div>
                )}

                {section === "system-export" && (
                  <div className="space-y-5">
                    <SectionTitle icon={Download} title="Exportar e importar datos" description="Descarga la configuracion actual del sistema o restaura desde un respaldo anterior." />
                    <Card>
                      <div className="p-5 border-b border-slate-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">Exportar configuracion</h3>
                            <p className="mt-1 text-sm text-slate-500">Descarga un archivo JSON con todos los ajustes actuales del sistema.</p>
                          </div>
                          <Download size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        </div>
                        <button type="button" onClick={exportSettings} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                          <Download size={15} />
                          Descargar configuracion
                        </button>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">Importar configuracion</h3>
                            <p className="mt-1 text-sm text-slate-500">Sube un archivo JSON exportado previamente para restaurar esa configuracion.</p>
                          </div>
                          <Upload size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        </div>
                        <button type="button" onClick={() => importInputRef.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                          <Upload size={15} />
                          Importar archivo JSON
                        </button>
                      </div>
                    </Card>
                    <p className="text-xs text-slate-400">
                      Ultimo guardado: {lastSavedAt.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                )}

                {section === "system-restore" && (
                  <div className="space-y-5">
                    <SectionTitle icon={RefreshCcw} title="Restaurar valores" description="Restablece la configuracion del sistema a los valores de fabrica." badge="Zona de riesgo" badgeVariant="danger" />
                    <InfoBanner variant="danger" title="Accion irreversible">
                      Restaurar los valores por defecto reemplazara absolutamente todos tus ajustes actuales, incluyendo integraciones, seguridad y preferencias. Esta accion no se puede deshacer. Exporta tu configuracion antes de continuar.
                    </InfoBanner>
                    <div className="rounded-xl border border-red-200 bg-white p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 shrink-0">
                          <ShieldAlert size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Restaurar a valores por defecto</p>
                          <p className="text-xs text-slate-500 mt-0.5">Se perderan todas las integraciones configuradas y los ajustes personalizados.</p>
                        </div>
                      </div>
                      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {["Perfil de empresa", "Integraciones GPS", "ERP y facturacion", "Seguridad y MFA", "Webhooks", "Preferencias"].map((item) => (
                          <div key={item} className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                            <X size={11} className="text-red-400 shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={restoreDefaults} className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50">
                        <RefreshCcw size={15} />
                        Restaurar valores por defecto
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Sticky save bar */}
            {hasChanges && (
              <div className="shrink-0 flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-8 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  <p className="text-sm text-slate-600 font-medium">Cambios sin guardar</p>
                </div>
                <button type="button" onClick={saveSettings} className="inline-flex items-center gap-2 rounded-xl bg-[#5848f4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f46e5]">
                  <Save size={15} />
                  Guardar cambios
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
