import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

export interface AuthenticatedAdminRequest extends Request {
  admin: {
    adminId: string;
    email: string;
    role: string;
  };
}

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('=== ADMIN AUTH MIDDLEWARE ===');
    console.log('Request URL:', req.originalUrl);
    console.log('All cookies received:', req.cookies);
    console.log('Headers:', req.headers.cookie);

    const token = req.cookies.adminToken;
    console.log('Admin Token:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('❌ No admin token provided');
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log('Decoded admin token:', decoded);

      // Check if admin still exists and is active
      const admin = await Admin.findById(decoded.adminId).select('-password');
      console.log('Admin found:', admin ? 'Yes' : 'No');

      if (!admin || !admin.isActive) {
        console.log('❌ Admin not found or inactive');
        res.status(401).json({ message: 'Access denied. Invalid admin.' });
        return;
      }

      (req as AuthenticatedAdminRequest).admin = {
        adminId: decoded.adminId,
        email: decoded.email,
        role: decoded.role
      };

      console.log('✅ Admin authenticated:', (req as AuthenticatedAdminRequest).admin);
      next();
    } catch (error) {
      console.log('❌ Token verification failed:', error);
      res.status(401).json({ message: 'Access denied. Invalid token.' });
      return;
    }
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const adminReq = req as AuthenticatedAdminRequest;

  if (adminReq.admin.role !== 'super_admin') {
    res.status(403).json({ message: 'Access denied. Super admin role required.' });
    return;
  }

  next();
};
