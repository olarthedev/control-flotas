import { MdEdit } from 'react-icons/md';
import { MdDeleteOutline } from 'react-icons/md';

interface DriverCardProps {
    id: number;
    fullName: string;
    email: string;
    monthlySalary: number;
    pendingBalance: number;
    assignedVehiclePlate: string | null;
    isActive: boolean;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

function formatCurrency(value: number): string {
    return `$${value.toLocaleString('en-US')}`;
}

export function DriverCard({
    id,
    fullName,
    email,
    monthlySalary,
    pendingBalance,
    assignedVehiclePlate,
    isActive,
    onEdit,
    onDelete,
}: DriverCardProps) {
    const initial = fullName.trim().charAt(0).toUpperCase() || 'D';

    return (
        <article className="group relative rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg">
            <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                    type="button"
                    aria-label={`Editar ${fullName}`}
                    onClick={() => onEdit?.(id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#5848f4] hover:opacity-90"
                >
                    <MdEdit size={14} />
                </button>

                <button
                    type="button"
                    aria-label={`Eliminar ${fullName}`}
                    onClick={() => onDelete?.(id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:opacity-90"
                >
                    <MdDeleteOutline size={14} />
                </button>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600">
                    {initial}
                </div>

                <div>
                    <h3 className="text-[16px] leading-tight font-semibold text-slate-900">{fullName}</h3>
                    <p className="text-[13px] text-slate-500">{email}</p>
                </div>
            </div>

            <div className="my-4 h-px bg-slate-100" />

            <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">Salario Mensual:</dt>
                    <dd className="font-semibold text-slate-700">{formatCurrency(monthlySalary)}</dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">Saldo Pendiente:</dt>
                    <dd className="font-semibold text-rose-500">{formatCurrency(pendingBalance)}</dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">Vehículo:</dt>
                    <dd className="font-semibold text-[#5848f4]">{assignedVehiclePlate ?? 'Sin asignar'}</dd>
                </div>
            </dl>

            <footer className="mt-5 flex items-center justify-between">
                <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                >
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>

                <div className="flex items-center gap-3 text-[11px] font-bold tracking-wide">
                    <button type="button" className="text-[#5848f4] hover:opacity-80">
                        ABONAR
                    </button>
                    <button type="button" className="text-slate-400 hover:text-slate-500">
                        HISTORIAL
                    </button>
                </div>
            </footer>
        </article>
    );
}
