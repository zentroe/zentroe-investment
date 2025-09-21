import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { User } from '../models/User';
import Deposit from '../models/Deposit';
import { SimpleCardPayment } from '../models/SimpleCardPayment';
import InvestmentPlan from '../models/InvestmentPlan';

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find admin
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const adminLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('adminToken');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).admin.adminId;
    const admin = await Admin.findById(adminId).select('-password');

    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    res.json({ admin });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({ message: 'Admin with this email already exists' });
      return;
    }

    // Create new admin
    const admin = new Admin({
      email,
      password,
      name,
      role: role || 'admin'
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get deposit statistics
    const totalDeposits = await Deposit.countDocuments();
    const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });
    const approvedDeposits = await Deposit.countDocuments({ status: 'approved' });
    const rejectedDeposits = await Deposit.countDocuments({ status: 'rejected' });

    // Get card payment statistics
    const totalCardPayments = await SimpleCardPayment.countDocuments();
    const pendingCardPayments = await SimpleCardPayment.countDocuments({ status: 'pending' });

    // Get payment method breakdown from deposits
    const cryptoPayments = await Deposit.countDocuments({ paymentMethod: 'crypto' });
    const bankTransfers = await Deposit.countDocuments({ paymentMethod: 'bank' });
    const cardPayments = await Deposit.countDocuments({ paymentMethod: 'card' });

    // Calculate total amount (sum of approved deposits)
    const totalAmountResult = await Deposit.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    res.json({
      totalUsers,
      totalDeposits,
      pendingDeposits,
      approvedDeposits,
      rejectedDeposits,
      totalCardPayments,
      pendingCardPayments,
      cryptoPayments,
      bankTransfers,
      cardPayments,
      totalAmount
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent deposits with user info
    const recentDeposits = await Deposit.find()
      .populate('userId', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('_id amount paymentMethod status updatedAt userId');

    // Format for frontend
    const activities = recentDeposits.map(deposit => ({
      id: deposit._id,
      type: 'deposit',
      action: deposit.status,
      amount: deposit.amount,
      paymentMethod: deposit.paymentMethod,
      user: deposit.userId ? {
        name: `${(deposit.userId as any).firstName || ''} ${(deposit.userId as any).lastName || ''}`.trim(),
        email: (deposit.userId as any).email
      } : null,
      timestamp: deposit.updatedAt
    }));

    res.json({ activities });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ===== INVESTMENT PLAN MANAGEMENT =====

export const createInvestmentPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).admin.adminId;

    const investmentPlan = new InvestmentPlan({
      ...req.body,
      createdBy: adminId,
      updatedBy: adminId
    });

    await investmentPlan.save();

    res.status(201).json({
      message: 'Investment plan created successfully',
      investmentPlan
    });
  } catch (error) {
    console.error('Create investment plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllInvestmentPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isActive } = req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const investmentPlans = await InvestmentPlan.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ priority: -1, createdAt: -1 });

    res.json({ investmentPlans });
  } catch (error) {
    console.error('Get investment plans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInvestmentPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const investmentPlan = await InvestmentPlan.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!investmentPlan) {
      res.status(404).json({ message: 'Investment plan not found' });
      return;
    }

    res.json({ investmentPlan });
  } catch (error) {
    console.error('Get investment plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateInvestmentPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).admin.adminId;

    const investmentPlan = await InvestmentPlan.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedBy: adminId
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!investmentPlan) {
      res.status(404).json({ message: 'Investment plan not found' });
      return;
    }

    res.json({
      message: 'Investment plan updated successfully',
      investmentPlan
    });
  } catch (error) {
    console.error('Update investment plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteInvestmentPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const investmentPlan = await InvestmentPlan.findByIdAndDelete(id);

    if (!investmentPlan) {
      res.status(404).json({ message: 'Investment plan not found' });
      return;
    }

    res.json({ message: 'Investment plan deleted successfully' });
  } catch (error) {
    console.error('Delete investment plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleInvestmentPlanStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).admin.adminId;

    const investmentPlan = await InvestmentPlan.findById(id);

    if (!investmentPlan) {
      res.status(404).json({ message: 'Investment plan not found' });
      return;
    }

    investmentPlan.isActive = !investmentPlan.isActive;
    investmentPlan.updatedBy = adminId;
    await investmentPlan.save();

    res.json({
      message: `Investment plan ${investmentPlan.isActive ? 'activated' : 'deactivated'} successfully`,
      investmentPlan
    });
  } catch (error) {
    console.error('Toggle investment plan status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
