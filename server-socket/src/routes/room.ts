import { v4 as uuidv4 } from "uuid";

import { Router } from "express";

const router = Router();

// router.get("/", (req, res) => {
//   res.redirect(`${process.env.CLIENT_URI}/classroom-pannel/${uuidv4()}`);
// });

// router.get("/:room", (req, res) => {
//   res.json({ roomId: req.params.room });
// });

export default router;
