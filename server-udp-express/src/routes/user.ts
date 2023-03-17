import { Router } from "express";
import verifyToken from "../ middlewares/auth.js";

const router = Router();

router.get("/logout", (req, res, next) => {
  console.log("유저가 로그아웃을 요청");
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect(`${process.env.CLIENT_URL}`);
  });
});

router.get("/status", verifyToken, (req, res) => {
  console.log(req.user);
  res.json(req.user);
});

export default router;
