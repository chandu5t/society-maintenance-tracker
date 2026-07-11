interface DashboardProgressProps {
  open: number;
  inProgress: number;
  resolved: number;
  total: number;
}

export default function DashboardProgress({
  open,
  inProgress,
  resolved,
  total,
}: DashboardProgressProps) {
  const percentage = (value: number) =>
    total === 0 ? 0 : Math.round((value / total) * 100);

  const bars = [
    {
      label: "Open",
      value: open,
      color: "bg-amber-500",
    },
    {
      label: "In Progress",
      value: inProgress,
      color: "bg-sky-500",
    },
    {
      label: "Resolved",
      value: resolved,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-6">
        Complaint Progress
      </h2>

      <div className="space-y-5">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between text-sm mb-2">
              <span>{bar.label}</span>

              <span>
                {bar.value} ({percentage(bar.value)}%)
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`${bar.color} h-full transition-all duration-700`}
                style={{
                  width: `${percentage(bar.value)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}