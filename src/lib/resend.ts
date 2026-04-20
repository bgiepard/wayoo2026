const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Wayoo <onboarding@resend.dev>",
      to: email,
      subject: "Potwierdź adres email — Wayoo",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#0B298F;margin-bottom:16px">Witaj w Wayoo!</h2>
          <p style="color:#5B5E68;margin-bottom:24px">Kliknij poniższy przycisk, aby zweryfikować swój adres email i aktywować konto.</p>
          <a href="${verifyUrl}" style="background:#0B298F;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;display:inline-block;font-weight:600">
            Zweryfikuj email
          </a>
          <p style="color:#9B9DA3;font-size:13px;margin-top:24px">Link wygaśnie po 24 godzinach. Jeśli nie zakładałeś konta w Wayoo, zignoruj tę wiadomość.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error("[Resend] Błąd wysyłki emaila:", data);
    throw new Error("Nie udało się wysłać emaila weryfikacyjnego");
  }
}
