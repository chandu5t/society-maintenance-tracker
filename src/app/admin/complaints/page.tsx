"use client";

import { useCallback, useEffect, useState } from "react";

import {
  StatusBadge,
  PriorityBadge,
  OverdueBadge,
} from "@/components/badges";

import type {
  ComplaintSummary,
  ComplaintStatus,
  Priority,
} from "@/lib/types";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleanliness",
  "Security",
  "Lift/Elevator",
  "Parking",
  "Noise",
  "Other",
];

const STATUSES: ComplaintStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
];

const PRIORITIES: Priority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
];

interface Filters {
  category: string;
  status: string;
  from: string;
  to: string;
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] =
    useState<ComplaintSummary[] | null>(null);

  const [filters, setFilters] = useState<Filters>({
    category: "",
    status: "",
    from: "",
    to: "",
  });

  const [selectedStatus, setSelectedStatus] = useState<
    Record<string, ComplaintStatus>
  >({});

  const [selectedPriority, setSelectedPriority] = useState<
    Record<string, Priority>
  >({});

  const [notes, setNotes] = useState<
    Record<string, string>
  >({});

  const [savingId, setSavingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const loadComplaints = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (filters.category)
        params.set("category", filters.category);

      if (filters.status)
        params.set("status", filters.status);

      if (filters.from)
        params.set("from", filters.from);

      if (filters.to)
        params.set("to", filters.to);

      const res = await fetch(
        `/api/complaints?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ??
            "Failed to load complaints."
        );
      }

      const list: ComplaintSummary[] = data.complaints ?? [];

      setComplaints(list);

      setSelectedStatus((prev) => {
        const next = { ...prev };
        list.forEach((complaint) => {
          if (!(complaint.id in next)) {
            next[complaint.id] = complaint.currentStatus;
          }
        });
        return next;
      });

      setSelectedPriority((prev) => {
        const next = { ...prev };
        list.forEach((complaint) => {
          if (!(complaint.id in next)) {
            next[complaint.id] = complaint.priority;
          }
        });
        return next;
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not load complaints."
        );
      }
    }
  }, [filters]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  function updateFilter(
    field: keyof Filters,
    value: string
  ) {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function updateComplaint(
    id: string,
    updates: {
      status?: ComplaintStatus;
      priority?: Priority;
      note?: string;
    }
  ) {
    setSavingId(id);
    setError("");

    try {
      const res = await fetch(
        `/api/complaints/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ??
            "Could not update complaint."
        );
      }

      setNotes((prev) => ({
        ...prev,
        [id]: "",
      }));

      await loadComplaints();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not update complaint."
        );
      }
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Manage Complaints
      </h1>

      <div className="card mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="label">
            Category
          </label>

          <select
            className="input"
            value={filters.category}
            onChange={(e) =>
              updateFilter(
                "category",
                e.target.value
              )
            }
          >
            <option value="">All</option>

            {CATEGORIES.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            Status
          </label>

          <select
            className="input"
            value={filters.status}
            onChange={(e) =>
              updateFilter(
                "status",
                e.target.value
              )
            }
          >
            <option value="">All</option>

            {STATUSES.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            From
          </label>

          <input
            className="input"
            type="date"
            value={filters.from}
            onChange={(e) =>
              updateFilter(
                "from",
                e.target.value
              )
            }
          />
        </div>

        <div>
          <label className="label">
            To
          </label>

          <input
            className="input"
            type="date"
            value={filters.to}
            onChange={(e) =>
              updateFilter(
                "to",
                e.target.value
              )
            }
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 mb-4">
          {error}
        </p>
      )}

      {complaints === null && (
        <p className="text-slate-500">
          Loading...
        </p>
      )}

      {complaints?.length === 0 && (
        <p className="text-slate-500">
          No complaints match these
          filters.
        </p>
      )}

      <div className="space-y-5">
        {complaints?.map((complaint) => (
          <div
            key={complaint.id}
            className={`card ${
              complaint.overdue
                ? "border-red-300"
                : ""
            }`}
          >
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <h2 className="font-semibold text-lg">
                  {complaint.category}
                </h2>

                <p className="text-slate-600 mt-1">
                  {complaint.description}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  {complaint.resident.name}
                  {" • "}
                  Flat{" "}
                  {complaint.resident
                    .flatNumber ?? "—"}
                  {" • "}
                  {
                    complaint.resident
                      .email
                  }
                </p>

                <p className="text-xs text-slate-400">
                  Raised{" "}
                  {new Date(
                    complaint.createdAt
                  ).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {complaint.overdue && (
                  <OverdueBadge />
                )}

                <PriorityBadge
                  priority={
                    complaint.priority
                  }
                />

                <StatusBadge
                  status={
                    complaint.currentStatus
                  }
                />
              </div>
            </div>

            {complaint.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={complaint.photoUrl}
                alt="Complaint"
                className="mt-4 w-full rounded-lg border border-slate-200 max-h-60 object-cover"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-200">
              <div>
                <label className="label">
                  Priority
                </label>

                <select
                  className="input"
                  value={
                    selectedPriority[complaint.id] ??
                    complaint.priority
                  }
                  disabled={
                    savingId === complaint.id
                  }
                  onChange={(e) =>
                    setSelectedPriority((prev) => ({
                      ...prev,
                      [complaint.id]:
                        e.target.value as Priority,
                    }))
                  }
                >
                  {PRIORITIES.map(
                    (priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {priority}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="label">
                  Status
                </label>

                <select
                  className="input"
                  value={
                    selectedStatus[complaint.id] ??
                    complaint.currentStatus
                  }
                  disabled={
                    savingId === complaint.id
                  }
                  onChange={(e) =>
                    setSelectedStatus((prev) => ({
                      ...prev,
                      [complaint.id]:
                        e.target.value as ComplaintStatus,
                    }))
                  }
                >
                  {STATUSES.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status.replace(
                        "_",
                        " "
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  Note
                </label>

                <input
                  className="input"
                  placeholder="Optional note..."
                  value={
                    notes[
                      complaint.id
                    ] ?? ""
                  }
                  onChange={(e) =>
                    setNotes((prev) => ({
                      ...prev,
                      [complaint.id]:
                        e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                disabled={
                  savingId === complaint.id
                }
                onClick={() =>
                  updateComplaint(
                    complaint.id,
                    {
                      status:
                        selectedStatus[
                          complaint.id
                        ],
                      priority:
                        selectedPriority[
                          complaint.id
                        ],
                      note:
                        notes[
                          complaint.id
                        ],
                    }
                  )
                }
                className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingId === complaint.id
                  ? "Updating..."
                  : "Update Complaint"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}