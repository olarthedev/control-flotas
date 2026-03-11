import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { ExpenseDistributionPoint } from '../../services/dashboard.service';

interface ExpenseDistributionChartProps {
  data: ExpenseDistributionPoint[];
}

const COLORS = ['#4f46e5', '#7c3aed', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f59e0b', '#f26419'];

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`;
}

export function ExpenseDistributionChart({ data }: ExpenseDistributionChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));

  const hasData = chartData.length > 0;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Distribución de Gastos</h3>
      {!hasData && (
        <p className="mb-4 text-xs text-slate-500">Aun no hay gastos aprobados este mes.</p>
      )}
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="45%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={2}
            dataKey="amount"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
            formatter={(value: number | string | undefined, _name, payload) => {
              const percentage = Number((payload as any)?.payload?.percentage ?? 0);
              return `${formatCurrency(Number(value ?? 0))} (${percentage}%)`;
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            wrapperStyle={{ paddingLeft: '12px', fontSize: '11px' }}
            formatter={(value, entry) => {
              const percentage = Number((entry?.payload as { percentage?: number })?.percentage ?? 0);
              return `${value} (${percentage}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
