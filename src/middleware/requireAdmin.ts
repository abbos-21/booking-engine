import { Request, Response, NextFunction } from "express";

const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ error: "Access denied: Admins only" });
    return;
  }

  next();
};

export default requireAdmin;
