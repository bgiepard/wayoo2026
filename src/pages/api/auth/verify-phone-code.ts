import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./[...nextauth]";
import { checkPhoneVerificationCode, formatPhoneE164 } from "@/lib/twilio";
import { markPhoneAsVerified, findUserById } from "@/services";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Brak autoryzacji" });

  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "Brak numeru telefonu lub kodu" });

  const formatted = formatPhoneE164(phone);

  try {
    const approved = await checkPhoneVerificationCode(formatted, code);
    if (!approved) return res.status(400).json({ error: "Nieprawidłowy lub wygasły kod" });

    const userId = (session.user as { id?: string }).id;
    if (!userId) return res.status(400).json({ error: "Brak ID użytkownika w sesji" });

    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: "Użytkownik nie istnieje" });

    await markPhoneAsVerified(userId);
    return res.status(200).json({ verified: true });
  } catch (error) {
    console.error("[verify-phone-code] Błąd:", error);
    return res.status(500).json({ error: "Błąd serwera" });
  }
}
