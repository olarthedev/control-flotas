import axios from 'axios';
import { normalizeExpense, type ExpenseItem } from './expenses.service';
import { apiConfig } from '../config/api';

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

/**
 * Fetch ALL vehicles and join with expense/consignment data + driver assignments
 * This ensures all vehicles appear in the dropdown, even those without expenses
 */
export async function fetchAllVehiclesWithExpensesSummary(): Promise<VehicleExpenseSummary[]> {
    try {
        // Fetch all vehicles
        const vehiclesUrl = `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.VEHICLES}`;
        console.log('Fetching all vehicles from:', vehiclesUrl);

        const { data: allVehicles } = await axios.get<any[]>(vehiclesUrl);
        console.log('Vehicles fetched:', allVehicles?.length || 0);

        if (!allVehicles || allVehicles.length === 0) {
            console.log('No vehicles found');
            return [];
        }

        // Fetch all expenses
        const expensesUrl = `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES}`;
        const { data: allExpenses } = await axios.get<any[]>(expensesUrl);
        console.log('Expenses fetched:', allExpenses?.length || 0);

        // Fetch all drivers to map vehicle -> driver
        let driversByPlate = new Map<string, { id: number; name: string }>();
        try {
            const driversUrl = `${apiConfig.BASE_URL}/users/drivers/summary`;
            const { data: allDrivers } = await axios.get<any[]>(driversUrl);
            console.log('Drivers fetched:', allDrivers?.length || 0);

            // Create map: licensePlate -> driverId, driverName
            allDrivers.forEach((driver: any) => {
                if (driver.assignedVehiclePlate) {
                    driversByPlate.set(driver.assignedVehiclePlate, {
                        id: driver.id,
                        name: driver.fullName,
                    });
                }
            });
            console.log('Driver plate mapping:', driversByPlate.size);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            // Continue without driver info
        }

        // Create summary for each vehicle
        const currentMonth = new Date();
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

        const summaries = allVehicles.map((vehicle) => {
            // Get expenses for this vehicle
            const vehicleExpenses = (allExpenses || []).filter(
                (expense) => expense.vehicle?.id === vehicle.id
            );

            // Count expenses by status and sum amounts
            let totalExpenses = 0;
            let monthlyTotal = 0;
            let pendingCount = 0;
            let approvedCount = 0;
            let observedCount = 0;
            let rejectedCount = 0;
            let lastExpenseDate: string | null = null;

            vehicleExpenses.forEach((expense) => {
                const expenseAmount = Number(expense.amount || 0);
                const expenseDate = new Date(expense.expenseDate);

                totalExpenses += expenseAmount;

                if (expenseDate >= firstDayOfMonth) {
                    monthlyTotal += expenseAmount;
                }

                if (expense.status === 'PENDING') pendingCount++;
                else if (expense.status === 'APPROVED') approvedCount++;
                else if (expense.status === 'OBSERVED') observedCount++;
                else if (expense.status === 'REJECTED') rejectedCount++;

                if (!lastExpenseDate || expenseDate > new Date(lastExpenseDate)) {
                    lastExpenseDate = expense.expenseDate;
                }
            });

            return {
                vehicleId: vehicle.id,
                licensePlate: vehicle.licensePlate,
                brand: vehicle.brand || 'N/A',
                model: vehicle.model || 'N/A',
                driverId: -1, // Will be set from driver mapping or expenses
                driverName: 'Sin asignar',
                totalExpenses,
                monthlyTotal,
                pendingCount,
                approvedCount,
                observedCount,
                rejectedCount,
                lastExpenseDate,
            };
        });

        // Update driverId from driver assignments (first priority)
        summaries.forEach((summary) => {
            // First, try to get driver from our plate mapping
            const driverInfo = driversByPlate.get(summary.licensePlate);
            if (driverInfo) {
                summary.driverId = driverInfo.id;
                summary.driverName = driverInfo.name;
                return;
            }

            // Fallback: get from first available expense
            const vehicleExpense = (allExpenses || []).find(
                (expense) => expense.vehicle?.id === summary.vehicleId
            );
            if (vehicleExpense?.driver) {
                summary.driverId = vehicleExpense.driver.id;
                summary.driverName = vehicleExpense.driver.fullName || 'Sin asignar';
            }
        });

        // Sort by last expense date (vehicles with recent expenses first)
        const result = summaries.sort((a, b) => {
            const dateA = a.lastExpenseDate ? new Date(a.lastExpenseDate).getTime() : 0;
            const dateB = b.lastExpenseDate ? new Date(b.lastExpenseDate).getTime() : 0;
            // Most recent first, then by license plate
            if (dateB !== dateA) return dateB - dateA;
            return a.licensePlate.localeCompare(b.licensePlate);
        });

        console.log('Vehicle summaries created:', result.length);
        return result;
    } catch (error) {
        console.error('Error fetching vehicles with expenses:', error);
        if (axios.isAxiosError(error)) {
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
        }
        return [];
    }
}

/**
 * Legacy function - kept for compatibility
 * Use fetchAllVehiclesWithExpensesSummary() instead
 */
export async function fetchExpensesGroupedByVehicle(): Promise<VehicleExpenseSummary[]> {
    return fetchAllVehiclesWithExpensesSummary();
}

export async function fetchExpensesByVehicle(vehicleId: number): Promise<ExpenseItem[]> {
    try {
        const { data } = await axios.get<any[]>(
            `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES_BY_VEHICLE(vehicleId)}`,
        );
        return data.map(normalizeExpense);
    } catch (error) {
        console.error('Error fetching expenses by vehicle:', error);
        throw error;
    }
}
