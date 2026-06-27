"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chf } from "@/lib/utils";

const colors = ["#142844", "#9a7046", "#627084", "#2f6b57", "#d6ba8b"];

export function TaxBreakdownChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
            {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip formatter={(value) => chf(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CantonComparisonChart({
  data
}: {
  data: { canton: string; code: string; estimatedTax: number; delta: number }[];
}) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 8, right: 8, top: 12, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.28} />
          <XAxis dataKey="code" />
          <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
          <Tooltip formatter={(value) => chf(Number(value))} labelFormatter={(label) => `Canton ${label}`} />
          <Bar dataKey="estimatedTax" radius={[3, 3, 0, 0]} fill="#142844" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
