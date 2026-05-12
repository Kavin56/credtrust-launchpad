import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const monthlyData = [
  { month: 'Jan', amount: 45000 },
  { month: 'Feb', amount: 52000 },
  { month: 'Mar', amount: 48000 },
  { month: 'Apr', amount: 61000 },
  { month: 'May', amount: 55000 },
  { month: 'Jun', amount: 67000 },
];

const schemeData = [
  { name: 'Daily', value: 50, color: '#3b82f6' },
  { name: 'Weekly', value: 25, color: '#10b981' },
  { name: 'Monthly', value: 25, color: '#f59e0b' },
];

export const PigmyCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-sm font-medium opacity-70">Monthly Collection Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-sm font-medium opacity-70">Scheme Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={schemeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {schemeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 w-full px-4">
            {schemeData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="opacity-70">{item.name}</span>
                </div>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
