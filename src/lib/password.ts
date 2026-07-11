export interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export function validatePassword(
  password: string
): PasswordValidation {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isStrongPassword(
  password: string
): boolean {
  const validation = validatePassword(password);

  return Object.values(validation).every(Boolean);
}

export function getPasswordStrength(
  password: string
): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) {
    return {
      score: 0,
      label: "Very Weak",
      color: "bg-slate-300",
    };
  }

  const validation = validatePassword(password);

  const score = Object.values(validation).filter(Boolean).length;

  if (score <= 2) {
    return {
      score,
      label: "Weak",
      color: "bg-red-500",
    };
  }

  if (score === 3 || score === 4) {
    return {
      score,
      label: "Medium",
      color: "bg-yellow-500",
    };
  }

  return {
    score,
    label: "Strong",
    color: "bg-green-500",
  };
}