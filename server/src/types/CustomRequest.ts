import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

export interface AuthenticatedAdminRequest extends Request {
  admin?: {
    adminId: string;
    role?: string;
  };
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}
