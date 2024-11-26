import express, { Request, Response } from "express";
import prisma from "../prisma";
import authMiddleware from "../middleware/authMiddleware";
import requireAdmin from "../middleware/requireAdmin";

const router = express.Router();

router.delete(
  "/delete",
  authMiddleware,
  requireAdmin,
  async (req: Request, res: Response) => {
    const userId = parseInt(req.query.id as string, 10);

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    try {
      const deletedUser = await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      res
        .status(200)
        .json({ message: "User deleted successfully", user: deletedUser });

      return;
    } catch (error: any) {
      if (error.code === "P2001") {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });

      return;
    }
  }
);

export default router;
