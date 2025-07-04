import bcrypt from "bcryptjs";
import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { User } from "../types/userType";
import { generateToken } from "../utils/generateToken";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const prisma = new PrismaClient();

export const register: RequestHandler = async (req, res) => {
  try {
    // Take user data from request body
    const { name, email, password, role }: User = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      res.status(400).json({
        error: "Undefined fields. Name, email, password and role are required.",
      });
      return;
    }

    // Role validation
    const validRoles = ["USER", "ORGANIZER"];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        error: "Invalid role. Role must be USER or ORGANIZER.",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: "Invalid email format.",
      });
      return;
    }

    // Password validation
    if (password.length < 6) {
      res.status(400).json({
        error: "Password must be at least 6 characters long.",
      });
      return;
    }

    // Check if user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        error: "This email is already registered.",
      });
      return;
    }

    // Hash the user password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in the database

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
      },
    });
    // Remove password from the response
    const { password: _, ...userWithoutPassword } = newUser;

    // Create JWT token
    const token = generateToken({
      _id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        error: "Email and password fields are required",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: "Invalid email format.",
      });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        error: "Invalid email or password",
      });
      return;
    }

    // Check hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({
        error: "Invalid email or password",
      });
      return;
    }

    // JWT token oluştur
    const token = generateToken({
      _id: user.id,
      email: user.email,
      role: user.role,
    });

    // Şifreyi response'dan çıkar
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
