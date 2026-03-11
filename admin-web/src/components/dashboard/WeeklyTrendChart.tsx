import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { WeeklyTrendPoint } from '../../services/dashboard.service';

interface WeeklyTrendChartProps {
  data: WeeklyTrendPoint[];
}

function formatCompactCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`;
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const hasData = data.some((item) => item.consignado > 0 || item.gastos > 0);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Tendencia Semanal</h3>

      {!hasData ? (
        <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">Sin movimientos esta semana</p>
            <p className="text-xs text-slate-500">Cuando existan consignaciones o gastos, la tendencia se mostrara aqui.</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 8, right: 20, left: 12, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
            />
            <YAxis
              width={88}
              tickMargin={6}
              allowDecimals={false}
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
              tickFormatter={(value) => formatCompactCurrency(value as number)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              formatter={(value: number | string | undefined) => formatCompactCurrency(Number(value ?? 0))}
            />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="consignado"
              stroke="#4f46e5"
              dot={false}
              strokeWidth={2.5}
              name="CONSIGNADO"
            />
            <Line
              type="monotone"
              dataKey="gastos"
              stroke="#cbd5e1"
              dot={false}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              name="GASTOS"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
