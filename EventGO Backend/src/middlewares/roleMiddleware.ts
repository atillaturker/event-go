import { NextFunction, Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

type UserRole = "USER" | "ORGANIZER";

// Only organizer role middleware
export const requireOrganizer = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.role !== "ORGANIZER") {
    res.status(403).json({
      error: "Organizer role is required for this action",
    });
    return;
  }

  next();
};

// Only user role middleware
export const requireUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "USER") {
    return res.status(403).json({
      error: "User role is required for this action",
    });
  }

  next();
};

// General middleware to check for specific roles
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        error: "You do not have sufficient permissions for this action",
      });
    }

    next();
  };
};
