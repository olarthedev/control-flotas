import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Building2,
  Check,
  Download,
  Monitor,
  Moon,
  Palette,
  Save,
  Settings2,
  Shield,
  Sun,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { Toast, type ToastType } from "../components/Toast";

interface BasicSettingsState {
  userFullName: string;
  userRole: string;
  userEmail: string;
  userPhone: string;
  companyName: string;
  companyDocument: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyCity: string;
  theme: string;
  fontSize: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  language: string;
  timezone: string;
  defaultCurrency: string;
  compactMode: boolean;
  pushAlerts: boolean;
  emailAlerts: boolean;
  weeklySummary: boolean;
  expenseApprovalAlerts: boolean;
  maintenanceDueAlerts: boolean;
  tripAnomalyAlerts: boolean;
  mfaRequired: boolean;
  loginAlerts: boolean;
  sessionTimeoutMinutes: number;
  defaultLanding: string;
}

const STORAGE_KEY = "logi.settings.basic.v2";

const resolveSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const normalizeThemeMode = (value: unknown): "light" | "dark" | "system" | "custom" => {
  if (value === "light" || value === "dark" || value === "system" || value === "custom") {
    return value;
  }

  return "system";
};

const DEFAULT_SETTINGS: BasicSettingsState = {
  userFullName: "Diego Martinez",
  userRole: "Administrador de flota",
  userEmail: "diego@logifleet.co",
  userPhone: "+57 300 111 2233",
  companyName: "LogiFleet Colombia",
  companyDocument: "901.234.567-8",
  companyEmail: "operaciones@logifleet.co",
  companyPhone: "+57 300 123 4567",
  companyAddress: "Calle 80 # 12-34",
  companyCity: "Bogota",
  theme: "system",
  fontSize: "normal",
  dateFormat: "dd/MM/yyyy",
  timeFormat: "24h",
  numberFormat: "1.234,56",
  language: "es-CO",
  timezone: "America/Bogota",
  defaultCurrency: "COP",
  compactMode: false,
  pushAlerts: true,
  emailAlerts: true,
  weeklySummary: true,
  expenseApprovalAlerts: true,
  maintenanceDueAlerts: true,
  tripAnomalyAlerts: true,
  mfaRequired: true,
  loginAlerts: true,
  sessionTimeoutMinutes: 60,
  defaultLanding: "dashboard",
};

const loadSettings = (): BasicSettingsState => {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<BasicSettingsState>) : {};

    const directTheme = window.localStorage.getItem("logi.user.theme");
    const parsedTheme = parsed.theme;

    const resolvedTheme =
      (directTheme === "light" || directTheme === "dark" || directTheme === "system" || directTheme === "custom")
        ? directTheme
        : (parsedTheme === "light" || parsedTheme === "dark" || parsedTheme === "system" || parsedTheme === "custom")
          ? parsedTheme
          : DEFAULT_SETTINGS.theme;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      theme: normalizeThemeMode(resolvedTheme),
    };
  } catch {
    const directTheme = window.localStorage.getItem("logi.user.theme");

    return {
      ...DEFAULT_SETTINGS,
      theme: normalizeThemeMode(directTheme),
    };
  }
};

const toSnapshot = (state: BasicSettingsState) => JSON.stringify(state);

export const SettingsPage = () => {
  const importRef = useRef<HTMLInputElement | null>(null);

  const [settings, setSettings] = useState<BasicSettingsState>(() => loadSettings());
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() => toSnapshot(loadSettings()));
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [editingUserProfile, setEditingUserProfile] = useState(false);
  const [editingCompanyProfile, setEditingCompanyProfile] = useState(false);
  const [tempUserProfile, setTempUserProfile] = useState(() => {
    const current = loadSettings();
    return {
      userFullName: current.userFullName,
      userRole: current.userRole,
      userEmail: current.userEmail,
      userPhone: current.userPhone,
    };
  });
  const [tempCompanyProfile, setTempCompanyProfile] = useState(() => {
    const current = loadSettings();
    return {
      companyName: current.companyName,
      companyDocument: current.companyDocument,
      companyEmail: current.companyEmail,
      companyPhone: current.companyPhone,
      companyAddress: current.companyAddress,
      companyCity: current.companyCity,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const mode = settings.theme === "custom" ? "dark" : settings.theme;

    const applyThemeClass = (next: "light" | "dark") => {
      root.classList.toggle("dark", next === "dark");
    };

    const effectiveMode = mode === "system" ? resolveSystemTheme() : (mode as "light" | "dark");
    applyThemeClass(effectiveMode);

    if (mode === "system" && typeof window.matchMedia === "function") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyThemeClass(resolveSystemTheme());
      mediaQuery.addEventListener("change", handleChange);
      window.localStorage.setItem("logi.user.theme", mode);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    window.localStorage.setItem("logi.user.theme", mode);
  }, [settings.theme]);

  const hasUnsavedChanges = useMemo(
    () => toSnapshot(settings) !== lastSavedSnapshot,
    [settings, lastSavedSnapshot],
  );

  const themeLabelByValue: Record<string, string> = {
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro",
    custom: "Personalizado",
  };
  const activeThemeLabel = themeLabelByValue[settings.theme] ?? "Sistema";

  const startEditingUserProfile = () => {
    setTempUserProfile({
      userFullName: settings.userFullName,
      userRole: settings.userRole,
      userEmail: settings.userEmail,
      userPhone: settings.userPhone,
    });
    setEditingUserProfile(true);
  };

  const saveUserProfileChanges = () => {
    setSettings((s) => ({ ...s, ...tempUserProfile }));
    setEditingUserProfile(false);
    setToast({ message: "Perfil personal actualizado. Guarda los cambios globales.", type: "info" });
  };

  const cancelUserProfileEditing = () => {
    setEditingUserProfile(false);
  };

  const startEditingCompanyProfile = () => {
    setTempCompanyProfile({
      companyName: settings.companyName,
      companyDocument: settings.companyDocument,
      companyEmail: settings.companyEmail,
      companyPhone: settings.companyPhone,
      companyAddress: settings.companyAddress,
      companyCity: settings.companyCity,
    });
    setEditingCompanyProfile(true);
  };

  const saveCompanyProfileChanges = () => {
    setSettings((s) => ({ ...s, ...tempCompanyProfile }));
    setEditingCompanyProfile(false);
    setToast({ message: "Perfil de empresa actualizado. Guarda los cambios globales.", type: "info" });
  };

  const cancelCompanyProfileEditing = () => {
    setEditingCompanyProfile(false);
  };

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
    <div className="space-y-6 pb-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Configuracion</h1>
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
            Avanzados
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
      </div>

      <input
        ref={importRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={importSettings}
      />

      <section className="space-y-4 pb-2">
        {/* Perfil personal */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#5848f4]">
                <UserRound size={20} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Perfil personal</h2>
            </div>
            {!editingUserProfile && (
              <button
                type="button"
                onClick={startEditingUserProfile}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Editar
              </button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Nombre completo"
              value={editingUserProfile ? tempUserProfile.userFullName : settings.userFullName}
              onChange={(value) =>
                editingUserProfile &&
                setTempUserProfile((s) => ({ ...s, userFullName: value }))
              }
              disabled={!editingUserProfile}
            />
            <InputField
              label="Cargo o rol"
              value={editingUserProfile ? tempUserProfile.userRole : settings.userRole}
              onChange={(value) =>
                editingUserProfile && setTempUserProfile((s) => ({ ...s, userRole: value }))
              }
              disabled={!editingUserProfile}
            />
            <InputField
              label="Correo del usuario"
              value={editingUserProfile ? tempUserProfile.userEmail : settings.userEmail}
              onChange={(value) =>
                editingUserProfile && setTempUserProfile((s) => ({ ...s, userEmail: value }))
              }
              disabled={!editingUserProfile}
            />
            <InputField
              label="Telefono"
              value={editingUserProfile ? tempUserProfile.userPhone : settings.userPhone}
              onChange={(value) =>
                editingUserProfile && setTempUserProfile((s) => ({ ...s, userPhone: value }))
              }
              disabled={!editingUserProfile}
            />
          </div>
          {editingUserProfile && (
            <EditActionButtons
              onSave={saveUserProfileChanges}
              onCancel={cancelUserProfileEditing}
            />
          )}
        </div>

        {/* Perfil de empresa */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Building2 size={20} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Perfil de empresa</h2>
            </div>
            {!editingCompanyProfile && (
              <button
                type="button"
                onClick={startEditingCompanyProfile}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Editar
              </button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Nombre de empresa"
              value={editingCompanyProfile ? tempCompanyProfile.companyName : settings.companyName}
              onChange={(value) =>
                editingCompanyProfile &&
                setTempCompanyProfile((s) => ({ ...s, companyName: value }))
              }
              disabled={!editingCompanyProfile}
            />
            <InputField
              label="Documento fiscal"
              value={
                editingCompanyProfile ? tempCompanyProfile.companyDocument : settings.companyDocument
              }
              onChange={(value) =>
                editingCompanyProfile &&
                setTempCompanyProfile((s) => ({ ...s, companyDocument: value }))
              }
              disabled={!editingCompanyProfile}
            />
            <InputField
              label="Correo de contacto"
              value={editingCompanyProfile ? tempCompanyProfile.companyEmail : settings.companyEmail}
              onChange={(value) =>
                editingCompanyProfile &&
                setTempCompanyProfile((s) => ({ ...s, companyEmail: value }))
              }
              disabled={!editingCompanyProfile}
            />
            <InputField
              label="Telefono de contacto"
              value={editingCompanyProfile ? tempCompanyProfile.companyPhone : settings.companyPhone}
              onChange={(value) =>
                editingCompanyProfile &&
                setTempCompanyProfile((s) => ({ ...s, companyPhone: value }))
              }
              disabled={!editingCompanyProfile}
            />
            <InputField
              label="Direccion"
              value={editingCompanyProfile ? tempCompanyProfile.companyAddress : settings.companyAddress}
              onChange={(value) =>
                editingCompanyProfile &&
                setTempCompanyProfile((s) => ({ ...s, companyAddress: value }))
              }
              disabled={!editingCompanyProfile}
            />
            <InputField
              label="Ciudad"
              value={editingCompanyProfile ? tempCompanyProfile.companyCity : settings.companyCity}
              onChange={(value) =>
                editingCompanyProfile &&
                setTempCompanyProfile((s) => ({ ...s, companyCity: value }))
              }
              disabled={!editingCompanyProfile}
            />
          </div>
          {editingCompanyProfile && (
            <EditActionButtons
              onSave={saveCompanyProfileChanges}
              onCancel={cancelCompanyProfileEditing}
            />
          )}
        </div>

        {/* Vista, idioma y formato */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Palette size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Vista, idioma y formato</h2>
          </div>

          {/* Tema visual */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tema</span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                Activo: {activeThemeLabel}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {/* Sistema */}
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, theme: "system" }))}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                  settings.theme === "system"
                    ? "border-[#d7cbf8] bg-[#fafbff]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {settings.theme === "system" && (
                  <span className="absolute right-2 top-2 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm">
                    <Check size={12} />
                  </span>
                )}
                {/* Preview */}
                <div className="h-20 bg-gradient-to-b from-slate-100 via-slate-50 to-white p-2">
                  <div className="flex h-full gap-1 rounded-lg bg-white shadow-sm ring-1 ring-slate-200 p-1.5">
                    <div className="w-1 rounded-full bg-slate-400" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 rounded-full bg-slate-300 w-3/4" />
                      <div className="h-2 rounded-full bg-slate-200 w-4/5" />
                    </div>
                  </div>
                </div>
                {/* Label */}
                <div className="bg-white p-3 transition-colors group-hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Monitor size={16} className="text-slate-600" />
                    <p className="text-xs font-bold text-slate-900">Sistema</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Como tu dispositivo</p>
                </div>
              </button>

              {/* Claro */}
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, theme: "light" }))}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                  settings.theme === "light"
                    ? "border-[#d7cbf8] bg-[#fafbff]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {settings.theme === "light" && (
                  <span className="absolute right-2 top-2 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm">
                    <Check size={12} />
                  </span>
                )}
                {/* Preview */}
                <div className="h-20 bg-white p-2">
                  <div className="flex h-full gap-1 rounded-lg bg-white shadow-sm ring-1 ring-slate-200 p-1.5">
                    <div className="w-1 rounded-full bg-yellow-400" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 rounded-full bg-slate-200 w-3/4" />
                      <div className="h-2 rounded-full bg-slate-100 w-4/5" />
                    </div>
                  </div>
                </div>
                {/* Label */}
                <div className="bg-white p-3 transition-colors group-hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Sun size={16} className="text-yellow-500" />
                    <p className="text-xs font-bold text-slate-900">Claro</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Fondo blanco</p>
                </div>
              </button>

              {/* Oscuro */}
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, theme: "dark" }))}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                  settings.theme === "dark"
                    ? "border-[#d7cbf8] bg-[#fafbff]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {settings.theme === "dark" && (
                  <span className="absolute right-2 top-2 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm">
                    <Check size={12} />
                  </span>
                )}
                {/* Preview */}
                <div className="h-20 bg-slate-900 p-2">
                  <div className="flex h-full gap-1 rounded-lg bg-slate-800 shadow-sm ring-1 ring-slate-700 p-1.5">
                    <div className="w-1 rounded-full bg-blue-400" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 rounded-full bg-slate-600 w-3/4" />
                      <div className="h-2 rounded-full bg-slate-700 w-4/5" />
                    </div>
                  </div>
                </div>
                {/* Label */}
                <div className="bg-white p-3 transition-colors group-hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Moon size={16} className="text-slate-600" />
                    <p className="text-xs font-bold text-slate-900">Oscuro</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Fondo oscuro</p>
                </div>
              </button>

              {/* Personalizado */}
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, theme: "custom" }))}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                  settings.theme === "custom"
                    ? "border-[#d7cbf8] bg-[#fafbff]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {settings.theme === "custom" && (
                  <span className="absolute right-2 top-2 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm">
                    <Check size={12} />
                  </span>
                )}
                {/* Preview */}
                <div className="h-20 bg-gradient-to-br from-purple-500 via-pink-400 to-blue-500 p-2">
                  <div className="flex h-full gap-1 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 shadow-sm p-1.5">
                    <div className="w-1 rounded-full bg-purple-600" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 rounded-full bg-purple-400 w-3/4" />
                      <div className="h-2 rounded-full bg-pink-300 w-4/5" />
                    </div>
                  </div>
                </div>
                {/* Label */}
                <div className="bg-white p-3 transition-colors group-hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Palette size={16} className="text-pink-500" />
                    <p className="text-xs font-bold text-slate-900">Personalizado</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Mis colores</p>
                </div>
              </button>
            </div>
          </div>

          {/* Resto de opciones */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SelectField
              label="Tamano de letra"
              value={settings.fontSize}
              options={[
                { label: "Pequena", value: "small" },
                { label: "Normal", value: "normal" },
                { label: "Grande", value: "large" },
              ]}
              onChange={(value) => setSettings((s) => ({ ...s, fontSize: value }))}
            />
            <SelectField
              label="Formato de fecha"
              value={settings.dateFormat}
              options={[
                { label: "DD/MM/AAAA", value: "dd/MM/yyyy" },
                { label: "MM/DD/AAAA", value: "MM/dd/yyyy" },
                { label: "AAAA-MM-DD", value: "yyyy-MM-dd" },
              ]}
              onChange={(value) => setSettings((s) => ({ ...s, dateFormat: value }))}
            />
            <SelectField
              label="Formato de hora"
              value={settings.timeFormat}
              options={[
                { label: "24 horas", value: "24h" },
                { label: "12 horas (AM/PM)", value: "12h" },
              ]}
              onChange={(value) => setSettings((s) => ({ ...s, timeFormat: value }))}
            />
            <SelectField
              label="Idioma"
              value={settings.language}
              options={[
                { label: "Espanol (CO)", value: "es-CO" },
                { label: "Espanol (MX)", value: "es-MX" },
                { label: "Espanol (PE)", value: "es-PE" },
                { label: "Ingles (US)", value: "en-US" },
              ]}
              onChange={(value) => setSettings((s) => ({ ...s, language: value }))}
            />
            <SelectField
              label="Zona horaria"
              value={settings.timezone}
              options={[
                { label: "America/Bogota", value: "America/Bogota" },
                { label: "America/Mexico_City", value: "America/Mexico_City" },
                { label: "America/Lima", value: "America/Lima" },
                { label: "America/Santiago", value: "America/Santiago" },
              ]}
              onChange={(value) => setSettings((s) => ({ ...s, timezone: value }))}
            />
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
              label="Formato de numero"
              value={settings.numberFormat}
              options={[
                { label: "1.234,56", value: "1.234,56" },
                { label: "1,234.56", value: "1,234.56" },
              ]}
              onChange={(value) => setSettings((s) => ({ ...s, numberFormat: value }))}
            />
          </div>
          <div className="mt-4">
            <ToggleRow
              title="Modo compacto"
              description="Reduce espaciados para ver mas filas por pantalla."
              enabled={settings.compactMode}
              onToggle={() => setSettings((s) => ({ ...s, compactMode: !s.compactMode }))}
              icon={<Palette size={16} />}
            />
          </div>
        </div>

        {/* Notificaciones */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Bell size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Notificaciones</h2>
          </div>
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
              description="Eventos importantes al correo principal."
              enabled={settings.emailAlerts}
              onToggle={() => setSettings((s) => ({ ...s, emailAlerts: !s.emailAlerts }))}
              icon={<Bell size={16} />}
            />
            <ToggleRow
              title="Resumen semanal"
              description="Resumen operativo cada lunes."
              enabled={settings.weeklySummary}
              onToggle={() => setSettings((s) => ({ ...s, weeklySummary: !s.weeklySummary }))}
              icon={<Bell size={16} />}
            />
            <ToggleRow
              title="Aprobacion de gastos"
              description="Aviso inmediato cuando hay un gasto por aprobar."
              enabled={settings.expenseApprovalAlerts}
              onToggle={() =>
                setSettings((s) => ({ ...s, expenseApprovalAlerts: !s.expenseApprovalAlerts }))
              }
              icon={<Bell size={16} />}
            />
            <ToggleRow
              title="Mantenimientos por vencer"
              description="Notifica cuando un vehiculo se acerca a su fecha de mantenimiento."
              enabled={settings.maintenanceDueAlerts}
              onToggle={() =>
                setSettings((s) => ({ ...s, maintenanceDueAlerts: !s.maintenanceDueAlerts }))
              }
              icon={<Bell size={16} />}
            />
            <ToggleRow
              title="Anomalias en viajes"
              description="Alerta por desvio de ruta o tiempos fuera de lo esperado."
              enabled={settings.tripAnomalyAlerts}
              onToggle={() =>
                setSettings((s) => ({ ...s, tripAnomalyAlerts: !s.tripAnomalyAlerts }))
              }
              icon={<Bell size={16} />}
            />
          </div>
        </div>

        {/* Seguridad */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Shield size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Seguridad de acceso</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ToggleRow
              title="MFA obligatorio"
              description="Solicita segundo factor al iniciar sesion."
              enabled={settings.mfaRequired}
              onToggle={() => setSettings((s) => ({ ...s, mfaRequired: !s.mfaRequired }))}
              icon={<Shield size={16} />}
            />
            <ToggleRow
              title="Aviso de inicio de sesion"
              description="Envia un aviso cuando se detecta un nuevo inicio de sesion."
              enabled={settings.loginAlerts}
              onToggle={() => setSettings((s) => ({ ...s, loginAlerts: !s.loginAlerts }))}
              icon={<Shield size={16} />}
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
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
            <SelectField
              label="Pantalla inicial"
              value={settings.defaultLanding}
              options={[
                { label: "Dashboard", value: "dashboard" },
                { label: "Gastos", value: "expenses" },
                { label: "Mantenimiento", value: "maintenance" },
                { label: "Conductores", value: "drivers" },
              ]}
              onChange={(value) => setSettings((s) => ({ ...s, defaultLanding: value }))}
            />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs text-amber-700">
              <p className="font-semibold">Ultimo guardado</p>
              <p>{lastSavedAt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <button
              type="button"
              onClick={restoreDefaults}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
            >
              Restaurar
            </button>
          </div>
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

function EditActionButtons({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
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

function InputField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
          disabled
            ? "border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
            : "border-slate-200 bg-white text-slate-900 focus:border-[#5848f4] focus:ring-2 focus:ring-[#5848f4]/15"
        }`}
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
