import React, { useEffect, useState } from "react";
import { Bell, Search, ChevronDown } from "lucide-react";
import { MdDirectionsBus } from "react-icons/md";

export const TopBar: React.FC = () => {
    const [dateTime, setDateTime] = useState("");

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

    return (
        <header className="h-[64px] bg-white border-b border-gray-100 flex items-center justify-between px-10">

            {/* IZQUIERDA */}
            <div className="flex items-center gap-6">

                {/* Logo sin fondo - delineado */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl border border-[#5c4df2] flex items-center justify-center">
                        <MdDirectionsBus size={18} className="text-[#5c4df2]" />
                    </div>

                    <div>
                        <div className="text-lg font-bold text-gray-900 leading-none">
                            LogiControl
                        </div>

                    </div>
                </div>

                {/* Separador elegante */}
                <div className="h-6 w-px bg-gray-200"></div>

                {/* Sección actual */}
                <div className="text-sm font-medium text-gray-600">
                    Panel Administrativo
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
                            placeholder="Buscar..."
                            className="ml-2 bg-transparent outline-none text-sm w-full text-gray-800 placeholder:text-gray-400"
                        />

                    </div>
                </div>

                {/* Fecha */}
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                    {dateTime}
                </span>

                {/* Notificaciones */}
                <Bell className="w-5 h-5 text-gray-500 cursor-pointer hover:text-[#5c4df2] transition-colors" />

                {/* Usuario */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-9 h-9 rounded-xl bg-[#eef2ff] flex items-center justify-center font-semibold text-[#5c4df2] text-sm">
                        CO
                    </div>

                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-gray-800">
                            Cristian Olarte
                        </p>
                        <p className="text-xs text-gray-400">
                            Administrador
                        </p>
                    </div>

                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#5c4df2] transition-colors" />
                </div>
            </div>
        </header>
    );
};