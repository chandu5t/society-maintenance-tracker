import Link from "next/link";
import {
  Camera,
  ClipboardList,
  Bell,
  ShieldCheck,
  ArrowRight,
  Clock3,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-24">

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
          🏢 Smart Society Complaint Management
        </div>

        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-800">
          Society Maintenance
          <span className="block text-blue-600">
            Tracker
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Raise complaints, upload photos, track every update,
          receive email notifications, and let administrators
          manage maintenance efficiently from one centralized platform.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/register" className="btn">
            Get Started
          </Link>

          <Link href="/login" className="btn-secondary">
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="mb-12 text-center text-3xl font-bold">
          Why Use Society Maintenance Tracker?
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          <div className="card hover:-translate-y-1 transition">
            <Camera className="mb-4 h-10 w-10 text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold">
              Photo Upload
            </h3>
            <p className="text-slate-600">
              Upload issue photos while raising complaints for faster verification.
            </p>
          </div>

          <div className="card hover:-translate-y-1 transition">
            <ClipboardList className="mb-4 h-10 w-10 text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold">
              Complaint Tracking
            </h3>
            <p className="text-slate-600">
              Track complaint progress from Open to Resolved with complete history.
            </p>
          </div>

          <div className="card hover:-translate-y-1 transition">
            <Bell className="mb-4 h-10 w-10 text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold">
              Email Notifications
            </h3>
            <p className="text-slate-600">
              Residents receive automatic updates whenever complaint status changes.
            </p>
          </div>

          <div className="card hover:-translate-y-1 transition">
            <ShieldCheck className="mb-4 h-10 w-10 text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold">
              Priority Management
            </h3>
            <p className="text-slate-600">
              Admins assign priorities and resolve urgent issues first.
            </p>
          </div>

        </div>
      </section>

      {/* Workflow */}
      <section>

        <h2 className="mb-12 text-center text-3xl font-bold">
          How It Works
        </h2>

        <div className="grid gap-8 md:grid-cols-5 text-center">

          <div className="card">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-blue-600" />
            <p className="font-semibold">Raise Complaint</p>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="hidden md:block text-slate-400" />
          </div>

          <div className="card">
            <Clock3 className="mx-auto mb-3 h-10 w-10 text-yellow-500" />
            <p className="font-semibold">Admin Reviews</p>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="hidden md:block text-slate-400" />
          </div>

          <div className="card">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
            <p className="font-semibold">Resolved</p>
          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="rounded-2xl bg-blue-600 py-16 text-center text-white">

        <h2 className="text-3xl font-bold">
          Ready to Improve Society Maintenance?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-blue-100">
          Join residents and administrators in making maintenance
          transparent, organized, and efficient.
        </p>

        <div className="mt-8 flex justify-center gap-4">

          <Link
            href="/register"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-slate-100"
          >
            Register
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-white px-6 py-3 font-semibold hover:bg-blue-700"
          >
            Login
          </Link>

        </div>

      </section>

    </div>
  );
}