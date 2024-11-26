import express, { Request, Response } from "express";
import prisma from "../prisma";
import authMiddleware from "../middleware/authMiddleware";
import requireAdmin from "../middleware/requireAdmin";
import path from "path";
import multer from "multer";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/rooms");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post(
  "/create",
  authMiddleware,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { number, name, description, price } = req.body;

    try {
      const room = await prisma.room.create({
        data: {
          number,
          name,
          description,
          price,
        },
      });

      res.status(201).json({ message: "Room created successfully", room });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

router.delete(
  "/delete",
  authMiddleware,
  requireAdmin,
  async (req: Request, res: Response) => {
    const roomId = parseInt(req.query.id as string, 10);

    try {
      const room = await prisma.room.findUnique({
        where: { id: Number(roomId) },
      });
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      await prisma.room.delete({ where: { id: Number(roomId) } });

      res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

router.put(
  "/edit",
  authMiddleware,
  requireAdmin,
  async (req: Request, res: Response) => {
    const roomId = parseInt(req.query.id as string, 10);
    const { number, name, description, price } = req.body;

    try {
      const room = await prisma.room.findUnique({
        where: { id: Number(roomId) },
      });
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      const updatedRoom = await prisma.room.update({
        where: { id: Number(roomId) },
        data: { number, name, description, price },
      });

      res
        .status(200)
        .json({ message: "Room updated successfully", room: updatedRoom });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

// Image functions

router.post(
  "/add-image",
  authMiddleware,
  requireAdmin,
  upload.array("images", 5),
  async (req: Request | any, res: Response) => {
    const roomId = parseInt(req.body.roomId, 10);

    try {
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      const currentImages = room.imgs ? room.imgs.split(",") : [];

      const newImages = req.files.map((file: Express.Multer.File) => {
        const normalizedPath = file.path.replace(/\\/g, "/"); // Normalize slashes
        return normalizedPath.split("uploads/")[1]
          ? "/uploads/" + normalizedPath.split("uploads/")[1]
          : normalizedPath;
      });

      if (currentImages.length + newImages.length > 10) {
        res.status(400).json({
          error: `Cannot upload more than 10 images for a room.`,
        });
        return;
      }

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          imgs: [...currentImages, ...newImages].join(","),
        },
      });

      res.status(200).json({
        message: "Images added successfully",
        room: updatedRoom,
      });
    } catch (error) {
      console.error("Error adding images:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

router.delete(
  "/delete-image",
  authMiddleware,
  requireAdmin,
  async (req: Request, res: Response) => {
    const roomId = parseInt(req.body.roomId, 10);
    const imageUrl = req.body.imageUrl; // Image to delete

    try {
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      const currentImages = room.imgs ? room.imgs.split(",") : [];
      const imageIndex = currentImages.indexOf(imageUrl);

      if (imageIndex === -1) {
        res.status(404).json({ error: "Image not found in room" });
        return;
      }

      // Remove image from list
      const updatedImages = currentImages.filter(
        (_, index) => index !== imageIndex
      );

      // Update room in database
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: { imgs: updatedImages.join(",") },
      });

      // Remove image file from storage
      const imagePath = path.join(
        __dirname,
        "../uploads/rooms",
        imageUrl.replace("/uploads/rooms/", "")
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      res.status(200).json({
        message: "Image deleted successfully",
        room: updatedRoom,
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

router.put(
  "/edit-image",
  authMiddleware,
  requireAdmin,
  upload.single("image"),
  async (req: Request | any, res: Response) => {
    const roomId = parseInt(req.body.roomId, 10);
    const oldImageUrl = req.body.oldImageUrl;

    try {
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      const currentImages = room.imgs ? room.imgs.split(",") : [];
      const imageIndex = currentImages.indexOf(oldImageUrl);

      if (imageIndex === -1) {
        res.status(404).json({ error: "Old image not found in room" });
        return;
      }

      // Normalize and add the new image
      const newImagePath = req.file.path.replace(/\\/g, "/"); // Normalize slashes
      const newImageUrl = newImagePath.split("uploads/")[1]
        ? "/uploads/" + newImagePath.split("uploads/")[1]
        : newImagePath;

      // Replace old image with the new one
      currentImages[imageIndex] = newImageUrl;

      // Update room in database
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: { imgs: currentImages.join(",") },
      });

      // Remove old image file from storage
      const oldImagePath = path.join(
        __dirname,
        "../uploads/rooms",
        oldImageUrl.replace("/uploads/rooms/", "")
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      res.status(200).json({
        message: "Image updated successfully",
        room: updatedRoom,
      });
    } catch (error) {
      console.error("Error updating image:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

export default router;
