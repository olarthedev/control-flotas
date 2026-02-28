import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'COMBUSTIBLE', value: 45, color: '#4f46e5' },
  { name: 'MANTENIMIENTO', value: 30, color: '#7c3aed' },
  { name: 'PEAJES', value: 25, color: '#8b5cf6' }
];

export function ExpenseDistributionChart() {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Distribución de Gastos</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="45%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
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
            formatter={(value) => `${value}%`}
          />
          <Legend 
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            wrapperStyle={{ paddingLeft: '12px', fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
