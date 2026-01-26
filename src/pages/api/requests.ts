import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { createRequest } from "@/lib/airtable";

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = session.user as SessionUser;
  const userId = user.id || "";
  const userEmail = user.email || "";

  const { from, to, date, time, adults, children, options } = req.body;

  if (!from || !to || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const request = await createRequest(userId, userEmail, {
      from,
      to,
      date,
      time,
      adults,
      children,
      options,
    });

    return res.status(201).json({ id: request.id });
  } catch (error) {
    console.error("Error creating request:", error);
    return res.status(500).json({ error: "Failed to create request" });
  }
}
