import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { getRequestsByUserId, getRequestsByUserEmail } from "@/services";
import type { RequestStatus, RequestData } from "@/models";

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = session.user as SessionUser;
  const userId = user.id || "";
  const userEmail = user.email || "";
  const { status } = req.query;

  try {
    // Pobierz zlecenia po userId lub email
    let requests: RequestData[] = [];
    if (userId) {
      requests = await getRequestsByUserId(userId);
    }
    if (requests.length === 0 && userEmail) {
      requests = await getRequestsByUserEmail(userEmail);
    }

    // Filtruj po statusie jeśli podany
    if (status && typeof status === "string") {
      const statuses = status.split(",") as RequestStatus[];
      requests = requests.filter((r) => statuses.includes(r.status));
    }

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
}
