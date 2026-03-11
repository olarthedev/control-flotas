import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MdBuild, MdCheckCircle, MdEdit, MdKeyboardArrowDown, MdOutlineDirectionsCar, MdSchedule, MdWarning } from 'react-icons/md';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Toast, type ToastType } from '../components/Toast';
import { fetchVehicles, type VehicleCardData } from '../services/vehicles.service';
import {
    completeMaintenanceRecord,
    createMaintenanceRecord,
    deleteMaintenanceRecord,
    fetchMaintenanceRecords,
    updateMaintenanceRecord,
    type MaintenanceRecord,
    type MaintenanceStatus,
    type MaintenanceType,
} from '../services/maintenance.service';

type TypeFilter = 'ALL' | MaintenanceType;
type StatusFilter = 'ALL' | MaintenanceStatus;

interface MaintenanceFormState {
    type: MaintenanceType;
    title: string;
    description: string;
    maintenanceDate: string;
    cost: string;
    vehicleId: string;
    invoiceNumber: string;
    provider: string;
    mileageAtMaintenance: string;
    nextMaintenanceMileage: string;
    nextMaintenanceDate: string;
    technicalNotes: string;
    status: MaintenanceStatus;
    requiresFollowUp: boolean;
    followUpNotes: string;
}

const TYPE_LABEL: Record<MaintenanceType, string> = {
    PREVENTIVE: 'Preventivo',
    CORRECTIVE: 'Correctivo',
    EMERGENCY: 'Emergencia',
    INSPECTION: 'Inspeccion',
};

const STATUS_LABEL: Record<MaintenanceStatus, string> = {
    COMPLETED: 'Completado',
    PENDING: 'Pendiente',
    SCHEDULED: 'Programado',
};

const STATUS_STYLES: Record<MaintenanceStatus, string> = {
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    SCHEDULED: 'bg-sky-50 text-sky-700 border-sky-200',
};

const EMPTY_FORM: MaintenanceFormState = {
    type: 'PREVENTIVE',
    title: '',
    description: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    cost: '',
    vehicleId: '',
    invoiceNumber: '',
    provider: '',
    mileageAtMaintenance: '',
    nextMaintenanceMileage: '',
    nextMaintenanceDate: '',
    technicalNotes: '',
    status: 'SCHEDULED',
    requiresFollowUp: false,
    followUpNotes: '',
};

function formatCurrency(value: number): string {
    return `$${Math.round(value).toLocaleString('es-CO')}`;
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }
    return new Date(value).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

function toIsoDay(value: string): string {
    return `${value}T00:00:00.000Z`;
}

function parseOptionalNumber(value: string): number | undefined {
    if (!value.trim()) {
        return undefined;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return undefined;
    }
    return numeric;
}

function toFormState(record: MaintenanceRecord): MaintenanceFormState {
    return {
        type: record.type,
        title: record.title,
        description: record.description,
        maintenanceDate: record.maintenanceDate.split('T')[0],
        cost: String(record.cost ?? ''),
        vehicleId: String(record.vehicle?.id ?? ''),
        invoiceNumber: record.invoiceNumber ?? '',
        provider: record.provider ?? '',
        mileageAtMaintenance: record.mileageAtMaintenance != null ? String(record.mileageAtMaintenance) : '',
        nextMaintenanceMileage: record.nextMaintenanceMileage != null ? String(record.nextMaintenanceMileage) : '',
        nextMaintenanceDate: record.nextMaintenanceDate ? record.nextMaintenanceDate.split('T')[0] : '',
        technicalNotes: record.technicalNotes ?? '',
        status: record.status,
        requiresFollowUp: record.requiresFollowUp,
        followUpNotes: record.followUpNotes ?? '',
    };
}

interface MaintenanceFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    form: MaintenanceFormState;
    vehicles: VehicleCardData[];
    isSubmitting: boolean;
    onChange: (next: MaintenanceFormState) => void;
    onClose: () => void;
    onSubmit: () => void;
}

function MaintenanceFormModal({
    isOpen,
    mode,
    form,
    vehicles,
    isSubmitting,
    onChange,
    onClose,
    onSubmit,
}: MaintenanceFormModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/45" onClick={onClose} />
            <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {mode === 'create' ? 'Nuevo registro' : 'Editar registro'}
                        </p>
                        <h3 className="text-lg font-semibold text-[#12264f]">Mantenimiento de vehiculo</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
                    >
                        Cerrar
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Tipo</span>
                            <select
                                value={form.type}
                                onChange={(event) => onChange({ ...form, type: event.target.value as MaintenanceType })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                                {Object.entries(TYPE_LABEL).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Vehiculo</span>
                            <select
                                value={form.vehicleId}
                                onChange={(event) => onChange({ ...form, vehicleId: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                                <option value="">Selecciona un vehiculo</option>
                                {vehicles.map((vehicle) => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.plate} - {vehicle.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-1 md:col-span-2">
                            <span className="text-xs font-semibold text-slate-500">Titulo del servicio</span>
                            <input
                                value={form.title}
                                onChange={(event) => onChange({ ...form, title: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Ej: Cambio de aceite y filtro"
                            />
                        </label>

                        <label className="space-y-1 md:col-span-2">
                            <span className="text-xs font-semibold text-slate-500">Descripcion</span>
                            <textarea
                                value={form.description}
                                onChange={(event) => onChange({ ...form, description: event.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Que se hizo, por que se hizo y observaciones clave"
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Fecha mantenimiento</span>
                            <input
                                type="date"
                                value={form.maintenanceDate}
                                onChange={(event) => onChange({ ...form, maintenanceDate: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Costo</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.cost}
                                onChange={(event) => onChange({ ...form, cost: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                placeholder="0"
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Proveedor</span>
                            <input
                                value={form.provider}
                                onChange={(event) => onChange({ ...form, provider: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Taller o proveedor"
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Factura</span>
                            <input
                                value={form.invoiceNumber}
                                onChange={(event) => onChange({ ...form, invoiceNumber: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Numero de factura"
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Kilometraje actual</span>
                            <input
                                type="number"
                                min="0"
                                value={form.mileageAtMaintenance}
                                onChange={(event) => onChange({ ...form, mileageAtMaintenance: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Proximo kilometraje</span>
                            <input
                                type="number"
                                min="0"
                                value={form.nextMaintenanceMileage}
                                onChange={(event) => onChange({ ...form, nextMaintenanceMileage: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Proxima fecha</span>
                            <input
                                type="date"
                                value={form.nextMaintenanceDate}
                                onChange={(event) => onChange({ ...form, nextMaintenanceDate: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Estado</span>
                            <select
                                value={form.status}
                                onChange={(event) => onChange({ ...form, status: event.target.value as MaintenanceStatus })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-1 md:col-span-2">
                            <span className="text-xs font-semibold text-slate-500">Notas tecnicas</span>
                            <textarea
                                value={form.technicalNotes}
                                onChange={(event) => onChange({ ...form, technicalNotes: event.target.value })}
                                rows={2}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="md:col-span-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                            <input
                                type="checkbox"
                                checked={form.requiresFollowUp}
                                onChange={(event) => onChange({ ...form, requiresFollowUp: event.target.checked })}
                                className="h-4 w-4 rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-700">Requiere seguimiento posterior</span>
                        </label>

                        {form.requiresFollowUp && (
                            <label className="space-y-1 md:col-span-2">
                                <span className="text-xs font-semibold text-slate-500">Notas de seguimiento</span>
                                <textarea
                                    value={form.followUpNotes}
                                    onChange={(event) => onChange({ ...form, followUpNotes: event.target.value })}
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    placeholder="Que revisar en el siguiente control"
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="rounded-lg bg-[#5848f4] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                    >
                        {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear registro' : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function MaintenancePage() {
    const [searchParams] = useSearchParams();
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [vehicles, setVehicles] = useState<VehicleCardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const [selectedType, setSelectedType] = useState<TypeFilter>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | 'ALL'>('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
    const [form, setForm] = useState<MaintenanceFormState>(EMPTY_FORM);

    const searchTerm = (searchParams.get('q') ?? '').trim().toLowerCase();

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [maintenanceData, vehicleData] = await Promise.all([
                fetchMaintenanceRecords(),
                fetchVehicles(),
            ]);

            const sorted = [...maintenanceData].sort(
                (a, b) => new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime(),
            );

            setRecords(sorted);
            setVehicles(vehicleData);
            setError(null);
        } catch (requestError) {
            console.error('Error loading maintenance page:', requestError);
            setError('No se pudo cargar la informacion de mantenimiento.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredRecords = useMemo(() => {
        return records.filter((record) => {
            const byType = selectedType === 'ALL' || record.type === selectedType;
            const byStatus = selectedStatus === 'ALL' || record.status === selectedStatus;
            const byVehicle = selectedVehicleId === 'ALL' || record.vehicle?.id === selectedVehicleId;

            const text = [
                record.title,
                record.description,
                record.provider ?? '',
                record.vehicle?.licensePlate ?? '',
                `${record.vehicle?.brand ?? ''} ${record.vehicle?.model ?? ''}`,
            ]
                .join(' ')
                .toLowerCase();

            const bySearch = !searchTerm || text.includes(searchTerm);

            return byType && byStatus && byVehicle && bySearch;
        });
    }, [records, selectedType, selectedStatus, selectedVehicleId, searchTerm]);

    const summary = useMemo(() => {
        const totalCost = filteredRecords.reduce((acc, item) => acc + item.cost, 0);
        const pendingCount = filteredRecords.filter((item) => item.status === 'PENDING').length;
        const scheduledCount = filteredRecords.filter((item) => item.status === 'SCHEDULED').length;

        const now = new Date();
        const futureLimit = new Date();
        futureLimit.setDate(futureLimit.getDate() + 30);

        const dueSoon = filteredRecords.filter((item) => {
            if (!item.nextMaintenanceDate) {
                return false;
            }
            const nextDate = new Date(item.nextMaintenanceDate);
            return nextDate >= now && nextDate <= futureLimit;
        }).length;

        return {
            totalCost,
            pendingCount,
            scheduledCount,
            dueSoon,
        };
    }, [filteredRecords]);

    const openCreateModal = () => {
        setModalMode('create');
        setEditingRecordId(null);
        setForm(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const openEditModal = (record: MaintenanceRecord) => {
        setModalMode('edit');
        setEditingRecordId(record.id);
        setForm(toFormState(record));
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (isSubmitting) {
            return;
        }
        setIsModalOpen(false);
    };

    const submitForm = async () => {
        const vehicleId = Number(form.vehicleId);
        const cost = Number(form.cost);

        if (!form.title.trim() || !form.description.trim() || !form.maintenanceDate || Number.isNaN(vehicleId) || Number.isNaN(cost) || cost <= 0) {
            setToast({
                type: 'warning',
                message: 'Completa los campos obligatorios: vehiculo, titulo, descripcion, fecha y costo.',
            });
            return;
        }

        if (form.title.trim().length < 3 || form.description.trim().length < 10) {
            setToast({
                type: 'warning',
                message: 'El titulo debe tener minimo 3 caracteres y la descripcion minimo 10.',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            if (modalMode === 'create') {
                const created = await createMaintenanceRecord({
                    type: form.type,
                    title: form.title.trim(),
                    description: form.description.trim(),
                    maintenanceDate: toIsoDay(form.maintenanceDate),
                    cost,
                    vehicleId,
                    invoiceNumber: form.invoiceNumber.trim() || undefined,
                    provider: form.provider.trim() || undefined,
                    mileageAtMaintenance: parseOptionalNumber(form.mileageAtMaintenance),
                    nextMaintenanceMileage: parseOptionalNumber(form.nextMaintenanceMileage),
                    nextMaintenanceDate: form.nextMaintenanceDate ? toIsoDay(form.nextMaintenanceDate) : undefined,
                    technicalNotes: form.technicalNotes.trim() || undefined,
                });

                const recordWithStatus =
                    form.status !== 'COMPLETED' || form.requiresFollowUp || form.followUpNotes.trim()
                        ? await updateMaintenanceRecord(created.id, {
                            status: form.status,
                            requiresFollowUp: form.requiresFollowUp,
                            followUpNotes: form.followUpNotes.trim() || undefined,
                        })
                        : created;

                setRecords((current) => [recordWithStatus, ...current]);
                setToast({ type: 'success', message: 'Registro de mantenimiento creado correctamente.' });
            } else {
                if (!editingRecordId) {
                    return;
                }

                const updated = await updateMaintenanceRecord(editingRecordId, {
                    type: form.type,
                    title: form.title.trim(),
                    description: form.description.trim(),
                    maintenanceDate: toIsoDay(form.maintenanceDate),
                    cost,
                    vehicleId,
                    invoiceNumber: form.invoiceNumber.trim() || undefined,
                    provider: form.provider.trim() || undefined,
                    mileageAtMaintenance: parseOptionalNumber(form.mileageAtMaintenance),
                    nextMaintenanceMileage: parseOptionalNumber(form.nextMaintenanceMileage),
                    nextMaintenanceDate: form.nextMaintenanceDate ? toIsoDay(form.nextMaintenanceDate) : undefined,
                    technicalNotes: form.technicalNotes.trim() || undefined,
                    status: form.status,
                    requiresFollowUp: form.requiresFollowUp,
                    followUpNotes: form.followUpNotes.trim() || undefined,
                });

                setRecords((current) => current.map((item) => (item.id === updated.id ? updated : item)));
                setToast({ type: 'success', message: 'Registro actualizado correctamente.' });
            }

            setIsModalOpen(false);
        } catch (submitError) {
            console.error('Error saving maintenance record:', submitError);
            let message = 'No se pudo guardar el registro. Intenta de nuevo.';
            if (axios.isAxiosError(submitError)) {
                const responseMessage = submitError.response?.data?.message;
                if (Array.isArray(responseMessage)) {
                    message = responseMessage[0] ?? message;
                } else if (typeof responseMessage === 'string') {
                    message = responseMessage;
                }
            }
            setToast({ type: 'error', message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleComplete = async (recordId: number) => {
        try {
            const updated = await completeMaintenanceRecord(recordId);
            setRecords((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            setToast({ type: 'success', message: 'Mantenimiento marcado como completado.' });
        } catch (completeError) {
            console.error('Error completing maintenance record:', completeError);
            setToast({ type: 'error', message: 'No se pudo completar el mantenimiento.' });
        }
    };

    const handleDelete = async (record: MaintenanceRecord) => {
        const confirmed = window.confirm(`Eliminar el mantenimiento "${record.title}" del vehiculo ${record.vehicle?.licensePlate}?`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteMaintenanceRecord(record.id);
            setRecords((current) => current.filter((item) => item.id !== record.id));
            setToast({ type: 'success', message: 'Registro eliminado correctamente.' });
        } catch (deleteError) {
            console.error('Error deleting maintenance record:', deleteError);
            setToast({ type: 'error', message: 'No se pudo eliminar el registro.' });
        }
    };

    return (
        <section className="space-y-5">
            <PageHeader
                breadcrumbs={[
                    { label: 'Inicio', to: '/' },
                    { label: 'Mantenimiento', to: '/maintenance' },
                    { label: 'Control tecnico' },
                ]}
                title="Control de mantenimiento"
                subtitle="Registra intervenciones, programa proximos servicios y lleva trazabilidad completa de costos por vehiculo para operar con menos paradas y mas control."
                actions={
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#5848f4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                    >
                        <MdBuild size={16} />
                        Nuevo mantenimiento
                    </button>
                }
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Costo total</p>
                    <p className="mt-2 text-2xl font-semibold text-[#12264f]">{formatCurrency(summary.totalCost)}</p>
                    <p className="mt-1 text-xs text-slate-500">Filtrado actual</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Pendientes</p>
                    <p className="mt-2 text-2xl font-semibold text-amber-600">{summary.pendingCount}</p>
                    <p className="mt-1 text-xs text-slate-500">Requieren accion</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Programados</p>
                    <p className="mt-2 text-2xl font-semibold text-sky-600">{summary.scheduledCount}</p>
                    <p className="mt-1 text-xs text-slate-500">Planificados</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Proximos 30 dias</p>
                    <p className="mt-2 text-2xl font-semibold text-[#12264f]">{summary.dueSoon}</p>
                    <p className="mt-1 text-xs text-slate-500">Con fecha proxima</p>
                </article>
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
                <label className="relative">
                    <span className="pointer-events-none absolute left-3 top-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Tipo</span>
                    <select
                        value={selectedType}
                        onChange={(event) => setSelectedType(event.target.value as TypeFilter)}
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pb-2 pt-6 pr-8 text-sm font-medium text-slate-700"
                    >
                        <option value="ALL">Todos</option>
                        {Object.entries(TYPE_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <MdKeyboardArrowDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </label>

                <label className="relative">
                    <span className="pointer-events-none absolute left-3 top-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Estado</span>
                    <select
                        value={selectedStatus}
                        onChange={(event) => setSelectedStatus(event.target.value as StatusFilter)}
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pb-2 pt-6 pr-8 text-sm font-medium text-slate-700"
                    >
                        <option value="ALL">Todos</option>
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <MdKeyboardArrowDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </label>

                <label className="relative">
                    <span className="pointer-events-none absolute left-3 top-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Vehiculo</span>
                    <select
                        value={selectedVehicleId}
                        onChange={(event) => {
                            if (event.target.value === 'ALL') {
                                setSelectedVehicleId('ALL');
                                return;
                            }
                            setSelectedVehicleId(Number(event.target.value));
                        }}
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pb-2 pt-6 pr-8 text-sm font-medium text-slate-700"
                    >
                        <option value="ALL">Todos</option>
                        {vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.plate} - {vehicle.name}
                            </option>
                        ))}
                    </select>
                    <MdKeyboardArrowDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </label>

                <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
                    <p className="font-semibold">Guia rapida</p>
                    <p className="mt-1">Registra cada servicio y usa estado Programado para pendientes futuros.</p>
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-16">
                    <div className="space-y-2 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#5848f4]" />
                        <p className="text-sm text-slate-500">Cargando mantenimiento...</p>
                    </div>
                </div>
            )}

            {!isLoading && error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                    <p className="font-semibold">Error de carga</p>
                    <p className="mt-1">{error}</p>
                </div>
            )}

            {!isLoading && !error && filteredRecords.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-12">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-slate-400">
                            <MdOutlineDirectionsCar size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-[#12264f]">Sin resultados de mantenimiento</h3>
                        <p className="text-sm text-slate-500">
                            Ajusta filtros o crea un nuevo registro para comenzar el historial tecnico.
                        </p>
                    </div>
                </div>
            )}

            {!isLoading && !error && filteredRecords.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">Fecha</th>
                                    <th className="px-4 py-3 text-left">Vehiculo</th>
                                    <th className="px-4 py-3 text-left">Servicio</th>
                                    <th className="px-4 py-3 text-left">Tipo</th>
                                    <th className="px-4 py-3 text-left">Estado</th>
                                    <th className="px-4 py-3 text-left">Costo</th>
                                    <th className="px-4 py-3 text-left">Proximo</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="border-t border-slate-100 text-sm text-slate-700">
                                        <td className="px-4 py-3 font-semibold text-[#12264f]">{formatDate(record.maintenanceDate)}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-700">{record.vehicle?.licensePlate ?? '-'}</p>
                                            <p className="text-xs text-slate-500">{record.vehicle?.brand} {record.vehicle?.model}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-700">{record.title}</p>
                                            <p className="line-clamp-2 max-w-xs text-xs text-slate-500">{record.description}</p>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {TYPE_LABEL[record.type]}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[record.status]}`}>
                                                {record.status === 'COMPLETED' && <MdCheckCircle className="mr-1" size={14} />}
                                                {record.status === 'PENDING' && <MdWarning className="mr-1" size={14} />}
                                                {record.status === 'SCHEDULED' && <MdSchedule className="mr-1" size={14} />}
                                                {STATUS_LABEL[record.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-[#12264f]">{formatCurrency(record.cost)}</td>
                                        <td className="px-4 py-3 text-xs text-slate-600">
                                            <p>{formatDate(record.nextMaintenanceDate)}</p>
                                            {record.nextMaintenanceMileage != null && (
                                                <p className="text-slate-500">{record.nextMaintenanceMileage.toLocaleString('es-CO')} km</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(record)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                                >
                                                    <MdEdit size={14} />
                                                    Editar
                                                </button>
                                                {record.status !== 'COMPLETED' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleComplete(record.id)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                                    >
                                                        <MdCheckCircle size={14} />
                                                        Completar
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(record)}
                                                    className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <MaintenanceFormModal
                isOpen={isModalOpen}
                mode={modalMode}
                form={form}
                vehicles={vehicles}
                isSubmitting={isSubmitting}
                onChange={setForm}
                onClose={closeModal}
                onSubmit={submitForm}
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </section>
    );
}
