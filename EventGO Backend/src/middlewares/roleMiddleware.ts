import { NextFunction, Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

type UserRole = "USER" | "ORGANIZER";

// Sadece organizatörler için middleware
export const requireOrganizer = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Kimlik doğrulaması gerekli" });
  }

  if (req.user.role !== "ORGANIZER") {
    return res.status(403).json({
      error: "Bu işlem için organizatör yetkisi gerekli",
    });
  }

  next();
};

// Sadece kullanıcılar için middleware
export const requireUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Kimlik doğrulaması gerekli" });
  }

  if (req.user.role !== "USER") {
    return res.status(403).json({
      error: "Bu işlem için kullanıcı yetkisi gerekli",
    });
  }

  next();
};

// Belirli rolleri kontrol eden genel middleware
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Kimlik doğrulaması gerekli" });
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        error: "Bu işlem için yeterli yetkiniz yok",
      });
    }

    next();
  };
};

// Hem kullanıcı hem organizatör erişebilir
export const requireAnyRole = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Kimlik doğrulaması gerekli" });
  }

  // Geçerli bir role sahipse devam et
  const validRoles: UserRole[] = ["USER", "ORGANIZER"];
  if (!validRoles.includes(req.user.role as UserRole)) {
    return res.status(403).json({
      error: "Geçerli bir rol bulunamadı",
    });
  }

  next();
};
