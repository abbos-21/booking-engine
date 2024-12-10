import express, { Request, Response } from "express";
import prisma from "../prisma";
import authMiddleware from "../middleware/authMiddleware";
import requireAdmin from "../middleware/requireAdmin";

const router = express.Router();

router.get(
  "/users",
  authMiddleware,
  requireAdmin,
  async (req: Request, res: Response) => {
    const userId = parseInt(req.query.id as string, 10);

    if (userId) {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      res.status(200).json(user);
    } else {
      const users = await prisma.user.findMany();
      res.status(200).json(users);
    }
  }
);

router.get(
  "/admins",
  authMiddleware,
  requireAdmin,
  async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      where: {
        isAdmin: true,
      },
    });
    res.status(200).json(users);
  }
);

router.get("/rooms", async (req: Request, res: Response) => {
  const roomId = parseInt(req.query.id as string, 10);

  if (roomId) {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });
    res.status(200).json(room);
  } else {
    const rooms = await prisma.room.findMany();
    res.status(200).json(rooms);
  }
});

router.get(
  "/bookings",
  //   authMiddleware,
  //   requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const bookings = await prisma.booking.findMany({
        include: { room: true, user: true },
      });

      res.status(200).json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
