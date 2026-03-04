import { useEffect, useMemo, useState } from 'react';
import { MdGridView, MdViewList, MdAdd, MdEdit, MdDeleteOutline } from 'react-icons/md';
import { useSearchParams } from 'react-router-dom';
import { DriverCard } from '../components/drivers/DriverCard';
import { DriverModal, type DriverFormData } from '../components/drivers/DriverModal';
import { DeleteDriverModal } from '../components/drivers/DeleteDriverModal';
import { DriverPaymentModal } from '../components/drivers/DriverPaymentModal';
import { DriverPaymentHistoryModal } from '../components/drivers/DriverPaymentHistoryModal';
import { Toast, type ToastType } from '../components/Toast';
import {
    createDriver,
    deleteDriver,
    fetchDriverSummaries,
    getDriverById,
    type DriverSummary,
    updateDriver,
} from '../services/drivers.service';
import { fetchVehicles } from '../services/vehicles.service';
import {
    createDriverPayment,
    fetchDriverPaymentHistory,
    resetDriverPaymentMonth,
    type DriverPayment,
} from '../services/consignments.service';

export function DriversPage() {
    const [searchParams] = useSearchParams();
    const [drivers, setDrivers] = useState<DriverSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedDriver, setSelectedDriver] = useState<DriverFormData | undefined>(undefined);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState<DriverSummary | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [vehicleOptions, setVehicleOptions] = useState<{ id: number; label: string }[]>([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedDriverForPayments, setSelectedDriverForPayments] = useState<DriverSummary | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<DriverPayment[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const loadDrivers = async () => {
        try {
            setIsLoading(true);
            const data = await fetchDriverSummaries();
            setDrivers(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load drivers');
            setDrivers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    useEffect(() => {
        const loadVehicles = async () => {
            try {
                const data = await fetchVehicles();
                setVehicleOptions(
                    data.map((vehicle) => ({
                        id: vehicle.id,
                        label: `${vehicle.plate} - ${vehicle.name}`,
                    })),
                );
            } catch (err) {
                console.error('Error loading vehicles for drivers modal:', err);
            }
        };

        loadVehicles();
    }, []);

    const searchTerm = (searchParams.get('q') ?? '').trim().toLowerCase();

    const filteredDrivers = useMemo(() => {
        if (!searchTerm) return drivers;

        return drivers.filter((driver) => {
            return (
                driver.fullName.toLowerCase().includes(searchTerm)
                || driver.email.toLowerCase().includes(searchTerm)
                || (driver.assignedVehiclePlate ?? '').toLowerCase().includes(searchTerm)
            );
        });
    }, [drivers, searchTerm]);

    const suggestion = useMemo(() => {
        if (!drivers.length) {
            return 'Sugerencia: agrega conductores para comenzar a monitorear su desempeño.';
        }

        return 'Sugerencia: Carlos Rodriguez tiene el mejor índice de ahorro de combustible este mes.';
    }, [drivers]);

    const handleCreateDriver = () => {
        setModalMode('create');
        setSelectedDriver(undefined);
        setIsModalOpen(true);
    };

    const handleEditDriver = async (driverId: number) => {
        try {
            const driver = await getDriverById(driverId);

            setModalMode('edit');
            setSelectedDriver({
                id: driver.id,
                fullName: driver.fullName,
                email: driver.email,
                phone: driver.phone ?? '',
                licenseNumber: driver.licenseNumber ?? '',
                monthlySalary: driver.monthlySalary,
                password: '',
                isActive: driver.isActive,
                assignedVehicleId: driver.assignedVehicle?.id,
            });
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error loading driver for edit:', err);
        }
    };

    const handleSaveDriver = async (driverData: DriverFormData) => {
        try {
            if (modalMode === 'create') {
                await createDriver({
                    fullName: driverData.fullName,
                    email: driverData.email,
                    password: driverData.password || '',
                    phone: driverData.phone || undefined,
                    licenseNumber: driverData.licenseNumber || undefined,
                    monthlySalary: driverData.monthlySalary,
                    role: 'DRIVER',
                    assignedVehicleId: driverData.assignedVehicleId,
                });
            } else {
                if (!driverData.id) return;

                await updateDriver(driverData.id, {
                    fullName: driverData.fullName,
                    email: driverData.email,
                    password: driverData.password?.trim() ? driverData.password : undefined,
                    phone: driverData.phone || undefined,
                    licenseNumber: driverData.licenseNumber || undefined,
                    monthlySalary: driverData.monthlySalary,
                    isActive: driverData.isActive,
                    assignedVehicleId: driverData.assignedVehicleId,
                });

                // Recargar la lista para reflejar el nuevo saldo pendiente calculado en el backend
                await loadDrivers();
            }

            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving driver:', err);
        }
    };

    const handleDeleteDriver = (driverId: number) => {
        const selected = drivers.find((driver) => driver.id === driverId);
        if (!selected) return;

        setDriverToDelete(selected);
        setIsDeleteModalOpen(true);
    };

    const handleOpenPayModal = (driverId: number) => {
        const selected = drivers.find((driver) => driver.id === driverId);
        if (!selected) return;

        setSelectedDriverForPayments(selected);
        setIsPaymentModalOpen(true);
    };

    const handleOpenHistoryModal = async (driverId: number) => {
        const selected = drivers.find((driver) => driver.id === driverId);
        if (!selected) return;

        setSelectedDriverForPayments(selected);
        setIsHistoryModalOpen(true);

        try {
            setIsLoadingHistory(true);
            const history = await fetchDriverPaymentHistory(driverId);
            setPaymentHistory(history);
        } catch (err) {
            console.error('Error loading payment history:', err);
            setPaymentHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleConfirmPayment = async (amount: number) => {
        if (!selectedDriverForPayments) return;

        const payment = await createDriverPayment(selectedDriverForPayments.id, amount);
        const newBalance = Math.max(0, Number(selectedDriverForPayments.pendingBalance ?? 0) - amount);

        setDrivers((current) =>
            current.map((driver) =>
                driver.id === selectedDriverForPayments.id
                    ? {
                        ...driver,
                        pendingBalance: newBalance,
                    }
                    : driver,
            ),
        );

        setSelectedDriverForPayments((current) => {
            if (!current) return current;

            return {
                ...current,
                pendingBalance: newBalance,
            };
        });

        setPaymentHistory((current) => [payment, ...current]);

        // Mostrar notificación
        if (newBalance === 0) {
            setToast({
                message: `¡Excelente! Se ha pagado el salario completo de ${selectedDriverForPayments.fullName}. El saldo ha sido completado exitosamente.`,
                type: 'success',
            });
        } else {
            setToast({
                message: `Abono registrado exitosamente. Saldo pendiente: $${newBalance.toLocaleString('es-CO')}`,
                type: 'success',
            });
        }
    };

    const handleResetDriverMonth = async (driverId: number) => {
        try {
            const updated = await resetDriverPaymentMonth(driverId);
            await loadDrivers();

            if (selectedDriverForPayments?.id === driverId && isHistoryModalOpen) {
                const history = await fetchDriverPaymentHistory(driverId);
                setPaymentHistory(history);
            }

            if (updated > 0) {
                setToast({
                    message: `Nuevo período mensual iniciado. ${updated} abono(s) del mes anterior fueron cerrados.`,
                    type: 'info',
                });
            } else {
                setToast({
                    message: 'No había abonos activos para cerrar. Ya puedes registrar abonos del nuevo mes.',
                    type: 'info',
                });
            }
        } catch (resetError) {
            console.error('Error resetting driver month:', resetError);
            setToast({
                message: 'No se pudo iniciar el nuevo mes del conductor.',
                type: 'error',
            });
        }
    };

    const confirmDeleteDriver = async () => {
        if (!driverToDelete) return;

        setIsDeleting(true);
        try {
            await deleteDriver(driverToDelete.id);
            await loadDrivers();
            setIsDeleteModalOpen(false);
            setDriverToDelete(null);
        } catch (err) {
            console.error('Error deleting driver:', err);
            setError(err instanceof Error ? err.message : 'Error al eliminar el conductor');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <section className="space-y-4">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-[15px] font-semibold tracking-tight text-[#0f1f47]">
                        Gestión de Conductores
                    </h1>
                    <p className="mt-1 text-[12px] font-normal italic text-slate-400">⚡ {suggestion}</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`rounded-md p-1.5 transition ${viewMode === 'grid' ? 'bg-indigo-50 text-[#5848f4]' : 'text-slate-400 hover:bg-slate-50'
                                }`}
                            aria-label="Grid view"
                        >
                            <MdGridView size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`rounded-md p-1.5 transition ${viewMode === 'list' ? 'bg-indigo-50 text-[#5848f4]' : 'text-slate-400 hover:bg-slate-50'
                                }`}
                            aria-label="List view"
                        >
                            <MdViewList size={16} />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateDriver}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#5848f4] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-95"
                    >
                        <MdAdd size={16} />
                        Nuevo Conductor
                    </button>
                </div>
            </header>

            {isLoading && (
                <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-16">
                    <div className="space-y-2 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#5848f4]" />
                        <p className="text-sm text-slate-500">Cargando conductores...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                    <p className="font-semibold">Error al cargar conductores</p>
                    <p className="mt-1">{error}</p>
                </div>
            )}

            {!isLoading && !error && drivers.length === 0 && (
                <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-16">
                    <p className="text-sm text-slate-500">No hay conductores registrados</p>
                </div>
            )}

            {!isLoading && !error && drivers.length > 0 && filteredDrivers.length === 0 && (
                <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-16">
                    <p className="text-sm text-slate-500">No hay resultados para “{searchParams.get('q')}”</p>
                </div>
            )}

            {!isLoading && !error && filteredDrivers.length > 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredDrivers.map((driver) => (
                        <DriverCard
                            key={driver.id}
                            id={driver.id}
                            fullName={driver.fullName}
                            email={driver.email}
                            monthlySalary={Number(driver.monthlySalary ?? 0)}
                            pendingBalance={Number(driver.pendingBalance ?? 0)}
                            assignedVehiclePlate={driver.assignedVehiclePlate}
                            isActive={driver.isActive}
                            onEdit={handleEditDriver}
                            onDelete={handleDeleteDriver}
                            onPay={handleOpenPayModal}
                            onViewHistory={handleOpenHistoryModal}
                            onResetMonth={handleResetDriverMonth}
                        />
                    ))}
                </div>
            )}

            {!isLoading && !error && filteredDrivers.length > 0 && viewMode === 'list' && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <table className="w-full table-fixed">
                        <thead className="border-b border-slate-200 bg-slate-50/80">
                            <tr className="text-left text-[12px] uppercase tracking-wide text-slate-500">
                                <th className="px-6 py-4 font-semibold">Nombre / Email</th>
                                <th className="px-6 py-4 font-semibold">Vehículo</th>
                                <th className="px-6 py-4 font-semibold">Salario</th>
                                <th className="px-6 py-4 font-semibold">Pendiente</th>
                                <th className="px-6 py-4 font-semibold">Estado</th>
                                <th className="px-6 py-4 font-semibold">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredDrivers.map((driver) => (
                                <tr key={driver.id} className="border-b border-slate-100 last:border-b-0">
                                    <td className="px-6 py-4">
                                        <p className="text-[16px] font-semibold leading-tight text-slate-900">{driver.fullName}</p>
                                        <p className="mt-1 text-[13px] text-slate-400">{driver.email}</p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="inline-flex rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                                            {driver.assignedVehiclePlate ?? 'N/A'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-[16px] font-semibold text-slate-700">
                                        ${Number(driver.monthlySalary ?? 0).toLocaleString('en-US')}
                                    </td>

                                    <td className={`px-6 py-4 text-[16px] font-semibold ${Number(driver.pendingBalance ?? 0) === 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        ${Number(driver.pendingBalance ?? 0).toLocaleString('en-US')}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${driver.isActive
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {driver.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {Number(driver.pendingBalance ?? 0) === 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleResetDriverMonth(driver.id)}
                                                    className="rounded-md px-2.5 py-1 text-[11px] font-bold text-[#5848f4] transition hover:bg-indigo-100 hover:text-indigo-700"
                                                    aria-label="Iniciar nuevo mes"
                                                >
                                                    NUEVO MES
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenPayModal(driver.id)}
                                                    className="rounded-md px-2.5 py-1 text-[11px] font-bold text-[#5848f4] transition hover:bg-indigo-100 hover:text-indigo-700"
                                                    aria-label="Abonar salario"
                                                >
                                                    ABONAR
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleEditDriver(driver.id)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#5848f4] hover:opacity-90"
                                                aria-label="Editar conductor"
                                            >
                                                <MdEdit size={14} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteDriver(driver.id)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                                                aria-label="Eliminar conductor"
                                            >
                                                <MdDeleteOutline size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <DriverModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDriver}
                mode={modalMode}
                driver={selectedDriver}
                vehicles={vehicleOptions}
            />

            <DeleteDriverModal
                isOpen={isDeleteModalOpen}
                driverName={driverToDelete?.fullName}
                onClose={() => {
                    if (isDeleting) return;
                    setIsDeleteModalOpen(false);
                    setDriverToDelete(null);
                }}
                onConfirm={confirmDeleteDriver}
                isDeleting={isDeleting}
            />

            <DriverPaymentModal
                isOpen={isPaymentModalOpen}
                driverName={selectedDriverForPayments?.fullName ?? ''}
                pendingBalance={Number(selectedDriverForPayments?.pendingBalance ?? 0)}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handleConfirmPayment}
            />

            <DriverPaymentHistoryModal
                isOpen={isHistoryModalOpen}
                driverName={selectedDriverForPayments?.fullName ?? ''}
                payments={paymentHistory}
                isLoading={isLoadingHistory}
                onClose={() => setIsHistoryModalOpen(false)}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={5000}
                    onClose={() => setToast(null)}
                />
            )}
        </section>
    );
}
