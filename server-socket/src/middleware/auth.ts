import type { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../db/models/user.model";

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

    let user = await User.findOne({
      name: payload?.name,
      email: payload?.email,
    });

    if (!user) {
      user = new User({
        googleId: payload?.sub,
        name: payload?.name,
        email: payload?.email,
        photos: payload?.picture,
        provider: "google",
      });

      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default verifyToken;
