import type {
  Complaint,
  ComplaintHistory as PrismaComplaintHistory,
  Notice as PrismaNotice,
  Priority,
  Role,
  ComplaintStatus,
} from "@prisma/client";

export interface UserSummary {
  id?: string;
  name: string;
  email?: string;
  flatNumber?: string | null;
  role?: Role;
}

export type ComplaintSummary = Complaint & {
  resident: UserSummary;
  overdue: boolean;
};

export type ComplaintHistory = PrismaComplaintHistory & {
  actor: UserSummary;
};

export type ComplaintDetail = Complaint & {
  resident: UserSummary;
  history: ComplaintHistory[];
  overdue: boolean;
};

export type Notice = PrismaNotice & {
  createdBy: UserSummary;
};

export interface DashboardStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  overdueCount: number;
  thresholdDays: number;
}

export type {
  ComplaintStatus,
  Priority,
  Role,
};