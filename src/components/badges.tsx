interface StatusBadgeProps {
  status: string;
}

interface PriorityBadgeProps {
  priority: string;
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-orange-100 text-orange-800",
  HIGH: "bg-red-100 text-red-800",
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`badge ${
        STATUS_STYLES[status] ??
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function PriorityBadge({
  priority,
}: PriorityBadgeProps) {
  return (
    <span
      className={`badge ${
        PRIORITY_STYLES[priority] ??
        "bg-slate-100 text-slate-700"
      }`}
    >
      {priority}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="badge bg-red-600 text-white">
      OVERDUE
    </span>
  );
}