"use client";

import {
  getPasswordStrength,
  validatePassword,
} from "@/lib/password";

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({
  password,
}: PasswordStrengthProps) {
  if (!password) return null;

  const validation = validatePassword(password);
  const strength = getPasswordStrength(password);

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">
          Password Strength
        </span>

        <span
          className={`text-sm font-semibold ${
            strength.label === "Strong"
              ? "text-green-600"
              : strength.label === "Medium"
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {strength.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-4">
        <div
          className={`${strength.color} h-full transition-all duration-300`}
          style={{
            width: `${(strength.score / 5) * 100}%`,
          }}
        />
      </div>

      {/* Validation Checklist */}
      <div className="space-y-2 text-sm">
        <PasswordRule
          valid={validation.length}
          text="Minimum 8 characters"
        />

        <PasswordRule
          valid={validation.uppercase}
          text="At least one uppercase letter (A-Z)"
        />

        <PasswordRule
          valid={validation.lowercase}
          text="At least one lowercase letter (a-z)"
        />

        <PasswordRule
          valid={validation.number}
          text="At least one number (0-9)"
        />

        <PasswordRule
          valid={validation.special}
          text="At least one special character (!@#$...)"
        />
      </div>
    </div>
  );
}

interface PasswordRuleProps {
  valid: boolean;
  text: string;
}

function PasswordRule({
  valid,
  text,
}: PasswordRuleProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-base ${
          valid
            ? "text-green-600"
            : "text-slate-400"
        }`}
      >
        {valid ? "✓" : "○"}
      </span>

      <span
        className={
          valid
            ? "text-green-700"
            : "text-slate-500"
        }
      >
        {text}
      </span>
    </div>
  );
}