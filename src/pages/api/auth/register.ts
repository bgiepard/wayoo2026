import type { NextApiRequest, NextApiResponse } from "next";
import { findUserByEmail, createUser } from "@/services";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, firstName, lastName, phone } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "Imie, nazwisko, email i haslo sa wymagane" });
  }

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: "Uzytkownik juz istnieje" });
    }

    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      provider: "email",
    });

    return res.status(201).json({
      message: "Konto utworzone pomyslnie",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: "Blad serwera", details: message });
  }
}
