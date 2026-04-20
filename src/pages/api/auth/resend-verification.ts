import type { NextApiRequest, NextApiResponse } from "next";
import { findUserByEmail, setEmailVerifyToken } from "@/services";
import { sendVerificationEmail } from "@/lib/resend";
import { randomUUID } from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Brak adresu email" });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      // Nie ujawniamy czy użytkownik istnieje
      return res.status(200).json({ message: "Jeśli konto istnieje, email został wysłany." });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email już zweryfikowany" });
    }

    const token = randomUUID();
    await setEmailVerifyToken(user.id, token);
    await sendVerificationEmail(email, token);

    return res.status(200).json({ message: "Email weryfikacyjny został wysłany." });
  } catch (error: unknown) {
    console.error("[resend-verification] Błąd:", error);
    return res.status(500).json({ error: "Błąd serwera" });
  }
}
