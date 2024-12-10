import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import authMiddleware from "../middleware/authMiddleware";
import requireAdmin from "../middleware/requireAdmin";
import validator from "validator";

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  const { tel, password, name } = req.body;

  if (!validator.isMobilePhone(tel, "any")) {
    res.status(400).json({ error: "Invalid phone number format" });
    return;
  }

  if (!name || name.length < 3) {
    res.status(400).json({ error: "Name must be at least 3 characters long" });
    return;
  }

  if (!password || password.length < 8) {
    res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        tel,
        password: hashedPassword,
        isAdmin: false,
        name,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post(
  "/register-admin",
  // authMiddleware,
  // requireAdmin,
  async (req: Request, res: Response) => {
    const { tel, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await prisma.user.create({
        data: {
          tel,
          password: hashedPassword,
          isAdmin: true,
          name,
        },
      });
      res.status(201).json({
        message: "Admin registered successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { tel, password } = req.body;
    const user = await prisma.user.findUnique({ where: { tel } });

    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, userTel: user.tel, isAdmin: user.isAdmin },
      "my_secret_key",
      {
        expiresIn: "72h",
      }
    );
    res
      .status(200)
      .json({ message: "Login successful", token, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post(
  "/login-admin",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { tel, password } = req.body;
      const user = await prisma.user.findUnique({ where: { tel } });

      if (!user) {
        return res.status(401).json({ error: "Authentication failed" });
      }

      if (!user.isAdmin) {
        return res.status(401).json({ error: "Access denied: Admins only" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, userTel: user.tel, isAdmin: user.isAdmin },
        "my_secret_key",
        {
          expiresIn: "72h",
        }
      );
      res
        .status(200)
        .json({ message: "Login successful", token, isAdmin: user.isAdmin });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  }
);

export default router;
