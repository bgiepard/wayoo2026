import type { NextApiRequest, NextApiResponse } from "next";
import { findUserByVerifyToken, markEmailAsVerified } from "@/services";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.redirect("/?verified=error");
  }

  const user = await findUserByVerifyToken(token);

  if (!user) {
    return res.redirect("/?verified=invalid");
  }

  if (user.emailVerifyTokenExpiresAt && new Date(user.emailVerifyTokenExpiresAt) < new Date()) {
    return res.redirect("/?verified=expired");
  }

  await markEmailAsVerified(user.id);

  return res.redirect("/?verified=1");
}
