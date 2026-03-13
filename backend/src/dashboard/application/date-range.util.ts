interface WeekSlot {
    label: string;
    dateKey: string;
}

export function getMonthRange(referenceDate: Date): { start: Date; end: Date } {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
    return { start, end };
}

export function calculateTrend(current: number, previous: number): number {
    if (previous === 0) {
        return current === 0 ? 0 : 100;
    }

    return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function toLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getLast7DaysSlots(referenceDate = new Date()): {
    start: Date;
    end: Date;
    slots: WeekSlot[];
} {
    const end = new Date(referenceDate);
    end.setHours(23, 59, 59, 999);

    const start = new Date(referenceDate);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const slots: WeekSlot[] = [];

    for (let index = 0; index < 7; index++) {
        const current = new Date(start);
        current.setDate(start.getDate() + index);

        slots.push({
            label: dayLabels[current.getDay()],
            dateKey: toLocalDateKey(current),
        });
    }

    return { start, end, slots };
}
