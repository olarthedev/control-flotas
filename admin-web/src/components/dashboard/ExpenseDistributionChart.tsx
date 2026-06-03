import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { ExpenseDistributionPoint } from '../../services/dashboard.service';
import { formatCurrency } from '../../utils/format';

interface ExpenseDistributionChartProps {
    data: ExpenseDistributionPoint[];
    totalApproved?: number;
    approvedTrend?: number;
}

const PALETTE = ['#5B5CEB', '#7C3AED', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const LABEL_MAP: Record<string, string> = {
    fuel:        'Combustible',
    toll:        'Peajes',
    lodging:     'Hotel',
    food:        'Comida',
    parking:     'Parqueadero',
    maintenance: 'Mantenimiento',
    other:       'Otro',
};

export function ExpenseDistributionChart({ data, totalApproved, approvedTrend }: ExpenseDistributionChartProps) {
    const chartData = data.map((item, index) => ({
        ...item,
        displayName: LABEL_MAP[item.name] ?? item.name,
        color: PALETTE[index % PALETTE.length],
    }));

    const hasData = chartData.length > 0;
    const topItem = chartData[0];

    return (
        <section
            className="flex h-full w-full flex-col rounded-2xl border bg-white p-5"
            style={{
                borderColor: '#ECECF3',
                boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)',
            }}
        >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                        Distribución
                    </p>
                    <h2 className="mt-0.5 text-[15px] font-semibold text-gray-900">
                        Gastos por rubro
                    </h2>
                </div>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                    Esta semana
                </span>
            </div>

            {!hasData ? (
                <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                    <p className="text-[12px] text-gray-400">Sin gastos aprobados este período</p>
                </div>
            ) : (
                <>
                    {/* Donut + legend */}
                    <div className="flex items-center gap-4">
                        {/* Donut */}
                        <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%" cy="50%"
                                        innerRadius={46} outerRadius={66}
                                        paddingAngle={2}
                                        dataKey="amount"
                                        startAngle={90} endAngle={-270}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: '#fff',
                                            border: '1px solid #ECECF3',
                                            borderRadius: '10px',
                                            fontSize: '12px',
                                            boxShadow: '0 8px 24px rgba(0,0,0,.08)',
                                        }}
                                        formatter={(value: number | undefined, _n, payload) => {
                                            const pct = Number((payload as any)?.payload?.percentage ?? 0);
                                            return [`${formatCurrency(Number(value ?? 0))} (${pct}%)`, ''];
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center text */}
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[17px] font-bold leading-none text-gray-900">100%</span>
                                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400">del gasto</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <ul className="flex flex-1 flex-col gap-2">
                            {chartData.map((item) => (
                                <li key={item.name} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                                        <span className="truncate text-[12px] font-medium text-gray-600">
                                            {item.displayName}
                                        </span>
                                    </div>
                                    <span className="shrink-0 text-[12px] font-semibold text-gray-800">
                                        {item.percentage}%
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Bottom summary */}
                    {topItem && (
                        <div className="mt-4 flex items-end justify-between border-t pt-4" style={{ borderColor: '#F3F4F6' }}>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                                    Rubro principal
                                </p>
                                <div className="mt-1 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full" style={{ background: topItem.color }} />
                                    <span className="text-[13px] font-semibold text-gray-800">{topItem.displayName}</span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-gray-400">
                                    {topItem.percentage}% del total gastado
                                </p>
                            </div>
                            {totalApproved !== undefined && (
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                                        Total gastado
                                    </p>
                                    <p className="mt-1 text-[18px] font-bold leading-none text-gray-900">
                                        {formatCurrency(totalApproved)}
                                    </p>
                                    {approvedTrend !== undefined && (
                                        <p className={`mt-0.5 text-[11px] font-semibold ${approvedTrend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {approvedTrend >= 0 ? '▲' : '▼'} {Math.abs(approvedTrend)}% vs. previa
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
