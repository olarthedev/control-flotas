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
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
        ${isVigente
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-500"
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
        hover:shadow-lg hover:-translate-y-1
      "
        >
            {/* HEADER */}
            <header className="mb-4 flex items-start justify-between">
                <div
                    className="
            flex h-12 w-12 items-center justify-center
            rounded-xl bg-indigo-100 text-[#5848f4]
            transition-all duration-300
            
          "
                >
                    <MdLocalShipping size={24} />
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onEdit?.(id)}
                        className="
            rounded-md p-2 text-slate-400
            transition-all duration-200
            hover:bg-slate-100 hover:text-slate-600
          "
                        aria-label={`Editar ${name}`}
                    >
                        <MdEdit size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete?.(id)}
                        className="
            rounded-md p-2 text-red-400
            transition-all duration-200
            hover:bg-red-50 hover:text-red-600
          "
                        aria-label={`Eliminar ${name}`}
                    >
                        <MdDeleteOutline size={18} />
                    </button>
                </div>
            </header>

            {/* NAME + PLATE */}
            <div className="mb-2 flex items-center gap-3">
                <h3 className="text-lg font-bold text-[#0f1f47]">
                    {name}
                </h3>

                <span className="
   rounded-md
    bg-slate-100
    px-3 py-1
    text-xs font-semibold
    text-slate-600
    transition-all duration-300 ease-out
    group-hover:bg-[#5848f4]
    group-hover:text-white
    group-hover:scale-105
  ">
                    {plate}
                </span>
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {type}
            </p>

            {/* INFO BOXES */}
            <div className="mb-5 grid grid-cols-2 gap-3">
                <section className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Gasto total
                    </p>
                    <p className="text-base font-bold text-[#0f1f47]">
                        {totalExpense}
                    </p>
                </section>

                <section className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Mantenimiento
                    </p>
                    <p className="text-base font-bold text-[#0f1f47]">
                        {lastMaintenance}
                    </p>
                </section>
            </div>

            {/* STATUS */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                        <MdOutlineMonetizationOn size={18} className="text-slate-400" />
                        SOAT
                    </span>
                    <StatusBadge label={soatStatus} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                        <LuCircleDot size={16} className="text-slate-400" />
                        Tecnomecánica
                    </span>
                    <StatusBadge label={tecnoStatus} />
                </div>
            </div>

            {/* FOOTER */}
            <footer className="mt-5 bg-slate-100 px-6 py-4 flex items-center justify-between rounded-b-3xl">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Estado documental
                </span>

                <span className="inline-flex items-center gap-2">
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${soatVigente ? "bg-green-500" : "bg-red-500"
                            }`}
                    />
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${tecnoVigente ? "bg-green-500" : "bg-red-500"
                            }`}
                    />
                </span>
            </footer>
        </article>
    );
}