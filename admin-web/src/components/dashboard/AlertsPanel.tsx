import { ShieldAlert, Activity, ReceiptText, Wrench, AlertTriangle } from 'lucide-react';
import type { ComponentType } from 'react';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface DashboardAlert {
    id: string;
    severity: AlertSeverity;
    title: string;
    description: string;
    iconType: 'shield' | 'activity' | 'receipt' | 'wrench' | 'alert';
}

interface AlertsPanelProps {
    alerts: DashboardAlert[];
}

const SEVERITY_COLORS: Record<AlertSeverity, { dot: string; iconBg: string; iconColor: string }> = {
    critical: { dot: '#DC2626', iconBg: '#FEF2F2', iconColor: '#DC2626' },
    high:     { dot: '#EA580C', iconBg: '#FFF7ED', iconColor: '#EA580C' },
    medium:   { dot: '#D97706', iconBg: '#FFFBEB', iconColor: '#D97706' },
    low:      { dot: '#059669', iconBg: '#ECFDF5', iconColor: '#059669' },
};

const ICONS: Record<string, ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
    shield:   ShieldAlert,
    activity: Activity,
    receipt:  ReceiptText,
    wrench:   Wrench,
    alert:    AlertTriangle,
};

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
    critical: 'crítica',
    high:     'alta',
    medium:   'media',
    low:      'baja',
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const highCount     = alerts.filter(a => a.severity === 'high').length;
    const urgentCount   = criticalCount + highCount;

    return (
        <section
            className="flex flex-col rounded-2xl border bg-white"
            style={{
                borderColor: '#ECECF3',
                boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between border-b px-5 py-4" style={{ borderColor: '#F3F4F6' }}>
                <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                        Alertas inteligentes
                    </p>
                    <h2 className="mt-0.5 text-[15px] font-semibold text-gray-900">
                        Requieren tu atención
                    </h2>
                </div>
                {urgentCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        {urgentCount} crítica{urgentCount !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Alert list */}
            <ul className="flex flex-col divide-y" style={{ borderColor: '#F9FAFB' }}>
                {alerts.length === 0 && (
                    <li className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                            <ShieldAlert size={18} className="text-emerald-500" />
                        </div>
                        <p className="text-[13px] font-medium text-gray-700">Todo en orden</p>
                        <p className="text-[12px] text-gray-400">No hay alertas activas en este momento.</p>
                    </li>
                )}
                {alerts.map((alert) => {
                    const colors = SEVERITY_COLORS[alert.severity];
                    const IconComp = ICONS[alert.iconType];
                    return (
                        <li key={alert.id} className="flex items-start gap-3.5 px-5 py-3.5 transition-colors hover:bg-gray-50/70">
                            <div
                                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                style={{ background: colors.iconBg }}
                            >
                                <IconComp size={15} style={{ color: colors.iconColor }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold text-gray-900 leading-snug">
                                    {alert.title}
                                </p>
                                <p className="mt-0.5 text-[12px] leading-relaxed text-gray-500">
                                    {alert.description}
                                </p>
                            </div>
                            <span
                                className="mt-1 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
                                style={{
                                    background: colors.iconBg,
                                    color: colors.iconColor,
                                }}
                            >
                                {SEVERITY_LABEL[alert.severity]}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
