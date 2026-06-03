import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { ComponentType } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: ComponentType<{ size?: number; className?: string }>;
    badge?: string;
    badgeColor?: 'green' | 'red' | 'yellow';
    trend?: number;
    sparklineData?: { v: number }[];
    sparklineColor?: string;
    valueNote?: string;
}

const BADGE_STYLES: Record<string, string> = {
    green:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
    red:    'bg-red-50    text-red-600    border border-red-200',
    yellow: 'bg-amber-50  text-amber-700  border border-amber-200',
};

export function StatCard({
    title,
    value,
    icon: Icon,
    badge,
    badgeColor = 'green',
    trend,
    sparklineData,
    sparklineColor = '#5B5CEB',
    valueNote,
}: StatCardProps) {
    const trendPositive = (trend ?? 0) >= 0;
    const hasTrend = trend !== undefined;
    const hasSpark = sparklineData && sparklineData.length > 0;
    const gradientId = `sg_${title.replace(/[^a-zA-Z0-9]/g, '_')}`;

    return (
        <article
            className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5"
            style={{
                borderColor: '#ECECF3',
                boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)',
                minHeight: '128px',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-gray-400 leading-none">
                        {title}
                    </p>
                    <p className="mt-3 text-[28px] font-bold leading-none tracking-tight text-gray-900">
                        {value}
                    </p>
                </div>

                {hasSpark ? (
                    <div className="h-10 w-16 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklineData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={sparklineColor} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={sparklineColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="v"
                                    stroke={sparklineColor}
                                    strokeWidth={1.8}
                                    fill={`url(#${gradientId})`}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: 'rgba(91,92,235,0.10)' }}
                    >
                        <Icon size={17} className="text-[#5B5CEB]" />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center gap-2">
                {hasTrend && (
                    <div className={`inline-flex items-center gap-1 text-[12px] font-semibold ${trendPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trendPositive
                            ? <TrendingUp size={13} />
                            : <TrendingDown size={13} />
                        }
                        <span>{trendPositive ? '+' : ''}{trend}%</span>
                    </div>
                )}
                {hasTrend && (
                    <span className="text-[11px] text-gray-400">vs. semana previa</span>
                )}
                {badge && (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_STYLES[badgeColor]}`}>
                        {badge}
                    </span>
                )}
                {valueNote && !hasTrend && !badge && (
                    <span className="text-[11px] text-gray-400">{valueNote}</span>
                )}
            </div>
        </article>
    );
}
