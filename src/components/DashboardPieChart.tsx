"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardPieChartProps {
  open: number;
  inProgress: number;
  resolved: number;
}

const COLORS = [
  "#f59e0b", // Open
  "#0ea5e9", // In Progress
  "#22c55e", // Resolved
];

export default function DashboardPieChart({
  open,
  inProgress,
  resolved,
}: DashboardPieChartProps) {
  const data = [
    {
      name: "Open",
      value: open,
    },
    {
      name: "In Progress",
      value: inProgress,
    },
    {
      name: "Resolved",
      value: resolved,
    },
  ];

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-6">
        Complaint Status Distribution
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              label
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}