import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import { validatePassword } from "../utils/validatePassword.js";
import jwt from "jsonwebtoken";

const saltRounds = 12;

export const SignUp = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and Password are required" });
    }

    // Check if user exists (use the 'users' table)
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "This email is already associated with another account",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters, include upper and lower case letters, a number, and a special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user using schema
    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
        permissions: "user", // default user permissions },
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password_hash: _, ...safeUser } = newUser;

    return res.status(201).json({ success: true, data: safeUser, token });
  } catch (err) {
    next(err);
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password_hash: _, ...safeUser } = user;
    return res.status(200).json({
      success: true,
      data: safeUser,
      token,
    });
  } catch (err) {
    next(err);
  }
};
