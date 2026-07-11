"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: SessionResponse) => setUser(d.user || null))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-slate-800">
          🏢 Society Maintenance Tracker
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user === undefined && (
            <span className="text-slate-400">...</span>
          )}

          {user === null && (
            <>
              <Link
                href="/login"
                className="text-slate-600 hover:text-blue-600"
              >
                Log in
              </Link>

              <Link href="/register" className="btn">
                Register
              </Link>
            </>
          )}

          {user && user.role === "RESIDENT" && (
            <>
              <Link
                href="/resident"
                className="text-slate-600 hover:text-blue-600"
              >
                My Complaints
              </Link>

              <Link
                href="/notices"
                className="text-slate-600 hover:text-blue-600"
              >
                Notice Board
              </Link>

              <Link href="/resident/new" className="btn">
                Raise Complaint
              </Link>

              <button onClick={logout} className="btn-secondary">
                Log out
              </button>
            </>
          )}

          {user && user.role === "ADMIN" && (
            <>
              <Link
                href="/admin"
                className="text-slate-600 hover:text-blue-600"
              >
                Dashboard
              </Link>

              <Link
                href="/admin/complaints"
                className="text-slate-600 hover:text-blue-600"
              >
                Complaints
              </Link>

              <Link
                href="/admin/notices"
                className="text-slate-600 hover:text-blue-600"
              >
                Notices
              </Link>

              <Link
                href="/admin/settings"
                className="text-slate-600 hover:text-brand"
              >
                Settings
              </Link>

              <button onClick={logout} className="btn-secondary">
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}