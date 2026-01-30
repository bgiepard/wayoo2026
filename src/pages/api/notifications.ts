import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import {
  getNotificationsByUserId,
  markAllNotificationsAsRead,
  createNotification,
} from "@/services";

interface SessionUser {
  id?: string;
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

  if (!userId) {
    return res.status(401).json({ error: "User ID not found" });
  }

  // GET - pobierz powiadomienia użytkownika
  if (req.method === "GET") {
    try {
      const notifications = await getNotificationsByUserId(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }

  // POST - utwórz nowe powiadomienie (używane przez Pusher webhook lub wewnętrznie)
  if (req.method === "POST") {
    const { type, title, message, link } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const notification = await createNotification({
        userId,
        type,
        title,
        message,
        link,
      });
      return res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      return res.status(500).json({ error: "Failed to create notification" });
    }
  }

  // PATCH - oznacz wszystkie jako przeczytane
  if (req.method === "PATCH") {
    try {
      await markAllNotificationsAsRead(userId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      return res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
