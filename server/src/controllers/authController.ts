import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { sendConfirmationEmail } from "../utils/emailHandler";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
    });

    await user.save();

    const confirmToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const confirmationLink = `${process.env.FRONTEND_URL}/confirm/${confirmToken}`;

    await sendConfirmationEmail(user.email, user.name, confirmationLink);

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};
