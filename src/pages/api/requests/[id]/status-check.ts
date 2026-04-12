import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestById } from "@/services";

// Lekki endpoint do sprawdzenia aktualnego statusu zlecenia (używany przez polling po powrocie ze Stripe)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Brak ID zlecenia" });
  }

  const request = await getRequestById(id);
  if (!request) {
    return res.status(404).json({ error: "Zlecenie nie istnieje" });
  }

  return res.status(200).json({ status: request.status });
}
