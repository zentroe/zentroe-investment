// src/controllers/authController.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { sendConfirmationEmail } from "../utils/emailHandler";
// import { IUser } from "../models/User";
import { AuthenticatedRequest } from "../types/CustomRequest";

// interface AuthRequest extends Request {
//   user?: IUser;
// }

export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    res.status(400).json({ message: "A valid email is required." });
    return;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409).json({ message: "Email already exists." });
  } else {
    res.status(200).json({ available: true });
  }
};


export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
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
      email,
      password: hashedPassword,
      isEmailVerified: false,
      onboardingStatus: "started", // track onboarding progress
    });

    try {
      await user.save();
    } catch (err: any) {
      if (err.code === 11000) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }
      throw err; // rethrow for generic error handler below
    }

    // JWT for auth cookie
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "3d",
    });

    // Set cookie
    res.cookie("jwt-zentroe", token, {
      httpOnly: true,
      maxAge: Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use "none" for production, "lax" for local
      secure: process.env.NODE_ENV === "production" ? true : false, // Secure in production (HTTPS)
    });

    // Email confirmation token
    const emailConfirmationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const confirmationLink = `${process.env.CLIENT_URL}/confirm-email?token=${emailConfirmationToken}`;
    console.log("📧 Generated confirmation link:", confirmationLink.replace(emailConfirmationToken, "TOKEN_HIDDEN"));

    // Send confirmation email (fire-and-forget)
    sendConfirmationEmail(email, confirmationLink).catch((emailError) =>
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

    // Only require email verification if user has completed onboarding
    // This allows users to continue onboarding even with unverified email
    if (!user.isEmailVerified && user.onboardingStatus === "completed") {
      res.status(403).json({
        message: "Please verify your email to access your dashboard.",
        needsEmailVerification: true,
        email: user.email
      });
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
      maxAge: Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use "none" for production, "lax" for local
      secure: process.env.NODE_ENV === "production" ? true : false, // Secure in production (HTTPS)
    });

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Return user data with onboarding information for proper routing
    const userResponse = await User.findById(user._id).select("-password");

    res.status(200).json({
      message: "Logged in successfully",
      user: userResponse,
      needsEmailVerification: !user.isEmailVerified && user.onboardingStatus === "completed"
    });
  } catch (error: any) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      console.log("❌ No token provided in email confirmation");
      res.status(400).json({ message: "Token is required." });
      return;
    }

    console.log("🔍 Attempting to verify email confirmation token:", token.substring(0, 20) + "...");

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      console.log("✅ Token verified successfully for userId:", decoded.userId);
    } catch (jwtError: any) {
      console.log("❌ JWT verification failed:", jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        res.status(400).json({ message: "Confirmation link has expired. Please request a new one." });
      } else {
        res.status(400).json({ message: "Invalid confirmation link." });
      }
      return;
    }

    const userId = decoded.userId;

    // Update user's isEmailVerified field
    const user = await User.findByIdAndUpdate(
      userId,
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      console.log("❌ User not found for userId:", userId);
      res.status(400).json({ message: "Invalid or expired token." });
      return;
    }

    console.log("✅ Email confirmed successfully for user:", user.email);
    res.status(200).json({ message: "Email confirmed successfully! You can now log in." });
  } catch (error: any) {
    console.error("❌ Error confirming email:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const resendEmailVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      res.status(400).json({ message: "A valid email is required." });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      res.status(400).json({ message: "Email is already verified." });
      return;
    }

    // Generate new email confirmation token
    const emailConfirmationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const confirmationLink = `${process.env.CLIENT_URL}/confirm-email?token=${emailConfirmationToken}`;

    // Send confirmation email
    try {
      await sendConfirmationEmail(email, confirmationLink);
      res.status(200).json({ message: "Verification email sent successfully." });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

  } catch (error: any) {
    console.error("Error in resendEmailVerification:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie("jwt-zentroe");
  res.status(200).json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user?.userId).select(
      "-password"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error in getCurrentUser controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email; // Email changes should go through separate verification
    delete updateData.role; // Role changes should be admin only
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true, select: "-password" }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error in updateUserProfile controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOnboarding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("🟢 PATCH /auth/onboarding hit with data:", req.body);
  console.log("🟢 req.user:", req.user);

  try {
    if (!req.user) {
      console.log("🟠 req.user is undefined");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.userId;
    console.log("🟢 userId:", userId);

    // Determine onboarding status based on completed fields
    const updateData = { ...req.body };

    // Auto-update onboarding status based on progress
    if (updateData.firstName && updateData.lastName) {
      updateData.onboardingStatus = "basicInfo";
    }
    if (updateData.investmentGoal && updateData.riskTolerance) {
      updateData.onboardingStatus = "investmentProfile";
    }
    if (updateData.isAccreditedInvestor !== undefined) {
      updateData.onboardingStatus = "verification";
    }

    // Update onboarding step if provided
    if (updateData.onboardingStep !== undefined) {
      updateData.onboardingStep = Math.max(0, Math.min(12, updateData.onboardingStep));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Don't send password back - use select to exclude password
    const userResponse = await User.findById(userId).select("-password");

    res.status(200).json({
      message: "Onboarding data saved successfully",
      user: userResponse
    });
  } catch (error: any) {
    console.error("Error updating onboarding:", error.message);
    if (error.name === 'ValidationError') {
      res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const getOnboardingProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.userId;

    // Get user data excluding password
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Onboarding progress retrieved successfully",
      user: user
    });
  } catch (error: any) {
    console.error("Error getting onboarding progress:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


