"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "RESIDENT";
};

type SessionResponse = {
  user: User | null;
};

export default function Nav() {
  const [user, setUser] = useState<User | null | undefined>(
    undefined
  );

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });

        const data: SessionResponse = await res.json();

        setUser(data.user || null);
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, []);

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(error);
    }

    setUser(null);

    // Force a complete reload so authentication state
    // is refreshed correctly in production.
    window.location.href = "/login";
  }

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-bold text-lg text-slate-800"
        >
          🏢 Society Maintenance Tracker
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user === undefined && (
            <span className="text-slate-400">
              Loading...
            </span>
          )}

          {user === null && (
            <>
              <Link
                href="/login"
                className="text-slate-600 hover:text-blue-600 transition"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="btn"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <span className="hidden md:block font-medium text-slate-700">
              Hello, {user.name}
            </span>
          )}

          {user && user.role === "RESIDENT" && (
            <>
              <Link
                href="/resident"
                className="text-slate-600 hover:text-blue-600 transition"
              >
                My Complaints
              </Link>

              <Link
                href="/notices"
                className="text-slate-600 hover:text-blue-600 transition"
              >
                Notice Board
              </Link>

              <Link
                href="/resident/new"
                className="btn"
              >
                Raise Complaint
              </Link>

              <button
                onClick={logout}
                className="btn-secondary"
              >
                Log out
              </button>
            </>
          )}

          {user && user.role === "ADMIN" && (
            <>
              <Link
                href="/admin"
                className="text-slate-600 hover:text-blue-600 transition"
              >
                Dashboard
              </Link>

              <Link
                href="/admin/complaints"
                className="text-slate-600 hover:text-blue-600 transition"
              >
                Complaints
              </Link>

              <Link
                href="/admin/notices"
                className="text-slate-600 hover:text-blue-600 transition"
              >
                Notices
              </Link>

              <Link
                href="/admin/settings"
                className="text-slate-600 hover:text-blue-600 transition"
              >
                Settings
              </Link>

              <button
                onClick={logout}
                className="btn-secondary"
              >
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}