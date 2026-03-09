import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { getOffersByRequest, getRequestById } from "@/services";

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = session.user as SessionUser;
  const userId = user.id || "";

  if (req.method === "GET") {
    const { requestId } = req.query;

    if (!requestId || typeof requestId !== "string") {
      return res.status(400).json({ error: "Request ID is required" });
    }

    try {
      const request = await getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      const userEmail = user.email || "";
      const hasAccess = request.userId === userId || request.userEmail === userEmail;
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }

      const offers = await getOffersByRequest(requestId);
      return res.status(200).json(offers);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch offers" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
