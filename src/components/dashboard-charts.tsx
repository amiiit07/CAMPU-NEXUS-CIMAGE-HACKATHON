"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart
} from "recharts";

const defaultColors = ["#7C3AED", "#06B6D4", "#22C55E", "#38BDF8", "#A78BFA"];

export function GradientBarChart({
  data,
  dataKey,
  xKey,
  color = "#06B6D4"
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  xKey: string;
  color?: string;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey={xKey} stroke="#94A3B8" fontSize={12} />
          <YAxis stroke="#94A3B8" fontSize={12} />
          <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
          <Bar dataKey={dataKey} radius={[8, 8, 0, 0]} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendAreaChart({
  data,
  dataKey,
  xKey,
  color = "#7C3AED"
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  xKey: string;
  color?: string;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.6} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey={xKey} stroke="#94A3B8" fontSize={12} />
          <YAxis stroke="#94A3B8" fontSize={12} />
          <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#trendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SplitPieChart({
  data,
  dataKey,
  nameKey
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  nameKey: string;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={3}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
