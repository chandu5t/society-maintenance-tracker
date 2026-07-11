import prisma from "@/lib/db";

const DEFAULT_THRESHOLD_DAYS = 7;

interface ComplaintLike {
  currentStatus: string;
  createdAt: Date;
}

// Returns the overdue threshold from the database or falls back to 7 days.
export async function getOverdueThresholdDays(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: {
      key: "OVERDUE_THRESHOLD_DAYS",
    },
  });

  return setting ? Number(setting.value) : DEFAULT_THRESHOLD_DAYS;
}

// Returns true if the complaint is older than the threshold and not resolved.
export function isOverdue(
  complaint: ComplaintLike,
  thresholdDays: number
): boolean {
  if (complaint.currentStatus === "RESOLVED") {
    return false;
  }

  const ageMs =
    Date.now() - new Date(complaint.createdAt).getTime();

  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  return ageDays > thresholdDays;
}

// Adds an "overdue" property and sorts overdue complaints first.
export function annotateAndSortByOverdue<T extends ComplaintLike>(
  complaints: T[],
  thresholdDays: number
): (T & { overdue: boolean })[] {
  const annotated = complaints.map((complaint) => ({
    ...complaint,
    overdue: isOverdue(complaint, thresholdDays),
  }));

  annotated.sort((a, b) => {
    if (a.overdue !== b.overdue) {
      return a.overdue ? -1 : 1;
    }

    return (
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
    );
  });

  return annotated;
}