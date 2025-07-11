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
    const { name, email, password, role = "USER" }: User = req.body;

    console.log("Request body:", req.body);

    // Validation
    if (!name || !email || !password || !role) {
      res.status(400).json({
        error: "Undefined fields. Name, email, password and role are required.",
      });
      return;
    }

    // Check if user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error:
          "This email is already registered. Please use a different email.",
      });
      return;
    }

    // Hash the user password
    console.log("Register - Original password:", password);
    console.log("Register - Password length:", password.length);

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Register - Hashed password:", hashedPassword);

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
    const token = await generateToken({
      _id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    console.log("Token:", token);

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

    if (!email || !password) {
      res.status(400).json({
        error: "Email and password fields are required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        error: "User not found. Please check your email or register.",
      });
      return;
    }

    // Check hashed password - Debug için log ekleyelim
    console.log("Login attempt:");
    console.log("Input password:", password);
    console.log("Input password type:", typeof password);
    console.log("Input password JSON:", JSON.stringify(password));
    console.log("Stored hashed password:", user.password);
    console.log("Stored password type:", typeof user.password);
    console.log("Password length:", password.length);

    // Test aynı şifreyi hash'leyip karşılaştırma
    const testHash = await bcrypt.hash(password, 10);
    console.log("Fresh hash of input password:", testHash);
    const testCompare = await bcrypt.compare(password, testHash);
    console.log("Fresh hash comparison result:", testCompare);

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isValidPassword);

    if (!isValidPassword) {
      res.status(401).json({
        error: "Invalid password. Please try again.",
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
