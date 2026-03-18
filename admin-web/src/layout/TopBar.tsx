import React, { useEffect, useRef, useState } from "react";
import { Bell, Search, ChevronDown, PanelLeftClose, PanelLeftOpen, MapPin, User, Settings, LogOut, Moon, Sun, Monitor, Palette, Check } from "lucide-react";
import { MdDirectionsBus } from "react-icons/md";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

interface TopBarProps {
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    sidebarWidth: number;
    effectiveSidebarWidth: number;
    isSidebarExpanded: boolean;
    onHoverChange: (isHovered: boolean) => void;
}

interface BasicSettingsProfile {
    userFullName?: string;
    userRole?: string;
    userEmail?: string;
}

const BASIC_SETTINGS_STORAGE_KEY = "logi.settings.basic.v2";

const DEFAULT_TOPBAR_USER: Required<BasicSettingsProfile> = {
    userFullName: "Diego Martinez",
    userRole: "Administrador de flota",
    userEmail: "diego@logifleet.co",
};

export const TopBar: React.FC<TopBarProps> = ({
    isSidebarCollapsed,
    onToggleSidebar,
    sidebarWidth,
    effectiveSidebarWidth,
    isSidebarExpanded,
    onHoverChange,
}) => {
    const cityOptions = ["Todas", "Tunja", "Mocoa"] as const;
    const isSidebarPreviewExpanded = isSidebarCollapsed && isSidebarExpanded;
    const [dateTime, setDateTime] = useState("");
    const [selectedCity, setSelectedCity] = useState<(typeof cityOptions)[number]>("Todas");
    const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
    const citySelectorRef = useRef<HTMLDivElement | null>(null);
    const isGlobalCity = selectedCity === "Todas";

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isThemeSubmenuOpen, setIsThemeSubmenuOpen] = useState(false);
    const [userTheme, setUserTheme] = useState<"system" | "light" | "dark">("system");
    const [userProfile, setUserProfile] = useState<Required<BasicSettingsProfile>>(DEFAULT_TOPBAR_USER);
    const userMenuRef = useRef<HTMLDivElement | null>(null);
    const userInitials = userProfile.userFullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "US";

    const loadProfileFromSettings = () => {
        if (typeof window === "undefined") {
            return;
        }

        try {
            const raw = window.localStorage.getItem(BASIC_SETTINGS_STORAGE_KEY);
            if (!raw) {
                setUserProfile(DEFAULT_TOPBAR_USER);
                return;
            }

            const parsed = JSON.parse(raw) as BasicSettingsProfile;
            setUserProfile({
                userFullName: parsed.userFullName || DEFAULT_TOPBAR_USER.userFullName,
                userRole: parsed.userRole || DEFAULT_TOPBAR_USER.userRole,
                userEmail: parsed.userEmail || DEFAULT_TOPBAR_USER.userEmail,
            });
        } catch {
            setUserProfile(DEFAULT_TOPBAR_USER);
        }
    };

    const placeholdersByPath: Record<string, string> = {
        "/": "Buscar en dashboard...",
        "/vehicles": "Buscar vehículo, placa o tipo...",
        "/drivers": "Search driver, email or vehicle...",
        "/expenses": "Buscar gasto...",
        "/maintenance": "Buscar mantenimiento...",
        "/reports": "Buscar reporte...",
        "/notifications": "Buscar notificación...",
        "/settings": "Buscar configuración...",
        "/settings/advanced": "Buscar ajuste avanzado...",
    };

    const searchPlaceholder = placeholdersByPath[location.pathname] ?? "Buscar en esta pantalla...";

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toLocaleString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
            setDateTime(formatted);
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setSearchValue(searchParams.get("q") ?? "");
    }, [location.pathname, searchParams]);

    useEffect(() => {
        loadProfileFromSettings();
    }, [location.pathname]);

    useEffect(() => {
        const storageTheme = window.localStorage.getItem("logi.user.theme");
        if (storageTheme === "light" || storageTheme === "dark" || storageTheme === "system") {
            setUserTheme(storageTheme);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (userTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        window.localStorage.setItem("logi.user.theme", userTheme);
    }, [userTheme]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const current = searchParams.get("q") ?? "";
            const next = searchValue.trim();

            if (current === next) return;

            const updatedParams = new URLSearchParams(searchParams);
            if (next) {
                updatedParams.set("q", next);
            } else {
                updatedParams.delete("q");
            }

            setSearchParams(updatedParams, { replace: true });
        }, 250);

        return () => clearTimeout(timeout);
    }, [searchValue, searchParams, setSearchParams]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (citySelectorRef.current && target && !citySelectorRef.current.contains(target)) {
                setIsCitySelectorOpen(false);
            }
            if (userMenuRef.current && target && !userMenuRef.current.contains(target)) {
                setIsUserMenuOpen(false);
                setIsThemeSubmenuOpen(false);
            }
        };

        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="relative h-[64px] bg-[#f6f7fb] border-b border-gray-200">
            <div
                data-sidebar-hover-zone="true"
                onMouseEnter={() => onHoverChange(true)}
                onMouseLeave={(event) => {
                    const next = event.relatedTarget as HTMLElement | null;
                    if (next?.closest('[data-sidebar-hover-zone="true"]')) {
                        return;
                    }
                    onHoverChange(false);
                }}
                className={`absolute left-0 top-0 flex h-full items-center border-r border-gray-200 bg-[#f6f7fb] px-4 justify-start transition-[width] duration-300 ease-out ${isSidebarPreviewExpanded ? "z-[70] shadow-lg" : "z-10"}`}
                style={{ width: `${effectiveSidebarWidth}px` }}
            >
                <div className="flex w-full items-center gap-2.5">
                    <div className="w-9 h-9 shrink-0 rounded-xl border border-[#5c4df2] flex items-center justify-center">
                        <MdDirectionsBus size={18} className="text-[#5c4df2]" />
                    </div>

                    <div
                        className="overflow-hidden transition-all duration-200 ease-out"
                        style={{
                            maxWidth: isSidebarExpanded ? "140px" : "0px",
                            opacity: isSidebarExpanded ? 1 : 0,
                            transform: isSidebarExpanded ? "translateX(0)" : "translateX(-6px)",
                            transitionDelay: isSidebarExpanded ? "90ms" : "0ms",
                        }}
                    >
                        <div className="text-lg font-bold text-gray-900 leading-none">
                            LogiControl
                        </div>
                    </div>

                    <div
                        className="ml-auto overflow-hidden transition-all duration-200 ease-out"
                        style={{
                            maxWidth: isSidebarExpanded ? "40px" : "0px",
                            opacity: isSidebarExpanded ? 1 : 0,
                            transform: isSidebarExpanded ? "translateX(0)" : "translateX(-8px)",
                            transitionDelay: isSidebarExpanded ? "140ms" : "0ms",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 ease-out hover:bg-slate-100 hover:text-slate-700"
                            aria-label={isSidebarCollapsed ? "Fijar menu" : "Ocultar menu"}
                            title={isSidebarCollapsed ? "Fijar menu" : "Ocultar menu"}
                            style={{ pointerEvents: isSidebarExpanded ? "auto" : "none" }}
                        >
                            {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            <div
                className="h-full px-10 flex items-center justify-between"
                style={{ marginLeft: `${sidebarWidth}px` }}
            >
                {/* IZQUIERDA */}
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-gray-600">
                        Panel Administrativo
                    </div>

                    <div ref={citySelectorRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsCitySelectorOpen((previous) => !previous)}
                            className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold shadow-[0_8px_20px_-16px_rgba(15,23,42,0.7)] transition-all duration-200 ${isCitySelectorOpen || !isGlobalCity
                                    ? "border-[#d9d6fe] bg-[#f6f5ff] text-[#4f46e5] hover:border-[#c7c2fc] hover:bg-[#efedff]"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            aria-haspopup="listbox"
                            aria-expanded={isCitySelectorOpen}
                            title="Filtro de ciudad"
                        >
                            <MapPin className={`h-4 w-4 ${isCitySelectorOpen || !isGlobalCity ? "text-[#6366f1]" : "text-slate-500"}`} />
                            <span>{selectedCity}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCitySelectorOpen || !isGlobalCity ? "text-[#6366f1]" : "text-slate-500"} ${isCitySelectorOpen ? "rotate-180" : "rotate-0"}`} />
                        </button>

                        {isCitySelectorOpen && (
                            <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[180px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_24px_48px_-22px_rgba(15,23,42,0.45)]">
                                {cityOptions.map((city) => {
                                    const isActive = city === selectedCity;
                                    return (
                                        <button
                                            key={city}
                                            type="button"
                                            role="option"
                                            aria-selected={isActive}
                                            onClick={() => {
                                                setSelectedCity(city);
                                                setIsCitySelectorOpen(false);
                                            }}
                                            className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors ${isActive
                                                ? "bg-[#efedff] font-semibold text-[#4f46e5]"
                                                : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                                }`}
                                        >
                                            {city}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

                {/* DERECHA */}
                <div className="flex items-center gap-8">

                    {/* Search */}
                    <div className="relative w-[260px]">
                        <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 transition-all duration-200 focus-within:border-[#5c4df2] focus-within:ring-2 focus-within:ring-[#5c4df2]/20">

                            <Search className="w-4 h-4 text-gray-400" />

                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="ml-2 bg-transparent outline-none text-sm w-full text-gray-800 placeholder:text-gray-400"
                            />

                        </div>
                    </div>

                    {/* Fecha */}
                    <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                        {dateTime}
                    </span>

                    {/* Notificaciones */}
                    <button
                        type="button"
                        onClick={() => navigate("/notifications")}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${location.pathname === "/notifications"
                            ? "border-[#d4cffc] bg-[#efedff] text-[#5c4df2]"
                            : "border-transparent text-gray-500 hover:border-slate-200 hover:bg-white hover:text-[#5c4df2]"
                            }`}
                        title="Abrir notificaciones"
                        aria-label="Abrir notificaciones"
                    >
                        <Bell className="w-5 h-5" />
                    </button>

                    {/* Usuario Menu */}
                    <div ref={userMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                setIsUserMenuOpen((prev) => !prev);
                                setIsThemeSubmenuOpen(false);
                            }}
                            className="flex items-center gap-3 cursor-pointer group px-2 py-1 rounded-lg transition-all hover:bg-slate-100"
                            title="Menu de usuario"
                            aria-haspopup="menu"
                            aria-expanded={isUserMenuOpen}
                        >
                            <div className="w-9 h-9 rounded-xl bg-[#eef2ff] flex items-center justify-center font-semibold text-[#5c4df2] text-sm">
                                {userInitials}
                            </div>

                            <div className="leading-tight">
                                <p className="text-sm font-semibold text-gray-800">
                                    {userProfile.userFullName}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {userProfile.userRole}
                                </p>
                            </div>

                            <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#5c4df2] transition-all ${isUserMenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* User Menu Dropdown */}
                        {isUserMenuOpen && (
                            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[260px] rounded-2xl border border-slate-200 bg-white shadow-[0_24px_48px_-22px_rgba(15,23,42,0.45)]">
                                {/* Usuario Header */}
                                <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Cuenta activa</p>
                                    <div className="mt-2 flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-xs font-semibold text-[#5c4df2]">
                                            {userInitials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{userProfile.userFullName}</p>
                                            <p className="text-xs text-gray-400">{userProfile.userEmail}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate("/settings");
                                            setIsUserMenuOpen(false);
                                            setIsThemeSubmenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        <User size={16} className="text-slate-500" />
                                        <span>Perfil</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate("/settings/advanced");
                                            setIsUserMenuOpen(false);
                                            setIsThemeSubmenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        <Settings size={16} className="text-slate-500" />
                                        <span>Configuracion de cuenta</span>
                                    </button>

                                    {/* Tema Submenu */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsThemeSubmenuOpen((prev) => !prev)}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                                        >
                                            <Palette size={16} className="text-slate-500" />
                                            <span>Tema</span>
                                            <ChevronDown size={14} className={`ml-auto text-slate-400 transition-transform ${isThemeSubmenuOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {/* Theme Submenu */}
                                        {isThemeSubmenuOpen && (
                                            <div className="absolute right-full top-0 mr-2 w-[190px] rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_18px_36px_-18px_rgba(15,23,42,0.4)]">
                                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Tema visual</p>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUserTheme("system");
                                                        setIsThemeSubmenuOpen(false);
                                                    }}
                                                    className={`relative mb-2 w-full overflow-hidden rounded-xl border transition-all ${
                                                        userTheme === "system"
                                                            ? "border-[#d7cbf8] bg-[#fafbff]"
                                                            : "border-slate-200 bg-white hover:border-slate-300"
                                                    }`}
                                                >
                                                    {userTheme === "system" && (
                                                        <span className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-white">
                                                            <Check size={11} />
                                                        </span>
                                                    )}
                                                    <div className="h-10 bg-gradient-to-b from-slate-100 via-slate-50 to-white p-1.5">
                                                        <div className="flex h-full gap-1 rounded-md bg-white p-1 ring-1 ring-slate-200">
                                                            <div className="w-1 rounded-full bg-slate-400" />
                                                            <div className="flex-1 space-y-1">
                                                                <div className="h-1 w-3/4 rounded-full bg-slate-300" />
                                                                <div className="h-1 w-4/5 rounded-full bg-slate-200" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold text-slate-700">
                                                        <Monitor size={13} className="text-slate-500" />
                                                        Sistema
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUserTheme("light");
                                                        setIsThemeSubmenuOpen(false);
                                                    }}
                                                    className={`relative mb-2 w-full overflow-hidden rounded-xl border transition-all ${
                                                        userTheme === "light"
                                                            ? "border-[#d7cbf8] bg-[#fafbff]"
                                                            : "border-slate-200 bg-white hover:border-slate-300"
                                                    }`}
                                                >
                                                    {userTheme === "light" && (
                                                        <span className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-white">
                                                            <Check size={11} />
                                                        </span>
                                                    )}
                                                    <div className="h-10 bg-white p-1.5">
                                                        <div className="flex h-full gap-1 rounded-md bg-white p-1 ring-1 ring-slate-200">
                                                            <div className="w-1 rounded-full bg-yellow-400" />
                                                            <div className="flex-1 space-y-1">
                                                                <div className="h-1 w-3/4 rounded-full bg-slate-200" />
                                                                <div className="h-1 w-4/5 rounded-full bg-slate-100" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold text-slate-700">
                                                        <Sun size={13} className="text-amber-500" />
                                                        Claro
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUserTheme("dark");
                                                        setIsThemeSubmenuOpen(false);
                                                    }}
                                                    className={`relative w-full overflow-hidden rounded-xl border transition-all ${
                                                        userTheme === "dark"
                                                            ? "border-[#d7cbf8] bg-[#fafbff]"
                                                            : "border-slate-200 bg-white hover:border-slate-300"
                                                    }`}
                                                >
                                                    {userTheme === "dark" && (
                                                        <span className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-slate-800">
                                                            <Check size={11} />
                                                        </span>
                                                    )}
                                                    <div className="h-10 bg-slate-900 p-1.5">
                                                        <div className="flex h-full gap-1 rounded-md bg-slate-800 p-1 ring-1 ring-slate-700">
                                                            <div className="w-1 rounded-full bg-blue-400" />
                                                            <div className="flex-1 space-y-1">
                                                                <div className="h-1 w-3/4 rounded-full bg-slate-600" />
                                                                <div className="h-1 w-4/5 rounded-full bg-slate-700" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold text-slate-700">
                                                        <Moon size={13} className="text-slate-500" />
                                                        Oscuro
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate("/");
                                            setIsUserMenuOpen(false);
                                            setIsThemeSubmenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        <User size={16} className="text-slate-500" />
                                        <span>Cambiar cuenta</span>
                                    </button>
                                </div>

                                {/* Logout */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigate("/");
                                        setIsUserMenuOpen(false);
                                        setIsThemeSubmenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>Cerrar sesion</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};