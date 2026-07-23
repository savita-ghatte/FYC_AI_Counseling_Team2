import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const ProbabilityChart = ({ safe, moderate, dream }: { safe: number, moderate: number, dream: number }) => {
  const data = [
    { name: 'Safe Matches', value: safe, color: '#10B981' }, // Emerald
    { name: 'Moderate Matches', value: moderate, color: '#F59E0B' }, // Amber
    { name: 'Dream Matches', value: dream, color: '#EF4444' }, // Red
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`${value} Colleges`, 'Count']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
