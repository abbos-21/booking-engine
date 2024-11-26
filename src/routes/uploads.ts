import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Uploads directory created");
}

router.use("/", express.static(path.join(__dirname, "../uploads")));

router.get("/", (req, res) => {
  res.status(200).json({ message: "Image server is running" });
});

export default router;
