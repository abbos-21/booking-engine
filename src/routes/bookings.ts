import express, { Request, Response } from "express";
import prisma from "../prisma";
import authMiddleware from "../middleware/authMiddleware";
import requireAdmin from "../middleware/requireAdmin";

const router = express.Router();

router.post(
  "/create",
  //   authMiddleware,
  //   requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { userId, roomId } = req.body;

      const room = await prisma.room.findUnique({ where: { id: roomId } });

      if (!room || !room.isAvailable) {
        res.status(400).json({ error: "Room is not available" });
        return;
      }

      const booking = await prisma.booking.create({
        data: {
          userId,
          roomId,
        },
      });

      await prisma.room.update({
        where: { id: roomId },
        data: {
          isAvailable: false,
        },
      });

      res.status(201).json(booking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
