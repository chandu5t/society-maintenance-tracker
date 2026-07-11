"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  StatusBadge,
  PriorityBadge,
  OverdueBadge,
} from "@/components/badges";

import type { ComplaintDetail } from "@/lib/types";

export default function ComplaintDetailPage() {
  const params = useParams<{ id: string }>();

  const [complaint, setComplaint] =
    useState<ComplaintDetail | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadComplaint() {
      try {
        const res = await fetch(
          `/api/complaints/${params.id}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ??
              "Could not load complaint."
          );
        }

        setComplaint(data.complaint);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong.");
        }
      }
    }

    loadComplaint();
  }, [params.id]);

  if (error) {
    return (
      <p className="text-red-600">
        {error}
      </p>
    );
  }

  if (!complaint) {
    return (
      <p className="text-slate-500">
        Loading...
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {complaint.category}
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Raised{" "}
              {new Date(
                complaint.createdAt
              ).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {complaint.overdue && (
              <OverdueBadge />
            )}

            <PriorityBadge
              priority={complaint.priority}
            />

            <StatusBadge
              status={complaint.currentStatus}
            />
          </div>
        </div>

        <p className="mt-5 text-slate-700 whitespace-pre-wrap">
          {complaint.description}
        </p>

        {complaint.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={complaint.photoUrl}
            alt="Complaint"
            className="mt-5 w-full rounded-lg border border-slate-200 max-h-96 object-cover"
          />
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          Complaint Timeline
        </h2>

        {complaint.history.length === 0 ? (
          <p className="text-slate-500">
            No history available.
          </p>
        ) : (
          <ol className="space-y-4 border-l-2 border-slate-200 pl-4">
            {complaint.history.map((history) => (
              <li key={history.id}>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={history.status}
                  />

                  <span className="text-xs text-slate-400">
                    {new Date(
                      history.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mt-1">
                  By{" "}
                  {history.actor?.name ??
                    "Unknown"}

                  {history.actor?.role ===
                    "ADMIN" && " (Admin)"}
                </p>

                {history.note && (
                  <p className="mt-1 text-sm italic text-slate-500">
                    "{history.note}"
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}