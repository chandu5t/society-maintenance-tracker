interface DashboardStatsProps {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  overdue: number;
}

export default function DashboardStats({
  total,
  open,
  inProgress,
  resolved,
  overdue,
}: DashboardStatsProps) {
  const cards = [
    {
      title: "Total Complaints",
      value: total,
      icon: "📄",
      color: "text-blue-600",
    },
    {
      title: "Open",
      value: open,
      icon: "🟠",
      color: "text-amber-600",
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: "🔵",
      color: "text-sky-600",
    },
    {
      title: "Resolved",
      value: resolved,
      icon: "🟢",
      color: "text-green-600",
    },
    {
      title: "Overdue",
      value: overdue,
      icon: "🔴",
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="card text-center hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-2">
            {card.icon}
          </div>

          <p
            className={`text-3xl font-bold ${card.color}`}
          >
            {card.value}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {card.title}
          </p>
        </div>
      ))}
    </div>
  );
}