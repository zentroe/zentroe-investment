// src/controllers/authController.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { sendConfirmationEmail } from "../utils/emailHandler";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check for existing user
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
    });

    await user.save();

    // JWT for auth cookie
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "3d",
    });

    // Set cookie
    res.cookie("jwt-zentroe", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // Email confirmation token
    const emailConfirmationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const confirmationLink = `${process.env.CLIENT_URL}/confirm-email?token=${emailConfirmationToken}`;

    // Send confirmation email (outside response flow)
    sendConfirmationEmail(email, name, confirmationLink).catch((emailError) =>
      console.error("Error sending email confirmation:", emailError)
    );

    res.status(201).json({ message: "User registered successfully" });

  } catch (error: any) {
    console.error("Error in signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const login: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password." });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({ message: "Please confirm your email to log in." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password." });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "3d",
    });

    res.cookie("jwt-zentroe", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Logged in successfully" });
  } catch (error: any) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({ message: "Token is required." });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const userId = decoded.userId;

    // Update user's isEmailVerified field
    const user = await User.findByIdAndUpdate(
      userId,
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      res.status(400).json({ message: "Invalid or expired token." });
      return;
    }

    res.status(200).json({ message: "Email confirmed successfully! You can now log in." });
  } catch (error: any) {
    console.error("Error confirming email:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie("jwt-zentroe");
  res.status(200).json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - req.user is set by your protectRoute middleware
    res.status(200).json(req.user);
  } catch (error: any) {
    console.error("Error in getCurrentUser controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
