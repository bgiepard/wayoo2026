import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { updateRequestStatus, getRequestById } from "@/services";
import type { RequestStatus } from "@/models";

interface SessionUser {
  id?: string;
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

  const { id } = req.query;
  const { status } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing request ID" });
  }

  const validStatuses: RequestStatus[] = ["draft", "published", "accepted", "completed", "canceled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const request = await getRequestById(id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  const userId = user.id || "";
  const userEmail = user.email || "";
  const hasAccess = request.userId === userId || request.userEmail === userEmail;
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    await updateRequestStatus(id, status);
    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error updating request status:", msg);
    return res.status(500).json({ error: "Failed to update status", detail: msg });
  }
}
