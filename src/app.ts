import express, { Request, Response } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import infoRoutes from "./routes/info";
import userRoutes from "./routes/users";
import roomRoutes from "./routes/rooms";
import uploadRoutes from "./routes/uploads";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/info", infoRoutes);
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/uploads", uploadRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json("Hey, you just got hacked!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
