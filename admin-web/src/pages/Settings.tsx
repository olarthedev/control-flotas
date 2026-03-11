import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Building2,
  Download,
  Save,
  Settings2,
  Shield,
  Upload,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Toast, type ToastType } from "../components/Toast";

type BasicSection = "company" | "notifications" | "security" | "preferences";

interface BasicSettingsState {
  companyName: string;
  documentNumber: string;
  contactEmail: string;
  contactPhone: string;
  defaultCurrency: string;
  pushAlerts: boolean;
  emailAlerts: boolean;
  weeklySummary: boolean;
  mfaRequired: boolean;
  sessionTimeoutMinutes: number;
  compactMode: boolean;
  defaultLanding: string;
}

const STORAGE_KEY = "logi.settings.basic.v1";

const DEFAULT_SETTINGS: BasicSettingsState = {
  companyName: "LogiFleet Colombia",
  documentNumber: "901.234.567-8",
  contactEmail: "operaciones@logifleet.co",
  contactPhone: "+57 300 123 4567",
  defaultCurrency: "COP",
  pushAlerts: true,
  emailAlerts: true,
  weeklySummary: true,
  mfaRequired: true,
  sessionTimeoutMinutes: 60,
  compactMode: false,
  defaultLanding: "dashboard",
};

const BASIC_SECTIONS: Array<{
  id: BasicSection;
  label: string;
  description: string;
}> = [
  {
    id: "company",
    label: "Perfil de empresa",
    description: "Datos generales y contacto principal.",
  },
  {
    id: "notifications",
    label: "Notificaciones",
    description: "Canales y frecuencia de avisos.",
  },
  {
    id: "security",
    label: "Seguridad",
    description: "Proteccion de acceso y sesiones.",
  },
  {
    id: "preferences",
    label: "Preferencias",
    description: "Comportamiento general de la interfaz.",
  },
];

const loadSettings = (): BasicSettingsState => {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(raw) as Partial<BasicSettingsState>),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const toSnapshot = (state: BasicSettingsState) => JSON.stringify(state);

export const SettingsPage = () => {
  const importRef = useRef<HTMLInputElement | null>(null);

  const [activeSection, setActiveSection] = useState<BasicSection>("company");
  const [settings, setSettings] = useState<BasicSettingsState>(() => loadSettings());
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() => toSnapshot(loadSettings()));
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const hasUnsavedChanges = useMemo(
    () => toSnapshot(settings) !== lastSavedSnapshot,
    [settings, lastSavedSnapshot],
  );

  const completion = useMemo(() => {
    const fields = [
      settings.companyName,
      settings.documentNumber,
      settings.contactEmail,
      settings.contactPhone,
    ];

    const completeCount = fields.filter((field) => field.trim().length > 0).length;
    return Math.round((completeCount / fields.length) * 100);
  }, [settings]);

  const saveSettings = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    setLastSavedSnapshot(toSnapshot(settings));
    setLastSavedAt(new Date());
    setToast({ message: "Configuracion guardada correctamente.", type: "success" });
  };

  const restoreDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setToast({ message: "Se restauraron los valores basicos.", type: "warning" });
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `configuracion-basica-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: "Configuracion basica exportada.", type: "info" });
  };

  const importSettings = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as Partial<BasicSettingsState>;
        setSettings({ ...DEFAULT_SETTINGS, ...imported });
        setToast({ message: "Configuracion importada. Guarda para confirmar.", type: "success" });
      } catch {
        setToast({ message: "No se pudo importar el archivo.", type: "error" });
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Configuracion" }]}
        title="Configuracion"
        subtitle="Ajustes esenciales para operar tu cuenta con claridad. Para opciones tecnicas detalladas usa Ajustes avanzados."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportSettings}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Download size={16} />
              Exportar
            </button>
            <button
              type="button"
              onClick={() => importRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Upload size={16} />
              Importar
            </button>
            <Link
              to="/settings/advanced"
              className="inline-flex items-center gap-2 rounded-xl border border-[#cfcafe] bg-[#f3f1ff] px-3.5 py-2 text-sm font-semibold text-[#5848f4] transition hover:bg-[#ece9ff]"
            >
              <Settings2 size={16} />
              Ajustes avanzados
            </Link>
            <button
              type="button"
              onClick={saveSettings}
              disabled={!hasUnsavedChanges}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5848f4] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f46e5] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Save size={16} />
              Guardar
            </button>
          </div>
        }
      />

      <input
        ref={importRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={importSettings}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
                <Building2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0f1f47]">
                  {settings.companyName || "Empresa sin nombre"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Documento: {settings.documentNumber || "Sin definir"}</p>
                <p className="text-sm text-slate-500">Correo: {settings.contactEmail || "Sin definir"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">Estado del perfil</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{completion}%</p>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-[#5848f4]" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Ultimo guardado: {lastSavedAt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <button
              type="button"
              onClick={restoreDefaults}
              className="mt-3 inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              Restaurar basicos
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {BASIC_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeSection === section.id
                  ? "bg-[#edeafe] text-[#5848f4]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {activeSection === "company" && (
            <div className="space-y-4">
              <SectionTitle title="Perfil de empresa" description="Informacion de contacto usada en el sistema." />
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Nombre de empresa"
                  value={settings.companyName}
                  onChange={(value) => setSettings((s) => ({ ...s, companyName: value }))}
                />
                <InputField
                  label="Documento fiscal"
                  value={settings.documentNumber}
                  onChange={(value) => setSettings((s) => ({ ...s, documentNumber: value }))}
                />
                <InputField
                  label="Correo de contacto"
                  value={settings.contactEmail}
                  onChange={(value) => setSettings((s) => ({ ...s, contactEmail: value }))}
                />
                <InputField
                  label="Telefono"
                  value={settings.contactPhone}
                  onChange={(value) => setSettings((s) => ({ ...s, contactPhone: value }))}
                />
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-4">
              <SectionTitle title="Notificaciones" description="Elige como y cuando recibir avisos." />
              <div className="grid gap-3 md:grid-cols-2">
                <ToggleRow
                  title="Alertas push"
                  description="Avisos dentro del panel administrativo."
                  enabled={settings.pushAlerts}
                  onToggle={() => setSettings((s) => ({ ...s, pushAlerts: !s.pushAlerts }))}
                  icon={<Bell size={16} />}
                />
                <ToggleRow
                  title="Alertas por correo"
                  description="Eventos importantes en el correo principal."
                  enabled={settings.emailAlerts}
                  onToggle={() => setSettings((s) => ({ ...s, emailAlerts: !s.emailAlerts }))}
                  icon={<Bell size={16} />}
                />
                <ToggleRow
                  title="Resumen semanal"
                  description="Informe operativo de la semana cada lunes."
                  enabled={settings.weeklySummary}
                  onToggle={() => setSettings((s) => ({ ...s, weeklySummary: !s.weeklySummary }))}
                  icon={<Bell size={16} />}
                />
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-4">
              <SectionTitle title="Seguridad" description="Opciones basicas para proteger el acceso." />
              <div className="grid gap-3 md:grid-cols-2">
                <ToggleRow
                  title="MFA obligatorio"
                  description="Solicita segundo factor para todos los usuarios."
                  enabled={settings.mfaRequired}
                  onToggle={() => setSettings((s) => ({ ...s, mfaRequired: !s.mfaRequired }))}
                  icon={<Shield size={16} />}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Tiempo maximo de sesion"
                  value={String(settings.sessionTimeoutMinutes)}
                  options={[
                    { label: "30 minutos", value: "30" },
                    { label: "60 minutos", value: "60" },
                    { label: "120 minutos", value: "120" },
                  ]}
                  onChange={(value) =>
                    setSettings((s) => ({ ...s, sessionTimeoutMinutes: Number(value) }))
                  }
                />
              </div>
            </div>
          )}

          {activeSection === "preferences" && (
            <div className="space-y-4">
              <SectionTitle title="Preferencias" description="Ajustes de uso diario de la interfaz." />
              <div className="grid gap-4 md:grid-cols-3">
                <SelectField
                  label="Moneda"
                  value={settings.defaultCurrency}
                  options={[
                    { label: "COP", value: "COP" },
                    { label: "USD", value: "USD" },
                    { label: "MXN", value: "MXN" },
                    { label: "PEN", value: "PEN" },
                  ]}
                  onChange={(value) => setSettings((s) => ({ ...s, defaultCurrency: value }))}
                />
                <SelectField
                  label="Pantalla inicial"
                  value={settings.defaultLanding}
                  options={[
                    { label: "Dashboard", value: "dashboard" },
                    { label: "Gastos", value: "expenses" },
                    { label: "Mantenimiento", value: "maintenance" },
                  ]}
                  onChange={(value) => setSettings((s) => ({ ...s, defaultLanding: value }))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <ToggleRow
                  title="Modo compacto"
                  description="Reduce espacios para ver mas datos por pantalla."
                  enabled={settings.compactMode}
                  onToggle={() => setSettings((s) => ({ ...s, compactMode: !s.compactMode }))}
                  icon={<Settings2 size={16} />}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-[#0f1f47]">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#5848f4] focus:ring-2 focus:ring-[#5848f4]/15"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#5848f4] focus:ring-2 focus:ring-[#5848f4]/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
  icon,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <span className="text-slate-500">{icon}</span>
            {title}
          </div>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          aria-pressed={enabled}
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
            enabled ? "bg-[#5848f4]" : "bg-slate-300"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white shadow transition ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
