import type { NextApiRequest, NextApiResponse } from "next";
import { updateRequestStatus } from "@/services";
import type { RequestStatus } from "@/models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const { status } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing request ID" });
  }

  const validStatuses: RequestStatus[] = ["draft", "published", "accepted", "paid", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    await updateRequestStatus(id, status);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating request status:", error);
    return res.status(500).json({ error: "Failed to update status" });
  }
}
