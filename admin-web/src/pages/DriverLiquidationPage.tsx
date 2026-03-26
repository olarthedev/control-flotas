import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdSearch } from 'react-icons/md';
import { PageHeader } from '../components/layout/PageHeader';
import { Toast, type ToastType } from '../components/Toast';
import { fetchDriverSummaries, type DriverSummary } from '../services/drivers.service';
import { fetchDriverLiquidation, type DriverLiquidationResponse } from '../services/expenses.service';
import { getApiErrorMessage } from '../utils/api-error';

function toDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
    const current = new Date(date);
    const day = current.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    current.setDate(current.getDate() + diff);
    current.setHours(0, 0, 0, 0);
    return current;
}

function endOfWeek(date: Date): Date {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}

function formatCurrency(value: number): string {
    return `$${Math.round(value).toLocaleString('es-CO')}`;
}

export function DriverLiquidationPage() {
    const [drivers, setDrivers] = useState<DriverSummary[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
    const [dateFrom, setDateFrom] = useState<string>(toDateInput(startOfWeek(new Date())));
    const [dateTo, setDateTo] = useState<string>(toDateInput(endOfWeek(new Date())));
    const [result, setResult] = useState<DriverLiquidationResponse | null>(null);
    const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
    const [isLoadingResult, setIsLoadingResult] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        const loadDrivers = async () => {
            try {
                setIsLoadingDrivers(true);
                const response = await fetchDriverSummaries();
                setDrivers(response);
                if (response.length > 0) {
                    setSelectedDriverId(response[0].id);
                }
            } catch (error) {
                setToast({
                    message: getApiErrorMessage(error, 'No se pudo cargar la lista de conductores.'),
                    type: 'error',
                });
            } finally {
                setIsLoadingDrivers(false);
            }
        };

        loadDrivers();
    }, []);

    const selectedDriver = useMemo(
        () => drivers.find((driver) => driver.id === selectedDriverId) ?? null,
        [drivers, selectedDriverId],
    );

    const handleSearch = async () => {
        if (!selectedDriverId) {
            setToast({
                message: 'Selecciona un conductor para calcular la liquidación.',
                type: 'warning',
            });
            return;
        }

        if (!dateFrom || !dateTo || new Date(dateFrom) > new Date(dateTo)) {
            setToast({
                message: 'El rango de fechas no es válido.',
                type: 'warning',
            });
            return;
        }

        try {
            setIsLoadingResult(true);
            const data = await fetchDriverLiquidation(
                selectedDriverId,
                new Date(`${dateFrom}T00:00:00`).toISOString(),
                new Date(`${dateTo}T23:59:59`).toISOString(),
            );
            setResult(data);
        } catch (error) {
            setToast({
                message: getApiErrorMessage(error, 'No se pudo calcular la liquidación del conductor.'),
                type: 'error',
            });
            setResult(null);
        } finally {
            setIsLoadingResult(false);
        }
    };

    return (
        <section className="space-y-4">
            <PageHeader
                breadcrumbs={[
                    { label: 'Inicio', to: '/' },
                    { label: 'Conductores', to: '/drivers' },
                    { label: 'Liquidación semanal' },
                ]}
                title="Liquidación de gastos por conductor"
                subtitle="Calcula la liquidación por rango de fechas y visualiza el desglose por cada furgón utilizado por el conductor en ese periodo."
                actions={(
                    <Link
                        to="/drivers"
                        className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Volver a conductores
                    </Link>
                )}
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Conductor</label>
                        <select
                            value={selectedDriverId ?? ''}
                            onChange={(event) => setSelectedDriverId(event.target.value ? Number(event.target.value) : null)}
                            disabled={isLoadingDrivers}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            {drivers.map((driver) => (
                                <option key={driver.id} value={driver.id}>{driver.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Desde</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(event) => setDateFrom(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Hasta</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(event) => setDateTo(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={isLoadingResult || isLoadingDrivers}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5848f4] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
                        >
                            <MdSearch size={16} />
                            {isLoadingResult ? 'Calculando...' : 'Calcular liquidación'}
                        </button>
                    </div>
                </div>
            </div>

            {selectedDriver && result && (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Conductor</p>
                            <h2 className="mt-2 text-xl font-semibold text-slate-900">{selectedDriver.fullName}</h2>
                            <p className="mt-1 text-sm text-slate-500">Periodo: {new Date(result.dateFrom).toLocaleDateString('es-CO')} - {new Date(result.dateTo).toLocaleDateString('es-CO')}</p>
                        </article>

                        <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                            <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">Total gastos del periodo</p>
                            <h2 className="mt-2 text-2xl font-semibold text-[#5848f4]">{formatCurrency(result.totalExpenses)}</h2>
                            <p className="mt-1 text-sm text-indigo-500">Suma de gastos en todos los furgones usados.</p>
                        </article>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                        <table className="w-full table-fixed">
                            <thead className="border-b border-slate-200 bg-slate-50/80">
                                <tr className="text-left text-[12px] uppercase tracking-wide text-slate-500">
                                    <th className="px-6 py-4 font-semibold">Furgón</th>
                                    <th className="px-6 py-4 font-semibold">Marca / Modelo</th>
                                    <th className="px-6 py-4 font-semibold text-right">Total gastos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.totalByVehicle.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-6 text-center text-sm text-slate-500">
                                            No hay gastos para este conductor en el rango seleccionado.
                                        </td>
                                    </tr>
                                )}

                                {result.totalByVehicle.map((item) => (
                                    <tr key={item.vehicleId} className="border-b border-slate-100 last:border-b-0">
                                        <td className="px-6 py-4 text-sm font-semibold text-[#5848f4]">{item.licensePlate}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.brand} {item.model}</td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">{formatCurrency(item.totalExpenses)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

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
