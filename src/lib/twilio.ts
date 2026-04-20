const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!;

const twilioBase = `https://verify.twilio.com/v2/Services/${SERVICE_SID}`;
const authHeader = "Basic " + Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");

export function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("48") && digits.length === 11) return `+${digits}`;
  if (digits.length === 9) return `+48${digits}`;
  return `+${digits}`;
}

export async function sendPhoneVerificationCode(phone: string): Promise<void> {
  const res = await fetch(`${twilioBase}/Verifications`, {
    method: "POST",
    headers: { "Authorization": authHeader, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: phone, Channel: "sms" }).toString(),
  });
  const data = await res.json().catch(() => ({}));
  console.log("[twilio] Verification create response:", { status: res.status, sid: data.sid, to: data.to, verificationStatus: data.status });
  if (!res.ok) {
    throw new Error(data.message || "Nie udało się wysłać kodu SMS");
  }
}

export async function checkPhoneVerificationCode(phone: string, code: string): Promise<boolean> {
  const res = await fetch(`${twilioBase}/VerificationChecks`, {
    method: "POST",
    headers: { "Authorization": authHeader, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: phone, Code: code }).toString(),
  });
  const data = await res.json().catch(() => ({}));
  console.log("[twilio] VerificationCheck response:", { status: res.status, data });
  return data.status === "approved";
}
