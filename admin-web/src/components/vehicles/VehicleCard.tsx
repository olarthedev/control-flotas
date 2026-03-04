import {
    MdLocalShipping,
    MdDeleteOutline,
    MdEdit,
    MdOutlineMonetizationOn,
} from "react-icons/md";
import { LuCircleDot } from "react-icons/lu";

interface VehicleCardProps {
    id: number;
    name: string;
    plate: string;
    type: string;
    totalExpense: string;
    lastMaintenance: string;
    soatStatus: string;
    tecnoStatus: string;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

function StatusBadge({ label }: { label: string }) {
    const isVigente = label.toLowerCase() === "vigente";

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold
        ${isVigente
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-500"
                }`}
        >
            {label}
        </span>
    );
}

export function VehicleCard({
    id,
    name,
    plate,
    type,
    totalExpense,
    lastMaintenance,
    soatStatus,
    tecnoStatus,
    onEdit,
    onDelete,
}: VehicleCardProps) {
    const soatVigente = soatStatus.toLowerCase() === "vigente";
    const tecnoVigente = tecnoStatus.toLowerCase() === "vigente";

    return (
        <article
            className="
        group
        rounded-3xl border border-slate-200 bg-white
        px-6 py-5 shadow-sm
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-1 hover:border-indigo-200
      "
        >
            {/* HEADER */}
            <header className="mb-3 flex items-start justify-between">
                <div
                    className="
            flex h-12 w-12 items-center justify-center
            rounded-xl bg-indigo-100 text-[#5848f4]
            
          "
                >
                    <MdLocalShipping size={22} />
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={() => onEdit?.(id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#5848f4] hover:opacity-90"
                        aria-label={`Editar ${name}`}
                    >
                        <MdEdit size={14} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete?.(id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:opacity-90"
                        aria-label={`Eliminar ${name}`}
                    >
                        <MdDeleteOutline size={14} />
                    </button>
                </div>
            </header>

            {/* NAME + PLATE */}
            <div className="mb-1.5 flex items-center gap-2">
                <h3 className="text-[16px] leading-tight font-semibold text-slate-900">
                    {name}
                </h3>

                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-all duration-300 ease-out group-hover:bg-[#5848f4] group-hover:text-white group-hover:scale-105">
                    {plate}
                </span>
            </div>

            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {type}
            </p>

            <div className="my-4 h-px bg-slate-100" />

            {/* INFO BOXES */}
            <div className="mb-4 grid grid-cols-2 gap-2">
                <section className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Gasto total
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                        {totalExpense}
                    </p>
                </section>

                <section className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Mantenimiento
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                        {lastMaintenance}
                    </p>
                </section>
            </div>

            {/* STATUS */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-400">
                        <MdOutlineMonetizationOn size={16} />
                        SOAT
                    </span>
                    <StatusBadge label={soatStatus} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-400">
                        <LuCircleDot size={14} />
                        Tecnomecánica
                    </span>
                    <StatusBadge label={tecnoStatus} />
                </div>
            </div>

            {/* FOOTER */}
            <footer className="mt-4 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Estado documental
                </span>

                <span className="inline-flex items-center gap-1.5">
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${soatVigente ? "bg-emerald-500" : "bg-red-500"
                            }`}
                    />
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${tecnoVigente ? "bg-emerald-500" : "bg-red-500"
                            }`}
                    />
                </span>
            </footer>
        </article>
    );
}