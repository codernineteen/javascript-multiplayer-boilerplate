import type { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = authorization.split(" ")[1];

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT,
    });
    const payload = ticket.getPayload();
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default verifyToken;
