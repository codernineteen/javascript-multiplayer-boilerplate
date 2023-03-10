import { Router } from "express";
import passport from "passport";

const router = Router();

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({ error: false, message: "success", user: req.user });
  } else {
    res.status(403).json({ error: true, message: "Not authorized" });
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:5173/");
  }
);

export default router;
