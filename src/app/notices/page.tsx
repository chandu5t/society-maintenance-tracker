"use client";

import { useEffect, useState } from "react";
import type { Notice } from "@/lib/types";

export default function NoticeBoardPage() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotices() {
      try {
        const res = await fetch("/api/notices");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load notices."
          );
        }

        setNotices(data.notices);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong.");
        }
      }
    }

    loadNotices();
  }, []);

  if (error) {
    return (
      <p className="text-red-600">
        {error}
      </p>
    );
  }

  if (!notices) {
    return (
      <p className="text-slate-500">
        Loading notices...
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Society Notice Board
        </h1>

        <p className="text-slate-500 mt-2">
          Stay updated with the latest announcements
          from the society administration.
        </p>
      </div>

      {notices.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-slate-500">
            No notices have been posted yet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`card ${
                notice.important
                  ? "border-l-4 border-amber-500 bg-amber-50"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {notice.title}
                </h2>

                {notice.important && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500 text-white">
                    📌 Important
                  </span>
                )}
              </div>

              <p className="mt-4 whitespace-pre-wrap text-slate-700">
                {notice.body}
              </p>

              <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                <span>
                  Posted by{" "}
                  <strong>
                    {notice.createdBy.name}
                  </strong>
                </span>

                <span>
                  {new Date(
                    notice.createdAt
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}