import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { day: 'Lun', consignado: 45000, gastos: 28000 },
  { day: 'Mar', consignado: 52000, gastos: 31000 },
  { day: 'Mié', consignado: 48000, gastos: 29000 },
  { day: 'Jue', consignado: 61000, gastos: 35000 },
  { day: 'Vie', consignado: 55000, gastos: 32000 },
  { day: 'Sab', consignado: 67000, gastos: 38000 },
  { day: 'Dom', consignado: 72000, gastos: 41000 }
];

export function WeeklyTrendChart() {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Tendencia Semanal</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="day" 
            stroke="#9ca3af"
            style={{ fontSize: '11px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '11px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
            formatter={(value: any) => `$${((value as number) / 1000).toFixed(0)}k`}
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
    </div>
  );
}
