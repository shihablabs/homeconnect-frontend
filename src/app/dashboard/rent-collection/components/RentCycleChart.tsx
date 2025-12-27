'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface RentCycleChartProps {
  totalExpected: number;
  totalCollected: number;
}

export function RentCycleChart({ totalExpected, totalCollected }: RentCycleChartProps) {
  const pending = Math.max(0, totalExpected - totalCollected);
  const percentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const data = [
    { name: 'Collected', value: totalCollected, color: '#22c55e' }, // green-500
    { name: 'Pending', value: pending, color: '#f59e0b' }, // amber-500
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Rent Cycle Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[200px] flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <span className="text-3xl font-bold">{percentage}%</span>
          <span className="text-xs text-muted-foreground">Collected</span>
        </div>
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
              stroke="none"
              cornerRadius={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `৳${value.toLocaleString()}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
