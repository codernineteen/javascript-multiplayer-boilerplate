import { Router } from "express";
import verifyToken from "../middleware/auth";

const router = Router();

router.get("/status", verifyToken, (req, res) => {
  res.json(req.user);
});

export default router;
