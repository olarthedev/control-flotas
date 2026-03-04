import { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';

export interface DriverFormData {
    id?: number;
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    licenseNumber?: string;
    monthlySalary?: number;
    isActive: boolean;
    assignedVehicleId?: number;
}

interface DriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (driver: DriverFormData) => Promise<void>;
    mode: 'create' | 'edit';
    driver?: DriverFormData;
    vehicles: { id: number; label: string }[];
}

export function DriverModal({ isOpen, onClose, onSave, mode, driver, vehicles }: DriverModalProps) {
    const [formData, setFormData] = useState<DriverFormData>({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        licenseNumber: '',
        monthlySalary: undefined,
        isActive: true,
        assignedVehicleId: undefined,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const frame = requestAnimationFrame(() => setIsVisible(true));
            return () => cancelAnimationFrame(frame);
        }

        setIsVisible(false);
        const timeout = setTimeout(() => setShouldRender(false), 180);
        return () => clearTimeout(timeout);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                fullName: '',
                email: '',
                password: '',
                phone: '',
                licenseNumber: '',
                monthlySalary: undefined,
                isActive: true,
                assignedVehicleId: undefined,
            });
            setError(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && driver) {
            setFormData({
                id: driver.id,
                fullName: driver.fullName,
                email: driver.email,
                password: '',
                phone: driver.phone ?? '',
                licenseNumber: driver.licenseNumber ?? '',
                monthlySalary: driver.monthlySalary,
                isActive: driver.isActive,
                assignedVehicleId: driver.assignedVehicleId,
            });
            return;
        }

        setFormData({
            fullName: '',
            email: '',
            password: '',
            phone: '',
            licenseNumber: '',
            monthlySalary: undefined,
            isActive: true,
            assignedVehicleId: undefined,
        });
    }, [isOpen, mode, driver]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await onSave(formData);
            onClose();
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Failed to create driver');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;

        if (name === 'monthlySalary') {
            setFormData((previous) => ({
                ...previous,
                monthlySalary: value ? Number(value) : undefined,
            }));
            return;
        }

        if (name === 'isActive') {
            setFormData((previous) => ({
                ...previous,
                isActive: value === 'true',
            }));
            return;
        }

        if (name === 'assignedVehicleId') {
            setFormData((previous) => ({
                ...previous,
                assignedVehicleId: value ? Number(value) : undefined,
            }));
            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            <div
                className={`relative z-10 mx-4 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
                    }`}
            >
                <header className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {mode === 'create' ? 'Nuevo Conductor' : 'Editar Conductor'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <MdClose size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Nombre completo
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password ?? ''}
                                onChange={handleInputChange}
                                required={mode === 'create'}
                                minLength={mode === 'create' ? 8 : 0}
                                placeholder={mode === 'edit' ? 'Dejar vacío para no cambiar' : ''}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="monthlySalary" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Salario mensual
                            </label>
                            <input
                                id="monthlySalary"
                                name="monthlySalary"
                                type="number"
                                min={0}
                                value={formData.monthlySalary ?? ''}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Teléfono
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                value={formData.phone ?? ''}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="licenseNumber" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Licencia
                            </label>
                            <input
                                id="licenseNumber"
                                name="licenseNumber"
                                value={formData.licenseNumber ?? ''}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="isActive" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Estado
                            </label>
                            <select
                                id="isActive"
                                name="isActive"
                                value={String(formData.isActive)}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="assignedVehicleId" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Vehículo asignado
                            </label>
                            <select
                                id="assignedVehicleId"
                                name="assignedVehicleId"
                                value={formData.assignedVehicleId ?? ''}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="">Sin asignar</option>
                                {vehicles.map((vehicle) => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-lg bg-[#5848f4] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Conductor' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
