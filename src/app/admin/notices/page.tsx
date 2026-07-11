"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Notice } from "@/lib/types";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[] | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [important, setImportant] = useState(false);

  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function loadNotices() {
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ?? "Could not load notices."
        );
      }

      setNotices(data.notices ?? []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not load notices.");
      }
    }
  }

  useEffect(() => {
    loadNotices();
  }, []);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setPosting(true);

    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body,
          important,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ??
            "Could not post notice."
        );
      }

      setTitle("");
      setBody("");
      setImportant(false);

      await loadNotices();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not post notice.");
      }
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Notice Management
      </h1>

      <form
        onSubmit={handleSubmit}
        className="card space-y-4 mb-8"
      >
        <h2 className="text-lg font-semibold">
          Post a Notice
        </h2>

        <div>
          <label className="label">
            Title
          </label>

          <input
            className="input"
            required
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />
        </div>

        <div>
          <label className="label">
            Body
          </label>

          <textarea
            className="input"
            rows={4}
            required
            value={body}
            onChange={(e) =>
              setBody(e.target.value)
            }
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={important}
            onChange={(e) =>
              setImportant(
                e.target.checked
              )
            }
          />

          Mark as Important
          (Pinned + Email all residents)
        </label>

        {error && (
          <p className="text-red-600 text-sm">
            {error}
          </p>
        )}

        <button
          className="btn w-full md:w-auto"
          disabled={posting}
        >
          {posting
            ? "Posting..."
            : "Post Notice"}
        </button>
      </form>

      {notices === null && (
        <p className="text-slate-500">
          Loading...
        </p>
      )}

      {notices?.length === 0 && (
        <p className="text-slate-500">
          No notices have been posted yet.
        </p>
      )}

      <div className="space-y-4">
        {notices?.map((notice) => (
          <div
            key={notice.id}
            className={`card ${
              notice.important
                ? "border-amber-400 bg-amber-50"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {notice.title}
              </h3>

              {notice.important && (
                <span className="badge bg-amber-500 text-white">
                  📌 Pinned
                </span>
              )}
            </div>

            <p className="mt-3 text-slate-700 whitespace-pre-wrap">
              {notice.body}
            </p>

            <p className="mt-3 text-xs text-slate-400">
              Posted by{" "}
              {notice.createdBy.name}{" "}
              on{" "}
              {new Date(
                notice.createdAt
              ).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}