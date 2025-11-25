import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { HealthMetric } from '../types';

export const SimpleLineChart = ({ data, color, dataKey = "value" }: { data: HealthMetric[]; color: string; dataKey?: string }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`color${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
          <stop offset="95%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis 
        dataKey="date" 
        axisLine={false} 
        tickLine={false} 
        tick={{ fontSize: 12, fill: '#64748b' }} 
        dy={10}
      />
      <YAxis 
        axisLine={false} 
        tickLine={false} 
        tick={{ fontSize: 12, fill: '#64748b' }} 
      />
      <Tooltip 
        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      />
      <Area 
        type="monotone" 
        dataKey={dataKey} 
        stroke={color} 
        strokeWidth={3}
        fillOpacity={1} 
        fill={`url(#color${color})`} 
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const HealthScoreDistribution = () => {
  const data = [
    { name: '优秀', value: 35, color: '#22c55e' },
    { name: '良好', value: 45, color: '#3b82f6' },
    { name: '一般', value: 15, color: '#f59e0b' },
    { name: '较差', value: 5, color: '#ef4444' },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
        <Tooltip cursor={{fill: 'transparent'}} />
        <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};