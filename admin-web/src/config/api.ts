/**
 * Configuración centralizada de API
 * IMPORTANTE: No guardar secretos, API keys, o passwords aquí
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 30000; // 30 segundos

export const apiConfig = {
    BASE_URL: API_BASE_URL,
    TIMEOUT: API_TIMEOUT,
    ENDPOINTS: {
        // Expenses
        EXPENSES: '/expenses',
        EXPENSES_PENDING: '/expenses/pending',
        EXPENSES_BY_VEHICLE: (vehicleId: number) => `/expenses/vehicle/${vehicleId}`,
        EXPENSES_BY_DRIVER: (driverId: number) => `/expenses/driver/${driverId}`,
        EXPENSES_SUMMARY_BY_VEHICLE: '/expenses/summary/by-vehicle',
        EXPENSES_DRIVER_LIQUIDATION: (driverId: number) => `/expenses/liquidation/driver/${driverId}`,

        // Vehicles
        VEHICLES: '/vehicles',
        VEHICLES_BY_ID: (id: number) => `/vehicles/${id}`,

        // Drivers
        DRIVERS: '/drivers',
        DRIVERS_BY_ID: (id: number) => `/drivers/${id}`,
        DRIVERS_PAYMENTS: (driverId: number) => `/consignments/driver/${driverId}`,

        // Consignments
        CONSIGNMENTS: '/consignments',
        CONSIGNMENTS_BY_DRIVER: (driverId: number) => `/consignments/driver/${driverId}`,

        // Dashboard
        DASHBOARD_SUMMARY: '/dashboard/summary',
        DASHBOARD_WEEKLY_TREND: '/dashboard/weekly-trend',
        DASHBOARD_EXPENSE_DISTRIBUTION: '/dashboard/expense-distribution',

        // Maintenance
        MAINTENANCE: '/maintenance',
        MAINTENANCE_BY_ID: (id: number) => `/maintenance/${id}`,
        MAINTENANCE_PENDING: '/maintenance/pending',
        MAINTENANCE_BY_VEHICLE: (vehicleId: number) => `/maintenance/vehicle/${vehicleId}`,
        MAINTENANCE_COMPLETE: (id: number) => `/maintenance/${id}/complete`,
    },
};

export default apiConfig;
