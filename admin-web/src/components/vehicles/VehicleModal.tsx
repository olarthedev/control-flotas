import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

interface VehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicle: VehicleFormData) => Promise<void>;
    vehicle?: VehicleFormData;
    mode: 'create' | 'edit';
}

export interface VehicleFormData {
    id?: number;
    licensePlate: string;
    type: string;
    brand: string;
    model: string;
    soatExpiryDate: string;
    technicalReviewExpiryDate: string;
}

const vehicleTypes = [
    'Furgón',
    'Remolque',
    'Cabezote',
    'Camión',
    'Camioneta',
    'Tracto-Camión'
];

export function VehicleModal({ isOpen, onClose, onSave, vehicle, mode }: VehicleModalProps) {
    const [formData, setFormData] = useState<VehicleFormData>({
        licensePlate: '',
        type: 'Furgón',
        brand: '',
        model: '',
        soatExpiryDate: '',
        technicalReviewExpiryDate: ''
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
        if (vehicle && mode === 'edit') {
            setFormData(vehicle);
        } else if (mode === 'create') {
            setFormData({
                licensePlate: '',
                type: 'Furgón',
                brand: '',
                model: '',
                soatExpiryDate: '',
                technicalReviewExpiryDate: ''
            });
        }
    }, [vehicle, mode, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar el vehículo');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                className={`relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
                    }`}
            >
                <header className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {mode === 'create' ? 'Nuevo Vehículo' : 'Editar Vehículo'}
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
                            <label htmlFor="licensePlate" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Placa
                            </label>
                            <input
                                type="text"
                                id="licensePlate"
                                name="licensePlate"
                                value={formData.licensePlate}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="ABC-123"
                            />
                        </div>

                        <div>
                            <label htmlFor="type" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Tipo
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {vehicleTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="brand" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Marca
                            </label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Kenworth"
                            />
                        </div>

                        <div>
                            <label htmlFor="model" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Modelo
                            </label>
                            <input
                                type="text"
                                id="model"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="T800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="soatExpiryDate" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Vencimiento SOAT
                            </label>
                            <input
                                type="date"
                                id="soatExpiryDate"
                                name="soatExpiryDate"
                                value={formData.soatExpiryDate}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="technicalReviewExpiryDate" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Vencimiento Tecno
                            </label>
                            <input
                                type="date"
                                id="technicalReviewExpiryDate"
                                name="technicalReviewExpiryDate"
                                value={formData.technicalReviewExpiryDate}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
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
                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
