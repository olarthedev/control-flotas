import { useEffect, useRef, useState } from 'react';
import { Bus, Calendar, Check, ChevronDown, DollarSign, User, X } from 'lucide-react';
import { type VehicleExpenseSummary } from '../../services/expenses-grouped.service';
import { getWeekRange } from '../../pages/expenses-week.utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ConsignmentModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    vehicleOptions: VehicleExpenseSummary[];
    selectedVehicleId: number | null;
    selectedWeek: string;
    onVehicleChange: (vehicleId: number) => void;
    onClose: () => void;
    onConfirm: (amount: number) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatWeekDisplay(weekKey: string): string {
    const { start, end } = getWeekRange(weekKey);
    const sun = new Date(end.getTime() - 86_400_000);
    const M = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${start.getDate()} – ${sun.getDate()} de ${M[sun.getMonth()]} · ${sun.getFullYear()}`;
}

function formatCOP(value: number): string {
    return value.toLocaleString('es-CO');
}

const PRESETS = [
    { label: '$200K', value: 200_000 },
    { label: '$700K', value: 700_000 },
    { label: '$1M',   value: 1_000_000 },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function ConsignmentModal({
    isOpen,
    isSubmitting,
    vehicleOptions,
    selectedVehicleId,
    selectedWeek,
    onVehicleChange,
    onClose,
    onConfirm,
}: ConsignmentModalProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible,    setIsVisible]    = useState(false);
    const [rawAmount,    setRawAmount]    = useState(0);
    const [amountDisplay, setAmountDisplay] = useState('');
    const [vehicleOpen,  setVehicleOpen]  = useState(false);

    const vehicleMenuRef = useRef<HTMLDivElement>(null);

    // ── Animation ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const t = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(t);
        }
        setIsVisible(false);
        const t = setTimeout(() => {
            setShouldRender(false);
            setRawAmount(0);
            setAmountDisplay('');
            setVehicleOpen(false);
        }, 200);
        return () => clearTimeout(t);
    }, [isOpen]);

    // ── Close vehicle dropdown on outside click ────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (vehicleMenuRef.current && !vehicleMenuRef.current.contains(e.target as Node)) {
                setVehicleOpen(false);
            }
        };
        window.addEventListener('mousedown', handler);
        return () => window.removeEventListener('mousedown', handler);
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\./g, '').replace(/\D/g, '');
        if (!digits) { setRawAmount(0); setAmountDisplay(''); return; }
        const num = parseInt(digits, 10);
        setRawAmount(num);
        setAmountDisplay(formatCOP(num));
    };

    const selectPreset = (preset: number) => {
        if (rawAmount === preset) {
            setRawAmount(0);
            setAmountDisplay('');
        } else {
            setRawAmount(preset);
            setAmountDisplay(formatCOP(preset));
        }
    };

    const handleConfirm = async () => {
        if (!rawAmount || rawAmount <= 0) return;
        await onConfirm(rawAmount);
        setRawAmount(0);
        setAmountDisplay('');
    };

    // ── Selected vehicle ──────────────────────────────────────────────────────
    const selectedVehicle = vehicleOptions.find(v => v.vehicleId === selectedVehicleId);

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_rgba(0,0,0,.18)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`}
            >
                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-start justify-between px-8 pb-6 pt-8">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl"
                            style={{ background: 'rgba(91,92,235,0.12)' }}
                        >
                            <DollarSign size={22} className="text-[#5B5CEB]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                                Nueva operación
                            </p>
                            <h2 className="text-[20px] font-bold leading-tight text-gray-900">
                                Consignar a vehículo
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Content ─────────────────────────────────────────────── */}
                <div className="space-y-5 px-8 pb-8">
                    {/* Vehicle custom dropdown */}
                    <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                            Vehículo
                        </label>
                        <div ref={vehicleMenuRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setVehicleOpen(o => !o)}
                                className="flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left transition focus:outline-none"
                                style={{
                                    borderColor: vehicleOpen ? '#5B5CEB' : 'var(--card-border)',
                                    boxShadow: vehicleOpen
                                        ? '0 0 0 3px rgba(91,92,235,0.12), 0 1px 3px rgba(0,0,0,.04)'
                                        : '0 1px 3px rgba(0,0,0,.04)',
                                }}
                            >
                                <div
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                    style={{ background: selectedVehicle ? 'rgba(91,92,235,0.10)' : '#F3F4F6' }}
                                >
                                    <Bus size={14} className={selectedVehicle ? 'text-[#5B5CEB]' : 'text-gray-400'} />
                                </div>
                                <span className="flex-1 text-[14px] font-semibold text-gray-800">
                                    {selectedVehicle
                                        ? `${selectedVehicle.licensePlate.toUpperCase()} — ${selectedVehicle.brand} ${selectedVehicle.model}`
                                        : 'Selecciona un vehículo'}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`shrink-0 transition-transform ${vehicleOpen ? 'rotate-180 text-[#5B5CEB]' : 'text-gray-400'}`}
                                />
                            </button>

                            {vehicleOpen && (
                                <div
                                    className="absolute left-0 top-[calc(100%+8px)] z-10 w-full overflow-hidden rounded-2xl border bg-white p-1.5"
                                    style={{ borderColor: 'var(--card-border)', boxShadow: '0 20px 60px rgba(0,0,0,.14)' }}
                                >
                                    {vehicleOptions.map(v => {
                                        const selected = selectedVehicleId === v.vehicleId;
                                        return (
                                            <button
                                                key={v.vehicleId}
                                                type="button"
                                                onClick={() => { onVehicleChange(v.vehicleId); setVehicleOpen(false); }}
                                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${selected ? 'bg-[rgba(91,92,235,0.08)]' : 'hover:bg-gray-50'}`}
                                            >
                                                <div
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                                                    style={{ background: selected ? 'rgba(91,92,235,0.14)' : '#F3F4F6' }}
                                                >
                                                    <Bus size={14} className={selected ? 'text-[#5B5CEB]' : 'text-gray-400'} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-[13px] font-bold ${selected ? 'text-[#5B5CEB]' : 'text-gray-800'}`}>
                                                        {v.licensePlate.toUpperCase()}
                                                    </p>
                                                    <p className="text-[12px] text-gray-400">
                                                        {v.brand} {v.model}
                                                    </p>
                                                </div>
                                                {selected && (
                                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5B5CEB]">
                                                        <Check size={11} className="text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Driver info */}
                        {selectedVehicle?.driverName && selectedVehicle.driverName !== 'Sin asignar' && (
                            <div className="mt-2.5 flex items-center gap-2 px-1">
                                <User size={13} className="shrink-0 text-gray-400" />
                                <span className="text-[13px] text-gray-400">
                                    Conductor:{' '}
                                    <span className="font-semibold text-gray-600">
                                        {selectedVehicle.driverName}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Week */}
                    <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                            Semana (Lun — Dom)
                        </label>
                        <div
                            className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5"
                            style={{ borderColor: 'var(--card-border)', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}
                        >
                            <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                style={{ background: 'rgba(91,92,235,0.10)' }}
                            >
                                <Calendar size={14} className="text-[#5B5CEB]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    Lun → Dom
                                </p>
                                <p className="text-[14px] font-bold text-gray-800">
                                    {formatWeekDisplay(selectedWeek)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label
                            htmlFor="consign-amount"
                            className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400"
                        >
                            Monto a consignar
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] font-bold text-gray-400">
                                $
                            </span>
                            <input
                                id="consign-amount"
                                type="text"
                                inputMode="numeric"
                                value={amountDisplay}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className="w-full rounded-2xl border-2 py-4 pl-9 pr-16 text-[24px] font-bold text-gray-900 outline-none transition placeholder:text-gray-200"
                                style={{
                                    borderColor: rawAmount > 0 ? '#5B5CEB' : '#E5E7EB',
                                    boxShadow: rawAmount > 0 ? '0 0 0 4px rgba(91,92,235,0.10)' : 'none',
                                }}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-300">
                                COP
                            </span>
                        </div>

                        {/* Preset buttons: gris por defecto, morado cuando está seleccionado */}
                        <div className="mt-3 flex gap-2">
                            {PRESETS.map(p => {
                                const active = rawAmount === p.value;
                                return (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => selectPreset(p.value)}
                                        className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition"
                                        style={active
                                            ? { background: 'rgba(91,92,235,0.14)', color: '#5B5CEB' }
                                            : { background: '#F3F4F6', color: '#6B7280' }
                                        }
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-2xl border border-gray-200 py-3.5 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isSubmitting || rawAmount <= 0}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-40"
                            style={{ background: '#5B5CEB' }}
                        >
                            <Check size={16} />
                            {isSubmitting ? 'Procesando...' : 'Confirmar consignación'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
