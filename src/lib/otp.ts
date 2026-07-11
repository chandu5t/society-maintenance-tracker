export function generateOTP(length: number = 6): string {
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }

  return otp;
}

export function getOTPExpiry(minutes: number = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}