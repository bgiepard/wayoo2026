import type { NextApiRequest, NextApiResponse } from "next";
import { findUserByEmail, createUser, setEmailVerifyToken } from "@/services";
import { sendVerificationEmail } from "@/lib/resend";
import { randomUUID } from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, firstName, lastName, phone } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "Imię, nazwisko, email i hasło są wymagane" });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Użytkownik już istnieje" });
    }

    const user = await createUser({ email, password, firstName, lastName, phone, provider: "email" });

    const token = randomUUID();

    try {
      await setEmailVerifyToken(user.id, token);
    } catch (e) {
      console.error("[register] Błąd zapisu tokenu w Airtable:", e);
      return res.status(500).json({ error: "Nie udało się zapisać tokenu weryfikacyjnego. Sprawdź nazwy pól w Airtable." });
    }

    try {
      await sendVerificationEmail(email, token);
    } catch (e) {
      console.error("[register] Błąd wysyłki emaila przez Resend:", e);
      return res.status(500).json({ error: "Konto utworzone, ale nie udało się wysłać emaila weryfikacyjnego." });
    }

    return res.status(201).json({ message: "Konto utworzone. Sprawdź skrzynkę email, aby aktywować konto." });
  } catch (error: unknown) {
    console.error("[register] Błąd ogólny:", error);
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: "Błąd serwera", details: message });
  }
}
