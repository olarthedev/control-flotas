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
  ArrowLeft,
  Bell,
  Building2,
  Camera,
  Code2,
  Database,
  Download,
  FileText,
  Globe,
  Lock,
  Monitor,
  Navigation,
  Palette,
  RefreshCcw,
  Save,
  Shield,
  Upload,
  Zap,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Toast, type ToastType } from "../components/Toast";

// ─── Section types ─────────────────────────────────────────────────────────────

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

// ─── Settings state ────────────────────────────────────────────────────────────

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

// ─── Primitive components ─────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#5848f4] focus:ring-2 focus:ring-[#5848f4]/20 placeholder:text-slate-400"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#5848f4] focus:ring-2 focus:ring-[#5848f4]/20 placeholder:text-slate-400"
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

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-7 pb-5 border-b border-slate-200">
      <h2 className="text-[17px] font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">{children}</div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export const AdvancedSettingsPage = () => {
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [section, setSection] = useState<Section>("company-profile");
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [lastSaved, setLastSaved] = useState(() => JSON.stringify(loadSettings()));
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const hasChanges = useMemo(
    () => JSON.stringify(settings) !== lastSaved,
    [settings, lastSaved],
  );

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

  return (
    <div className="space-y-5 pb-2">
      <PageHeader
        breadcrumbs={[
          { label: "Inicio", to: "/" },
          { label: "Configuracion", to: "/settings" },
          { label: "Ajustes avanzados" },
        ]}
        title="Ajustes avanzados"
        subtitle="Configuraciones tecnicas para seguridad, integraciones y control operativo detallado."
        actions={
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Volver a basicos
          </Link>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-[620px]">
      {/* Hidden file inputs */}
      <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importSettings} />
      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={updateLogo} />

      {/* ── Left navigation sidebar ──────────────────────────────────────── */}
      <nav className="w-[250px] shrink-0 border-r border-slate-200 bg-slate-50/80 overflow-y-auto py-5">
        <div className="px-4 mb-6">
          <h2 className="text-[15px] font-semibold text-slate-900">Menu avanzado</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">v3.12.4 · LogiFleet</p>
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
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-left transition ${
                      active
                        ? "bg-white text-[#5848f4] font-medium border border-[#d9d5ff]"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={active ? "text-[#5848f4]" : "text-slate-400"}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Right content panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl px-8 py-7">

            {/* ╔═ company-profile ════════════════════════════════════════╗ */}
            {section === "company-profile" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Perfil de empresa"
                  description="Informacion basica que identifica a tu organizacion dentro del sistema."
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nombre de empresa">
                    <TextInput
                      value={settings.companyName}
                      onChange={(v) => set("companyName", v)}
                      placeholder="Mi Empresa SAS"
                    />
                  </Field>
                  <Field label="NIT / RUC / Documento fiscal">
                    <TextInput
                      value={settings.nit}
                      onChange={(v) => set("nit", v)}
                      placeholder="900.123.456-7"
                    />
                  </Field>
                  <Field label="Correo de contacto">
                    <TextInput
                      value={settings.email}
                      onChange={(v) => set("email", v)}
                      type="email"
                      placeholder="empresa@correo.com"
                    />
                  </Field>
                  <Field label="Telefono">
                    <TextInput
                      value={settings.phone}
                      onChange={(v) => set("phone", v)}
                      placeholder="+57 300 000 0000"
                    />
                  </Field>
                  <Field label="Direccion" hint="Sede principal de la empresa.">
                    <TextInput
                      value={settings.address}
                      onChange={(v) => set("address", v)}
                      placeholder="Calle 80 # 12-34"
                    />
                  </Field>
                  <Field label="Ciudad">
                    <TextInput
                      value={settings.city}
                      onChange={(v) => set("city", v)}
                      placeholder="Bogota"
                    />
                  </Field>
                  <Field label="Pais">
                    <SelectInput
                      value={settings.country}
                      onChange={(v) => set("country", v)}
                      options={[
                        { label: "Colombia", value: "Colombia" },
                        { label: "Mexico", value: "Mexico" },
                        { label: "Peru", value: "Peru" },
                        { label: "Chile", value: "Chile" },
                        { label: "Ecuador", value: "Ecuador" },
                        { label: "Venezuela", value: "Venezuela" },
                      ]}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* ╔═ company-logo ════════════════════════════════════════════╗ */}
            {section === "company-logo" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Logo y marca"
                  description="El logo aparece en reportes, encabezados y documentos exportados del sistema."
                />
                <Card>
                  <div className="p-6 flex items-center gap-6">
                    <div className="h-20 w-20 shrink-0 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                      {settings.logoDataUrl ? (
                        <img
                          src={settings.logoDataUrl}
                          alt="Logo empresa"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 size={32} className="text-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {settings.companyName || "Tu empresa"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG o SVG · Maximo 2 MB · Recomendado 256×256 px
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Upload size={13} />
                          Cambiar logo
                        </button>
                        {settings.logoDataUrl && (
                          <button
                            type="button"
                            onClick={() => set("logoDataUrl", "")}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-200"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ╔═ notif-channels ══════════════════════════════════════════╗ */}
            {section === "notif-channels" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Canales de alerta"
                  description="Elige como quieres recibir notificaciones del sistema."
                />
                <Card>
                  <Toggle
                    checked={settings.notifPush}
                    onChange={(v) => set("notifPush", v)}
                    label="Notificaciones push"
                    description="Avisos instantaneos dentro de la aplicacion web."
                  />
                  <Toggle
                    checked={settings.notifEmail}
                    onChange={(v) => set("notifEmail", v)}
                    label="Correo electronico"
                    description="Recibe alertas y resumenes por correo."
                  />
                  <Toggle
                    checked={settings.notifSms}
                    onChange={(v) => set("notifSms", v)}
                    label="SMS"
                    description="Mensajes de texto para eventos criticos."
                  />
                  <Toggle
                    checked={settings.notifWhatsapp}
                    onChange={(v) => set("notifWhatsapp", v)}
                    label="WhatsApp"
                    description="Notificaciones por WhatsApp Business."
                  />
                </Card>
                {settings.notifWhatsapp && (
                  <Field
                    label="Token de WhatsApp Business"
                    hint="Obtenido desde Meta for Developers."
                  >
                    <TextInput
                      value={settings.whatsappToken}
                      onChange={(v) => set("whatsappToken", v)}
                      type="password"
                      placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  </Field>
                )}
              </div>
            )}

            {/* ╔═ notif-preferences ═══════════════════════════════════════╗ */}
            {section === "notif-preferences" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Preferencias de alertas"
                  description="Define que eventos generan notificaciones y donde enviarlas."
                />
                <Field
                  label="Correo para alertas"
                  hint="Puede ser diferente al correo de contacto principal."
                >
                  <TextInput
                    value={settings.alertEmail}
                    onChange={(v) => set("alertEmail", v)}
                    type="email"
                    placeholder="alertas@empresa.com"
                  />
                </Field>
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-800">
                    Eventos que generan alerta
                  </p>
                  <p className="mb-3 text-xs text-slate-500">
                    Selecciona los modulos que envian notificaciones automaticas.
                  </p>
                  <Card>
                    <Toggle
                      checked={settings.alertOnExpense}
                      onChange={(v) => set("alertOnExpense", v)}
                      label="Gastos pendientes"
                      description="Cuando un gasto queda sin aprobar por mas de 24 horas."
                    />
                    <Toggle
                      checked={settings.alertOnMaintenance}
                      onChange={(v) => set("alertOnMaintenance", v)}
                      label="Mantenimiento vencido"
                      description="Cuando un vehiculo supera su fecha programada de mantenimiento."
                    />
                    <Toggle
                      checked={settings.alertOnVehicle}
                      onChange={(v) => set("alertOnVehicle", v)}
                      label="Estado de vehiculos"
                      description="Cambios en disponibilidad o documentacion de la flota."
                    />
                    <Toggle
                      checked={settings.alertOnDriver}
                      onChange={(v) => set("alertOnDriver", v)}
                      label="Conductores"
                      description="Licencias proximas a vencer o incidentes reportados."
                    />
                  </Card>
                </div>
              </div>
            )}

            {/* ╔═ security-auth ═══════════════════════════════════════════╗ */}
            {section === "security-auth" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Autenticacion"
                  description="Configura los requisitos de acceso y politicas de contrasena."
                />
                <Card>
                  <Toggle
                    checked={settings.mfaRequired}
                    onChange={(v) => set("mfaRequired", v)}
                    label="Autenticacion de dos factores (MFA)"
                    description="Obliga a todos los usuarios a usar un segundo factor al ingresar."
                  />
                  <Toggle
                    checked={settings.emailVerification}
                    onChange={(v) => set("emailVerification", v)}
                    label="Verificacion de correo"
                    description="Usuarios nuevos deben verificar su correo antes de acceder."
                  />
                </Card>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Rotacion de contrasena"
                    hint="Con que frecuencia se obliga a cambiar la clave."
                  >
                    <SelectInput
                      value={String(settings.passwordRotationDays)}
                      onChange={(v) => set("passwordRotationDays", Number(v))}
                      options={[
                        { label: "Nunca", value: "0" },
                        { label: "Cada 60 dias", value: "60" },
                        { label: "Cada 90 dias", value: "90" },
                        { label: "Cada 120 dias", value: "120" },
                        { label: "Cada 180 dias", value: "180" },
                      ]}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* ╔═ security-access ═════════════════════════════════════════╗ */}
            {section === "security-access" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Accesos e IPs"
                  description="Restringe el acceso al sistema segun la red de origen."
                />
                <Card>
                  <Toggle
                    checked={settings.ipRestrictionEnabled}
                    onChange={(v) => set("ipRestrictionEnabled", v)}
                    label="Restriccion por IP"
                    description="Solo las IPs autorizadas podran iniciar sesion en el sistema."
                  />
                </Card>
                {settings.ipRestrictionEnabled && (
                  <Field
                    label="IPs permitidas"
                    hint="Una por linea. Soporta rangos CIDR como 192.168.1.0/24."
                  >
                    <TextArea
                      value={settings.allowedIPs}
                      onChange={(v) => set("allowedIPs", v)}
                      placeholder={"192.168.1.0/24\n10.0.0.1"}
                      rows={5}
                    />
                  </Field>
                )}
              </div>
            )}

            {/* ╔═ security-sessions ═══════════════════════════════════════╗ */}
            {section === "security-sessions" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Sesiones"
                  description="Controla cuanto tiempo permanecen activas las sesiones de usuario."
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Tiempo maximo de sesion">
                    <SelectInput
                      value={String(settings.sessionTimeoutMinutes)}
                      onChange={(v) => set("sessionTimeoutMinutes", Number(v))}
                      options={[
                        { label: "30 minutos", value: "30" },
                        { label: "1 hora", value: "60" },
                        { label: "2 horas", value: "120" },
                        { label: "4 horas", value: "240" },
                        { label: "8 horas", value: "480" },
                      ]}
                    />
                  </Field>
                </div>
                <Card>
                  <Toggle
                    checked={settings.logoutOnInactivity}
                    onChange={(v) => set("logoutOnInactivity", v)}
                    label="Cerrar sesion por inactividad"
                    description="La sesion expira automaticamente si el usuario no realiza acciones."
                  />
                </Card>
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-800">
                    Sesiones activas recientes
                  </p>
                  <Card>
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Dispositivo
                          </th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Ultima actividad
                          </th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            IP
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { device: "Chrome · Windows 11", time: "Hace 5 min", ip: "181.52.14.xx" },
                          { device: "Safari · iPhone 15", time: "Hace 2 horas", ip: "200.23.88.xx" },
                          { device: "Firefox · macOS 14", time: "Ayer", ip: "192.168.1.xx" },
                        ].map((row, i) => (
                          <tr key={i} className="bg-white">
                            <td className="px-4 py-3 text-slate-700">{row.device}</td>
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

            {/* ╔═ appearance-display ══════════════════════════════════════╗ */}
            {section === "appearance-display" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Apariencia"
                  description="Personaliza como se ve la interfaz del sistema."
                />
                <Card>
                  <Toggle
                    checked={settings.compactMode}
                    onChange={(v) => set("compactMode", v)}
                    label="Modo compacto"
                    description="Reduce el espaciado para mostrar mas informacion en pantalla."
                  />
                  <Toggle
                    checked={settings.showHelperTexts}
                    onChange={(v) => set("showHelperTexts", v)}
                    label="Mostrar textos de ayuda"
                    description="Muestra descripciones y ejemplos en formularios."
                  />
                </Card>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Formato de fecha">
                    <SelectInput
                      value={settings.dateFormat}
                      onChange={(v) => set("dateFormat", v)}
                      options={[
                        { label: "DD/MM/AAAA (31/01/2025)", value: "dd/MM/yyyy" },
                        { label: "MM/DD/AAAA (01/31/2025)", value: "MM/dd/yyyy" },
                        { label: "AAAA-MM-DD · ISO (2025-01-31)", value: "yyyy-MM-dd" },
                      ]}
                    />
                  </Field>
                  <Field label="Moneda visualizada">
                    <SelectInput
                      value={settings.currency}
                      onChange={(v) => set("currency", v)}
                      options={[
                        { label: "COP – Peso colombiano", value: "COP" },
                        { label: "MXN – Peso mexicano", value: "MXN" },
                        { label: "PEN – Sol peruano", value: "PEN" },
                        { label: "CLP – Peso chileno", value: "CLP" },
                        { label: "USD – Dolar americano", value: "USD" },
                      ]}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* ╔═ appearance-locale ═══════════════════════════════════════╗ */}
            {section === "appearance-locale" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Idioma y region"
                  description="Determina el idioma de la interfaz y la zona horaria para reportes."
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Idioma de la aplicacion">
                    <SelectInput
                      value={settings.language}
                      onChange={(v) => set("language", v)}
                      options={[
                        { label: "Espanol · Colombia", value: "es-CO" },
                        { label: "Espanol · Mexico", value: "es-MX" },
                        { label: "Espanol · Peru", value: "es-PE" },
                        { label: "Ingles", value: "en-US" },
                      ]}
                    />
                  </Field>
                  <Field label="Zona horaria">
                    <SelectInput
                      value={settings.timezone}
                      onChange={(v) => set("timezone", v)}
                      options={[
                        { label: "America/Bogota (UTC-5)", value: "America/Bogota" },
                        { label: "America/Mexico_City (UTC-6)", value: "America/Mexico_City" },
                        { label: "America/Lima (UTC-5)", value: "America/Lima" },
                        { label: "America/Santiago (UTC-4)", value: "America/Santiago" },
                        { label: "America/New_York (UTC-5)", value: "America/New_York" },
                      ]}
                    />
                  </Field>
                  <Field label="Pantalla de inicio" hint="Modulo que se carga al entrar al sistema.">
                    <SelectInput
                      value={settings.defaultLanding}
                      onChange={(v) => set("defaultLanding", v)}
                      options={[
                        { label: "Dashboard", value: "dashboard" },
                        { label: "Gastos", value: "expenses" },
                        { label: "Mantenimiento", value: "maintenance" },
                        { label: "Conductores", value: "drivers" },
                        { label: "Vehiculos", value: "vehicles" },
                      ]}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* ╔═ int-gps ═════════════════════════════════════════════════╗ */}
            {section === "int-gps" && (
              <div className="space-y-6">
                <SectionTitle
                  title="GPS y rastreo"
                  description="Conecta tu proveedor de GPS para monitorear la ubicacion de tu flota en tiempo real."
                />
                <Card>
                  <Toggle
                    checked={settings.gpsEnabled}
                    onChange={(v) => set("gpsEnabled", v)}
                    label="Activar integracion GPS"
                    description="Habilita el rastreo de vehiculos desde un proveedor externo."
                  />
                </Card>
                {settings.gpsEnabled && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Proveedor GPS">
                      <SelectInput
                        value={settings.gpsProvider}
                        onChange={(v) => set("gpsProvider", v)}
                        options={[
                          { label: "Traccar", value: "traccar" },
                          { label: "Wialon", value: "wialon" },
                          { label: "Fleet Complete", value: "fleet-complete" },
                          { label: "Samsara", value: "samsara" },
                          { label: "Personalizado", value: "custom" },
                        ]}
                      />
                    </Field>
                    <Field label="Clave API">
                      <TextInput
                        value={settings.gpsApiKey}
                        onChange={(v) => set("gpsApiKey", v)}
                        type="password"
                        placeholder="key_xxxxxxxxxxxxxxxx"
                      />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* ╔═ int-erp ═════════════════════════════════════════════════╗ */}
            {section === "int-erp" && (
              <div className="space-y-6">
                <SectionTitle
                  title="ERP y contabilidad"
                  description="Sincroniza gastos y movimientos con tu sistema de contabilidad o ERP."
                />
                <Card>
                  <Toggle
                    checked={settings.erpEnabled}
                    onChange={(v) => set("erpEnabled", v)}
                    label="Activar sincronizacion ERP"
                    description="Los gastos aprobados se envian automaticamente al sistema contable."
                  />
                </Card>
                {settings.erpEnabled && (
                  <div className="grid gap-5">
                    <Field label="Sistema ERP">
                      <SelectInput
                        value={settings.erpProvider}
                        onChange={(v) => set("erpProvider", v)}
                        options={[
                          { label: "Siigo", value: "siigo" },
                          { label: "Helisa", value: "helisa" },
                          { label: "SAP Business One", value: "sap" },
                          { label: "Odoo", value: "odoo" },
                          { label: "Personalizado", value: "custom" },
                        ]}
                      />
                    </Field>
                    <Field
                      label="URL del webhook ERP"
                      hint="El sistema enviara los datos sincronizados a este endpoint."
                    >
                      <TextInput
                        value={settings.erpWebhookUrl}
                        onChange={(v) => set("erpWebhookUrl", v)}
                        placeholder="https://erp.empresa.com/api/webhook"
                      />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* ╔═ int-billing ═════════════════════════════════════════════╗ */}
            {section === "int-billing" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Facturacion electronica"
                  description="Integra con tu proveedor para generar documentos electronicos automaticamente."
                />
                <Card>
                  <Toggle
                    checked={settings.billingEnabled}
                    onChange={(v) => set("billingEnabled", v)}
                    label="Activar facturacion electronica"
                    description="Genera documentos electronicos directamente desde el sistema."
                  />
                </Card>
                {settings.billingEnabled && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Proveedor de facturacion">
                      <SelectInput
                        value={settings.billingProvider}
                        onChange={(v) => set("billingProvider", v)}
                        options={[
                          { label: "Factus", value: "factus" },
                          { label: "SIFAC", value: "sifac" },
                          { label: "Siigo Facturacion", value: "siigo-billing" },
                          { label: "Carvajal", value: "carvajal" },
                        ]}
                      />
                    </Field>
                    <Field label="Clave API del proveedor">
                      <TextInput
                        value={settings.billingApiKey}
                        onChange={(v) => set("billingApiKey", v)}
                        type="password"
                        placeholder="key_xxxxxxxxxxxxxxxx"
                      />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* ╔═ int-webhooks ════════════════════════════════════════════╗ */}
            {section === "int-webhooks" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Webhooks"
                  description="Recibe notificaciones automaticas en tu servidor cuando ocurran eventos clave del sistema."
                />
                <Field label="URL del endpoint" hint="El sistema enviara peticiones POST a esta URL.">
                  <TextInput
                    value={settings.webhookUrl}
                    onChange={(v) => set("webhookUrl", v)}
                    placeholder="https://miservidor.com/webhook"
                  />
                </Field>
                <Field
                  label="Secreto de firma"
                  hint="Se usara para firmar las peticiones con HMAC-SHA256. Guardalo de forma segura."
                >
                  <TextInput
                    value={settings.webhookSecret}
                    onChange={(v) => set("webhookSecret", v)}
                    type="password"
                    placeholder="whsec_xxxxxxxxxxxxxxxx"
                  />
                </Field>
                <Field label="Formato del payload">
                  <SelectInput
                    value={settings.webhookPayloadFormat}
                    onChange={(v) => set("webhookPayloadFormat", v)}
                    options={[
                      { label: "JSON (application/json)", value: "json" },
                      {
                        label: "Form-encoded (application/x-www-form-urlencoded)",
                        value: "form",
                      },
                    ]}
                  />
                </Field>
              </div>
            )}

            {/* ╔═ system-export ═══════════════════════════════════════════╗ */}
            {section === "system-export" && (
              <div className="space-y-5">
                <SectionTitle
                  title="Exportar e importar datos"
                  description="Descarga la configuracion actual del sistema o restaura desde un respaldo anterior."
                />
                <Card>
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">Exportar configuracion</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Descarga un archivo JSON con todos los ajustes actuales del sistema.
                    </p>
                    <button
                      type="button"
                      onClick={exportSettings}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Download size={15} />
                      Descargar configuracion
                    </button>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-slate-900">Importar configuracion</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Sube un archivo JSON exportado previamente para restaurar esa configuracion.
                    </p>
                    <button
                      type="button"
                      onClick={() => importInputRef.current?.click()}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Upload size={15} />
                      Importar archivo JSON
                    </button>
                  </div>
                </Card>
                <p className="text-xs text-slate-400">
                  Ultimo guardado:{" "}
                  {lastSavedAt.toLocaleString("es-CO", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            )}

            {/* ╔═ system-restore ══════════════════════════════════════════╗ */}
            {section === "system-restore" && (
              <div className="space-y-5">
                <SectionTitle
                  title="Restaurar valores"
                  description="Restablece la configuracion del sistema a los valores de fabrica."
                />
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <h3 className="text-sm font-semibold text-red-900">Zona de riesgo</h3>
                  <p className="mt-1.5 text-sm text-red-700 leading-relaxed">
                    Restaurar los valores por defecto reemplazara todos tus ajustes actuales. Esta
                    accion no se puede deshacer una vez guardada. Considera exportar tu configuracion
                    antes de continuar.
                  </p>
                  <button
                    type="button"
                    onClick={restoreDefaults}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    <RefreshCcw size={15} />
                    Restaurar valores por defecto
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Sticky save bar ─────────────────────────────────────────── */}
        {hasChanges && (
          <div className="shrink-0 flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-8 py-3.5">
            <p className="text-sm text-slate-600">Tienes cambios sin guardar.</p>
            <button
              type="button"
              onClick={saveSettings}
              className="inline-flex items-center gap-2 rounded-lg bg-[#5848f4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f46e5]"
            >
              <Save size={15} />
              Guardar cambios
            </button>
          </div>
        )}
      </div>

        </div>
      </section>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
