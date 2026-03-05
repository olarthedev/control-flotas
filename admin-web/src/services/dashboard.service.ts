import axios from 'axios';
import { apiConfig } from '../config/api';

export interface DashboardSummary {
    totalConsigned: number;
    totalApproved: number;
    balance: number;
    pendingCount: number;
    trends: {
        consigned: number;
        approved: number;
    };
}

/**
 * IMPORTANTE: Este endpoint debe ser implementado en el backend.
 * El frontend NO debe hacer cálculos complejos de negocio.
 * 
 * El backend debe retornar este resumen pre-calculado considerando:
 * - Todas las consignaciones activas (ACTIVE status)
 * - Todos los gastos aprobados del mes actual
 * - El balance = consignado - aprobado
 * - El conteo de gastos pendientes
 * - Las tendencias comparadas con el mes anterior
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
    try {
        const { data } = await axios.get<DashboardSummary>(
            `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.DASHBOARD_SUMMARY}`
        );
        return data;
    } catch (error) {
        // TODO: Implementar endpoint en backend
        console.warn('Dashboard summary endpoint not yet implemented. Returning mock data.');

        // Retornar valores por defecto mientras el backend implementa el endpoint
        return {
            totalConsigned: 0,
            totalApproved: 0,
            balance: 0,
            pendingCount: 0,
            trends: {
                consigned: 0,
                approved: 0,
            },
        };
    }
}
