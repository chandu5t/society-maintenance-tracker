"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { DashboardStats as DashboardStatsType } from "@/lib/types";

import DashboardStats from "@/components/DashboardStats";
import DashboardProgress from "@/components/DashboardProgress";
import DashboardPieChart from "@/components/DashboardPieChart";
import DashboardCategoryChart from "@/components/DashboardCategoryChart";

export default function AdminDashboard() {
  const [stats, setStats] =
    useState<DashboardStatsType | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load dashboard."
          );
        }

        setStats(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong.");
        }
      }
    }

    loadDashboard();
  }, []);

  if (error) {
    return (
      <p className="text-red-600">
        {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <p className="text-slate-500">
        Loading...
      </p>
    );
  }

  const open = stats.byStatus.OPEN ?? 0;
  const inProgress =
    stats.byStatus.IN_PROGRESS ?? 0;
  const resolved =
    stats.byStatus.RESOLVED ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Admin Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            Monitor complaints, notices and
            overall society activity.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/complaints"
            className="btn"
          >
            Manage Complaints
          </Link>

          <Link
            href="/admin/notices"
            className="btn-secondary"
          >
            Manage Notices
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats
        total={stats.total}
        open={open}
        inProgress={inProgress}
        resolved={resolved}
        overdue={stats.overdueCount}
      />

      {/* Progress + Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DashboardProgress
          total={stats.total}
          open={open}
          inProgress={inProgress}
          resolved={resolved}
        />

        <DashboardPieChart
          open={open}
          inProgress={inProgress}
          resolved={resolved}
        />
      </div>

      {/* Category Chart */}
      <DashboardCategoryChart
        categories={stats.byCategory}
      />

      {/* Footer */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/complaints"
          className="btn"
        >
          Manage Complaints
        </Link>

        <Link
          href="/admin/notices"
          className="btn-secondary"
        >
          Manage Notices
        </Link>
      </div>
    </div>
  );
}