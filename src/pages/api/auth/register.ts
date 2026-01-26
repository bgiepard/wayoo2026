import type { NextApiRequest, NextApiResponse } from "next";
import { findUserByEmail, createUser } from "@/lib/airtable";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane" });
  }

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: "Użytkownik już istnieje" });
    }

    const user = await createUser(email, password, name);

    return res.status(201).json({
      message: "Konto utworzone pomyślnie",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: "Błąd serwera", details: message });
  }
}
