import axios from 'axios';
import type { ExpenseItem } from './expenses.service';

const API_BASE_URL = 'http://localhost:3001';

export interface VehicleExpenseSummary {
    vehicleId: number;
    licensePlate: string;
    brand: string;
    model: string;
    driverId: number;
    driverName: string;
    totalExpenses: number;
    monthlyTotal: number;
    pendingCount: number;
    approvedCount: number;
    observedCount: number;
    rejectedCount: number;
    lastExpenseDate: string | null;
}

export interface VehicleExpensesDetail {
    vehicle: {
        id: number;
        licensePlate: string;
        brand: string;
        model: string;
    };
    driver: {
        id: number;
        fullName: string;
    };
    expenses: ExpenseItem[];
}

export async function fetchExpensesGroupedByVehicle(): Promise<VehicleExpenseSummary[]> {
    try {
        const { data: allExpenses } = await axios.get<any[]>(`${API_BASE_URL}/expenses`);

        // Agrupar gastos por vehículo
        const vehicleMap = new Map<number, VehicleExpenseSummary>();
        const currentMonth = new Date();
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

        allExpenses.forEach((expense) => {
            const vehicleId = expense.vehicle?.id || -1;
            if (vehicleId === -1) return; // Skip expenses without vehicle

            if (!vehicleMap.has(vehicleId)) {
                vehicleMap.set(vehicleId, {
                    vehicleId,
                    licensePlate: expense.vehicle.licensePlate,
                    brand: expense.vehicle.brand || 'N/A',
                    model: expense.vehicle.model || 'N/A',
                    driverId: expense.driver.id,
                    driverName: expense.driver.fullName,
                    totalExpenses: 0,
                    monthlyTotal: 0,
                    pendingCount: 0,
                    approvedCount: 0,
                    observedCount: 0,
                    rejectedCount: 0,
                    lastExpenseDate: null,
                });
            }

            const summary = vehicleMap.get(vehicleId)!;
            const expenseAmount = Number(expense.amount || 0);
            const expenseDate = new Date(expense.expenseDate);

            summary.totalExpenses += expenseAmount;

            if (expenseDate >= firstDayOfMonth) {
                summary.monthlyTotal += expenseAmount;
            }

            if (expense.status === 'PENDING') summary.pendingCount++;
            else if (expense.status === 'APPROVED') summary.approvedCount++;
            else if (expense.status === 'OBSERVED') summary.observedCount++;
            else if (expense.status === 'REJECTED') summary.rejectedCount++;

            if (!summary.lastExpenseDate || expenseDate > new Date(summary.lastExpenseDate)) {
                summary.lastExpenseDate = expense.expenseDate;
            }
        });

        return Array.from(vehicleMap.values()).sort((a, b) => {
            const dateA = a.lastExpenseDate ? new Date(a.lastExpenseDate).getTime() : 0;
            const dateB = b.lastExpenseDate ? new Date(b.lastExpenseDate).getTime() : 0;
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching grouped expenses:', error);
        throw error;
    }
}

export async function fetchExpensesByVehicle(vehicleId: number): Promise<ExpenseItem[]> {
    try {
        const { data: allExpenses } = await axios.get<any[]>(`${API_BASE_URL}/expenses`);
        return allExpenses
            .filter((expense) => expense.vehicle?.id === vehicleId)
            .map((expense) => ({
                id: expense.id,
                type: expense.type,
                amount: Number(expense.amount || 0),
                expenseDate: expense.expenseDate,
                description: expense.description,
                notes: expense.notes,
                status: expense.status,
                rejectionReason: expense.rejectionReason,
                driver: expense.driver,
                vehicle: expense.vehicle,
                evidence: expense.evidence ?? [],
            }));
    } catch (error) {
        console.error('Error fetching expenses by vehicle:', error);
        throw error;
    }
}
