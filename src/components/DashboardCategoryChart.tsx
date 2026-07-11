"use client";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

interface DashboardCategoryChartProps {
  categories: Record<string, number>;
}

export default function DashboardCategoryChart({
  categories,
}: DashboardCategoryChartProps) {
  const data = Object.entries(categories).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-6">
        Complaints by Category
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}