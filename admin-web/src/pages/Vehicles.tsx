import { useEffect, useState } from 'react';
import { MdGridView, MdViewList, MdAdd } from 'react-icons/md';
import { useSearchParams } from 'react-router-dom';
import type { VehicleCardData } from '../services/vehicles.service';
import { fetchVehicles, createVehicle, updateVehicle, getVehicleById, deleteVehicle } from '../services/vehicles.service';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleModal, type VehicleFormData } from '../components/vehicles/VehicleModal';
import { DeleteVehicleModal } from '../components/vehicles/DeleteVehicleModal';

export function VehiclesPage() {
    const [searchParams] = useSearchParams();
    const [vehicles, setVehicles] = useState<VehicleCardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleFormData | undefined>(undefined);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<VehicleCardData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadVehicles = async () => {
        try {
            setIsLoading(true);
            const data = await fetchVehicles();
            setVehicles(data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Error al cargar los vehículos'
            );
            setVehicles([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, []);

    const handleCreateVehicle = () => {
        setModalMode('create');
        setSelectedVehicle(undefined);
        setIsModalOpen(true);
    };

    const handleEditVehicle = async (vehicleId: number) => {
        try {
            const vehicle = await getVehicleById(vehicleId);

            // Convert ISO dates to YYYY-MM-DD format for date inputs
            const formatDateForInput = (dateString: string | null): string => {
                if (!dateString) return '';
                return dateString.split('T')[0];
            };

            setModalMode('edit');
            setSelectedVehicle({
                id: vehicle.id,
                licensePlate: vehicle.licensePlate,
                brand: vehicle.brand,
                model: vehicle.model,
                type: vehicle.type,
                soatExpiryDate: formatDateForInput(vehicle.soatExpiryDate),
                technicalReviewExpiryDate: formatDateForInput(vehicle.technicalReviewExpiryDate)
            });
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error loading vehicle for edit:', err);
        }
    };

    const handleSaveVehicle = async (vehicleData: VehicleFormData) => {
        try {
            // Convert empty strings to undefined, non-empty to ISO format for optional date fields
            const formatDateForBackend = (dateString: string): string | undefined => {
                if (!dateString) return undefined;
                // Format YYYY-MM-DD to ISO string
                return dateString + 'T00:00:00.000Z';
            };

            const cleanedData = {
                licensePlate: vehicleData.licensePlate,
                brand: vehicleData.brand,
                model: vehicleData.model,
                type: vehicleData.type,
                soatExpiryDate: formatDateForBackend(vehicleData.soatExpiryDate),
                technicalReviewExpiryDate: formatDateForBackend(vehicleData.technicalReviewExpiryDate)
            };

            if (modalMode === 'create') {
                await createVehicle(cleanedData);
            } else {
                if (!vehicleData.id) return;
                await updateVehicle(vehicleData.id, cleanedData);
            }

            await loadVehicles();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving vehicle:', error);
            throw error;
        }
    };

    const handleDeleteVehicle = async (vehicleId: number) => {
        const selected = vehicles.find(vehicle => vehicle.id === vehicleId);
        if (!selected) return;

        setVehicleToDelete(selected);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteVehicle = async () => {
        if (!vehicleToDelete) return;

        setIsDeleting(true);
        try {
            await deleteVehicle(vehicleToDelete.id);
            await loadVehicles();
            setIsDeleteModalOpen(false);
            setVehicleToDelete(null);
        } catch (err) {
            console.error('Error deleting vehicle:', err);
            setError(err instanceof Error ? err.message : 'Error al eliminar el vehículo');
        } finally {
            setIsDeleting(false);
        }
    };

    const searchTerm = (searchParams.get('q') ?? '').trim().toLowerCase();

    const filteredVehicles = vehicles.filter((vehicle) => {
        if (!searchTerm) return true;

        return (
            vehicle.name.toLowerCase().includes(searchTerm)
            || vehicle.plate.toLowerCase().includes(searchTerm)
            || vehicle.type.toLowerCase().includes(searchTerm)
        );
    });

    return (
        <section className="space-y-4">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-[16px] font-semibold tracking-tight text-[#0f1f47]">
                        Flota Vehicular
                    </h1>
                    <p className="mt-1 text-sm font-normal italic text-slate-400">
                        ⚡ "Alerta IA: El vehículo ABC-123 requiere cambio de aceite en los próximos 500km."
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
                        <button
                            type="button"
                            className="rounded-md bg-indigo-50 p-1.5 text-[#5848f4]"
                            aria-label="Vista de cuadrícula"
                        >
                            <MdGridView size={16} />
                        </button>
                        <button
                            type="button"
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50"
                            aria-label="Vista de lista"
                        >
                            <MdViewList size={16} />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateVehicle}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#5848f4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                    >
                        <MdAdd size={16} />
                        Nuevo Vehículo
                    </button>
                </div>
            </header>

            {isLoading && (
                <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-16">
                    <div className="space-y-2 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#5848f4]" />
                        <p className="text-sm text-slate-500">Cargando vehículos...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                    <p className="font-semibold">Error al cargar los vehículos</p>
                    <p className="mt-1">{error}</p>
                </div>
            )}

            {!isLoading && !error && vehicles.length === 0 && (
                <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-16">
                    <p className="text-sm text-slate-500">No hay vehículos registrados</p>
                </div>
            )}

            {!isLoading && !error && vehicles.length > 0 && filteredVehicles.length === 0 && (
                <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-16">
                    <p className="text-sm text-slate-500">No hay resultados para “{searchParams.get('q')}”</p>
                </div>
            )}

            {!isLoading && !error && filteredVehicles.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredVehicles.map(vehicle => (
                        <VehicleCard
                            key={vehicle.id}
                            id={vehicle.id}
                            name={vehicle.name}
                            plate={vehicle.plate}
                            type={vehicle.type}
                            totalExpense={vehicle.totalExpense}
                            lastMaintenance={vehicle.lastMaintenance}
                            soatStatus={vehicle.soatStatus}
                            tecnoStatus={vehicle.tecnoStatus}
                            onEdit={handleEditVehicle}
                            onDelete={handleDeleteVehicle}
                        />
                    ))}
                </div>
            )}

            <VehicleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveVehicle}
                vehicle={selectedVehicle}
                mode={modalMode}
            />

            <DeleteVehicleModal
                isOpen={isDeleteModalOpen}
                vehicleName={vehicleToDelete?.name}
                onClose={() => {
                    if (isDeleting) return;
                    setIsDeleteModalOpen(false);
                    setVehicleToDelete(null);
                }}
                onConfirm={confirmDeleteVehicle}
                isDeleting={isDeleting}
            />
        </section>
    );
}