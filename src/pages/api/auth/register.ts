import type { NextApiRequest, NextApiResponse } from "next";
import { findUserByEmail, createUser } from "@/services";

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

    await createUser({ email, password, firstName, lastName, phone, provider: "email" });

    return res.status(201).json({ message: "Konto utworzone." });
  } catch (error: unknown) {
    console.error("[register] Błąd ogólny:", error);
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: "Błąd serwera", details: message });
  }
}
