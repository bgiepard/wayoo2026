import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./[...nextauth]";
import { sendPhoneVerificationCode, formatPhoneE164 } from "@/lib/twilio";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Brak autoryzacji" });

  const { phone } = req.body;
  if (!phone || typeof phone !== "string") return res.status(400).json({ error: "Brak numeru telefonu" });

  const formatted = formatPhoneE164(phone);

  try {
    await sendPhoneVerificationCode(formatted);
    return res.status(200).json({ message: "Kod SMS wysłany" });
  } catch (error) {
    console.error("[send-phone-code] Błąd:", error);
    const message = error instanceof Error ? error.message : "Błąd serwera";
    return res.status(500).json({ error: message });
  }
}
