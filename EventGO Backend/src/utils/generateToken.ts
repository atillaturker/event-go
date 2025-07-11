import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (user: {
  _id: string;
  email: string;
  role: string; // "USER" | "ORGANIZER"
}) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }

  try {
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "2h", algorithm: "HS256" }
    );

    console.log("Generated token:", token);
    return token;
  } catch (err) {
    console.error("Error signing token:", err);
    throw new Error("Error signing token");
  }
};
