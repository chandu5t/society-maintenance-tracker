"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import PasswordStrength from "@/components/PasswordStrength";
import {
  validatePassword,
  isStrongPassword,
} from "@/lib/password";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
  useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [resending, setResending] = useState(false);

  const [timer, setTimer] = useState(60);

  const passwordValidation = useMemo(
    () => validatePassword(password),
    [password]
  );

  const passwordsMatch =
    password === confirmPassword;

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);  


  async function handleResendOTP() {
    if (!email) return;

    setError("");
    setSuccess("");
    setResending(true);

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
            "Could not resend OTP."
        );
        return;
      }

      setSuccess(
        "A new OTP has been sent to your email."
      );

      setTimer(60);
    } catch {
      setError(
        "Could not resend OTP."
      );
    } finally {
      setResending(false);
    }
  }


  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!isStrongPassword(password)) {
      setError(
        "Please create a stronger password."
      );
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Verify OTP
      const verifyRes = await fetch(
        "/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const verifyData =
        await verifyRes.json();

      if (!verifyRes.ok) {
        setError(
          verifyData.error ||
            "Invalid OTP."
        );
        return;
      }

      // Reset Password
      const resetRes = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            password,
          }),
        }
      );

      const resetData =
        await resetRes.json();

      if (!resetRes.ok) {
        setError(
          resetData.error ||
            "Could not reset password."
        );
        return;
      }

      alert(
        "Password changed successfully!"
      );

      router.push("/login");
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
          Reset Password
        </h1>

        <p className="text-center text-slate-500 mb-6">
          Enter the OTP sent to your email
          and choose a new password.
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
              className="input bg-slate-100"
              value={email}
              readOnly
            />
          </div>

          <div>
            <label className="label">
              OTP
            </label>

            <input
              className="input"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
            />
          </div>

          <div>
            <label className="label">
              New Password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="input pr-12"
                placeholder="Enter new password"
                required
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <PasswordStrength
              password={password}
            />

            <div className="mt-3 space-y-1 text-xs">
              <p
                className={
                  passwordValidation.length
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {passwordValidation.length
                  ? "✓"
                  : "✗"}{" "}
                At least 8 characters
              </p>

              <p
                className={
                  passwordValidation.uppercase
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {passwordValidation.uppercase
                  ? "✓"
                  : "✗"}{" "}
                One uppercase letter
              </p>

              <p
                className={
                  passwordValidation.lowercase
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {passwordValidation.lowercase
                  ? "✓"
                  : "✗"}{" "}
                One lowercase letter
              </p>

              <p
                className={
                  passwordValidation.number
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {passwordValidation.number
                  ? "✓"
                  : "✗"}{" "}
                One number
              </p>

              <p
                className={
                  passwordValidation.special
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {passwordValidation.special
                  ? "✓"
                  : "✗"}{" "}
                One special character
              </p>
            </div>
          </div>

          <div>
            <label className="label">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                className="input pr-12"
                placeholder="Confirm new password"
                required
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

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
              !isStrongPassword(password) ||
              !passwordsMatch
            }
          >
            {loading
              ? "Updating Password..."
              : "Reset Password"}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-slate-500 mb-2">
              Didn't receive the OTP?
            </p>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={
                timer > 0 ||
                resending
              }
              className="text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
            >
              {resending
                ? "Resending..."
                : timer > 0
                ? `Resend OTP (${timer}s)`
                : "Resend OTP"}
            </button>
          </div>

        </form>

        <p className="text-center text-sm mt-6">
          <Link
            href="/login"
            className="text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-12">
          <div className="card text-center py-12">
            Loading...
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}