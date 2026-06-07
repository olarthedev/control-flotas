import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';
import type { WeeklyTrendPoint } from '../../services/dashboard.service';

interface WeeklyTrendChartProps {
    data: WeeklyTrendPoint[];
}

function formatMillions(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
}

function formatFull(value: number): string {
    return `$${Math.round(value).toLocaleString('es-CO')}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-xl border bg-white px-4 py-3"
            style={{
                borderColor: 'var(--card-border)',
                boxShadow: '0 8px 24px rgba(0,0,0,.10)',
                fontSize: '12px',
            }}
        >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
            {payload.map((entry: any) => (
                <div key={entry.dataKey} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                    <span className="font-medium text-gray-600">{entry.name}:</span>
                    <span className="font-bold text-gray-900">{formatFull(entry.value)}</span>
                </div>
            ))}
        </div>
    );
};

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
    const hasData = data.some(d => d.consignado > 0 || d.gastos > 0);

    return (
        <section
            className="flex h-full w-full flex-col rounded-2xl border bg-white p-5"
            style={{
                borderColor: 'var(--card-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)',
            }}
        >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between">
                <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                        Tendencia semanal
                    </p>
                    <h2 className="mt-0.5 text-[15px] font-semibold text-gray-900">
                        Consignado vs. gastado
                    </h2>
                </div>
                <div className="flex items-center gap-4 text-[12px] font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#5B5CEB]" />
                        Consignado
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#E05A5A]" />
                        Gastado
                    </span>
                </div>
            </div>

            {!hasData ? (
                <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                    <p className="text-[12px] text-gray-400">Sin movimientos esta semana</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="grad-consignado" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#5B5CEB" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#5B5CEB" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="grad-gastos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#E05A5A" stopOpacity={0.14} />
                                <stop offset="95%" stopColor="#E05A5A" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--card-border)" strokeDasharray="0" vertical={false} />
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            dy={8}
                        />
                        <YAxis
                            width={60}
                            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => formatMillions(v as number)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="consignado"
                            name="Consignado"
                            stroke="#5B5CEB"
                            strokeWidth={2.2}
                            fill="url(#grad-consignado)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#5B5CEB', strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="gastos"
                            name="Gastado"
                            stroke="#E05A5A"
                            strokeWidth={2}
                            fill="url(#grad-gastos)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#E05A5A', strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </section>
    );
}
