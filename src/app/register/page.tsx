"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import PasswordStrength from "@/components/PasswordStrength";
import { isStrongPassword } from "@/lib/password";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  flatNumber: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    flatNumber: "",
  });

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [emailVerified, setEmailVerified] =
    useState(false);

  const [sendingOTP, setSendingOTP] =
    useState(false);

  const [verifyingOTP, setVerifyingOTP] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [timer, setTimer] = useState(0);

  const [success, setSuccess] = useState("");

  function update<K extends keyof RegisterForm>(
    field: K,
    value: RegisterForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const passwordStrong = isStrongPassword(
    form.password
  );

  const passwordsMatch =
    confirmPassword.length > 0 &&
    form.password === confirmPassword;

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]); 
  
  async function handleSendOTP() {
    if (!form.email) {
      setError("Please enter your email first.");
      return;
    }

    setError("");
    setSuccess("");
    setSendingOTP(true);

    try {
      const res = await fetch(
        "/api/auth/send-register-otp",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: form.email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Failed to send OTP."
        );
        return;
      }

      setOtpSent(true);
      setTimer(60);

      setSuccess(
        "OTP sent to your email."
      );
    } catch {
      setError(
        "Could not send OTP."
      );
    } finally {
      setSendingOTP(false);
    }
  }

  async function handleVerifyOTP() {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setError("");
    setSuccess("");
    setVerifyingOTP(true);

    try {
      const res = await fetch(
        "/api/auth/verify-register-otp",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            otp,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "OTP verification failed."
        );
        return;
      }

      setEmailVerified(true);

      setSuccess(
        "✅ Email verified successfully."
      );
    } catch {
      setError(
        "Could not verify OTP."
      );
    } finally {
      setVerifyingOTP(false);
    }
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!passwordStrong) {
      setError(
        "Please choose a stronger password."
      );
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "Registration failed."
        );
        return;
      }

      router.push("/resident");
      router.refresh();
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
          Create Your Account
        </h1>

        <p className="text-center text-slate-500 mb-6">
          Register as a resident to raise and track
          maintenance complaints.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="label">
              Full Name
            </label>

            <input
              className="input"
              type="text"
              placeholder="Enter your full name"
              required
              value={form.name}
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) =>
                update("name", e.target.value)
              }
            />
          </div>

          <div>
            <label className="label">
              Flat Number
            </label>

            <input
              className="input"
              type="text"
              placeholder="e.g. B-204"
              value={form.flatNumber}
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) =>
                update(
                  "flatNumber",
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label className="label">
              Email Address
            </label>

            <div className="flex gap-2">
              <input
                className="input flex-1"
                type="email"
                placeholder="Enter your email"
                required
                readOnly={emailVerified}
                value={form.email}
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) =>
                  update("email", e.target.value)
                }
              />

              <button
                type="button"
                className="btn whitespace-nowrap"
                disabled={
                  sendingOTP ||
                  emailVerified ||
                  timer > 0
                }
                onClick={handleSendOTP}
              >
                {sendingOTP
                  ? "Sending..."
                  : timer > 0
                  ? `${timer}s`
                  : "Send OTP"}
              </button>
            </div>

            {emailVerified && (
              <p className="mt-2 text-green-600 text-sm font-medium">
                ✅ Email Verified
              </p>
            )}
          </div>


          {otpSent && !emailVerified && (
            <div>
              <label className="label">
                Verification OTP
              </label>

              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="btn whitespace-nowrap"
                  onClick={handleVerifyOTP}
                  disabled={verifyingOTP}
                >
                  {verifyingOTP
                    ? "Verifying..."
                    : "Verify"}
                </button>
              </div>

              <div className="mt-2">
                {timer > 0 ? (
                  <p className="text-sm text-slate-500">
                    Didn't receive the OTP?
                    {" "}
                    Resend in {timer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                    disabled={resending}
                    onClick={handleSendOTP}
                  >
                    {resending
                      ? "Sending..."
                      : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>
          )}


          <div>
            <label className="label">
              Password
            </label>

            <input
              className="input"
              type="password"
              placeholder="Create a strong password"
              required
              value={form.password}
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) =>
                update(
                  "password",
                  e.target.value
                )
              }
            />

            <PasswordStrength
              password={form.password}
            />
          </div>

          <div>
            <label className="label">
              Confirm Password
            </label>

            <input
              className="input"
              type="password"
              placeholder="Re-enter your password"
              required
              value={confirmPassword}
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />

            {confirmPassword && (
              <p
                className={`mt-2 text-sm ${
                  passwordsMatch
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </p>
            )}
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
            type="submit"
            className="btn w-full"
            disabled={
              loading ||
              !emailVerified ||
              !passwordStrong ||
              !passwordsMatch
            }
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}