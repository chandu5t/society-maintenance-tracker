"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  PriorityBadge,
  StatusBadge,
} from "@/components/badges";

interface Complaint {
  id: string;
  category: string;
  description: string;
  priority: string;
  currentStatus:
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED";
  createdAt: string;
}

interface Notice {
  id: string;
  title: string;
  body: string;
  important: boolean;
  createdAt: string;
}

export default function ResidentDashboardPage() {
  const [complaints, setComplaints] =
    useState<Complaint[] | null>(null);

  const [latestNotice, setLatestNotice] =
    useState<Notice | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [complaintsRes, noticesRes] =
          await Promise.all([
            fetch("/api/complaints"),
            fetch("/api/notices"),
          ]);

        const complaintsData =
          await complaintsRes.json();

        const noticesData =
          await noticesRes.json();

        setComplaints(
          complaintsData.complaints ?? []
        );

        if (
          noticesRes.ok &&
          noticesData.notices?.length > 0
        ) {
          setLatestNotice(
            noticesData.notices[0]
          );
        }
      } catch {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const all = complaints ?? [];

    return {
      total: all.length,

      open: all.filter(
        (c) =>
          c.currentStatus === "OPEN"
      ).length,

      inProgress: all.filter(
        (c) =>
          c.currentStatus ===
          "IN_PROGRESS"
      ).length,

      resolved: all.filter(
        (c) =>
          c.currentStatus ===
          "RESOLVED"
      ).length,
    };
  }, [complaints]);

  if (loading) {
    return (
      <p className="text-slate-500">
        Loading dashboard...
      </p>
    );
  }

  if (!complaints) {
    return (
      <p className="text-red-600">
        Failed to load dashboard.
      </p>
    );
  }

  return (     <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Resident Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back! Here's a quick overview of your complaints.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">
            {stats.total}
          </p>
          <p className="text-slate-500 mt-1">
            My Complaints
          </p>
        </div>

        <div className="card text-center">
          <p className="text-3xl font-bold text-amber-600">
            {stats.open}
          </p>
          <p className="text-slate-500 mt-1">
            Open
          </p>
        </div>

        <div className="card text-center">
          <p className="text-3xl font-bold text-sky-600">
            {stats.inProgress}
          </p>
          <p className="text-slate-500 mt-1">
            In Progress
          </p>
        </div>

        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {stats.resolved}
          </p>
          <p className="text-slate-500 mt-1">
            Resolved
          </p>
        </div>
      </div>

      {/* Latest Notice */}
      {latestNotice && (
        <div className="card mb-8 border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📢</span>

            <h2 className="text-lg font-semibold">
              Latest Notice
            </h2>

            {latestNotice.important && (
              <span className="badge bg-amber-500 text-white">
                Important
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold">
            {latestNotice.title}
          </h3>

          <p className="mt-2 whitespace-pre-wrap text-slate-700">
            {latestNotice.body}
          </p>

          <p className="mt-4 text-xs text-slate-400">
            Posted on{" "}
            {new Date(
              latestNotice.createdAt
            ).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Complaints Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          My Complaints
        </h2>

        <Link
          href="/resident/new"
          className="btn"
        >
          Raise Complaint
        </Link>
      </div>

      {/* Empty State */}
      {complaints.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-slate-500">
            You haven't raised any complaints yet.
          </p>

          <Link
            href="/resident/new"
            className="btn mt-5 inline-flex"
          >
            Raise Your First Complaint
          </Link>
        </div>
      )}

      {/* Complaint List */}
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <Link
            key={complaint.id}
            href={`/resident/complaint/${complaint.id}`}
            className="card block hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h2 className="font-semibold text-lg">
                  {complaint.category}
                </h2>

                <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                  {complaint.description}
                </p>

                <p className="text-xs text-slate-400 mt-3">
                  Raised on{" "}
                  {new Date(
                    complaint.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <PriorityBadge
                  priority={complaint.priority}
                />

                <StatusBadge
                  status={complaint.currentStatus}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}