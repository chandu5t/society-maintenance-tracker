"use client";

import { FormEvent, useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [threshold, setThreshold] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load settings.");
        }

        setThreshold(data.thresholdDays);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load settings.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          overdueThresholdDays: threshold,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Could not save settings."
        );
      }

      setSuccess("Settings updated successfully.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-slate-500">
        Loading...
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">
          Settings
        </h1>

        <p className="text-slate-500 mb-6">
          Configure application-wide settings.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="label">
              Overdue Threshold (Days)
            </label>

            <input
              type="number"
              min={1}
              className="input"
              value={threshold}
              onChange={(e) =>
                setThreshold(
                  Number(e.target.value)
                )
              }
            />

            <p className="text-xs text-slate-500 mt-2">
              Complaints older than this value
              and not resolved will be marked
              as overdue.
            </p>
          </div>

          {success && (
            <p className="text-green-600 text-sm">
              {success}
            </p>
          )}

          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <button
            className="btn w-full md:w-auto"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}