"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Something went wrong."
        );
        return;
      }

      setSuccess(
        "OTP has been sent to your email."
      );

      setTimeout(() => {
        router.push(
          `/reset-password?email=${encodeURIComponent(
            email
          )}`
        );
      }, 1500);
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h1>

        <p className="text-center text-slate-500 mb-6">
          Enter your registered email
          address and we'll send you a
          One-Time Password (OTP).
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="label">
              Email Address
            </label>

            <input
              type="email"
              required
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600">
              {success}
            </p>
          )}

          <button
            className="btn w-full"
            disabled={loading}
          >
            {loading
              ? "Sending OTP..."
              : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          <Link
            href="/login"
            className="text-blue-600 hover:underline"
          >
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}