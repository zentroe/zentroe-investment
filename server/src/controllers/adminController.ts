import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { User } from '../models/User';
import { UserInvestment } from '../models/UserInvestment';
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

// ===== USER MANAGEMENT =====

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      kycStatus
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { firstName: { $regex: searchRegex } },
        { lastName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    // KYC status filter
    if (kycStatus && kycStatus !== 'all') {
      query['kyc.status'] = kycStatus;
    }

    // Fetch users with aggregation to include investment totals
    const users = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'userinvestments', // Make sure this matches your collection name
          localField: '_id',
          foreignField: 'user',
          as: 'investments'
        }
      },
      {
        $addFields: {
          kyc: {
            $ifNull: ["$kyc", { status: "pending" }]
          },
          totalInvested: {
            $sum: {
              $map: {
                input: { $filter: { input: '$investments', cond: { $eq: ['$$this.status', 'active'] } } },
                as: 'investment',
                in: '$$investment.amount'
              }
            }
          }
        }
      },
      { $project: { investments: 0, password: 0 } }, // Exclude sensitive data
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    ]);

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        total,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password') // Exclude password
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get user's investment total
    const investments = await UserInvestment.find({ user: userId, status: 'active' });
    const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0);

    res.json({
      success: true,
      data: {
        ...user,
        totalInvested
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const adminId = (req as any).admin.adminId;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    console.log(`Admin ${adminId} ${user.isActive ? 'activated' : 'deactivated'} user ${userId}`);

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        userId: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
};

export const updateUserKycStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status, notes } = req.body;
    const adminId = (req as any).admin.adminId;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid KYC status. Must be approved or rejected'
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update KYC status
    if (!user.kyc) {
      user.kyc = {
        status: status as "pending" | "approved" | "rejected",
        submittedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: adminId,
        notes
      };
    } else {
      user.kyc.status = status as "pending" | "approved" | "rejected";
      user.kyc.reviewedAt = new Date();
      user.kyc.reviewedBy = adminId;
      if (notes) {
        user.kyc.notes = notes;
      }
    }

    await user.save();

    console.log(`Admin ${adminId} ${status} KYC for user ${userId}`);

    // Send KYC status email
    const { sendKycStatusEmail } = require('../utils/emailHandler');
    try {
      const userName = `${user.firstName} ${user.lastName}`;
      await sendKycStatusEmail(user.email, userName, status, status === 'rejected' ? notes : '');
      console.log(`✅ KYC ${status} email sent to ${user.email}`);
    } catch (emailError) {
      console.error(`❌ Error sending KYC ${status} email:`, emailError);
    }

    res.json({
      success: true,
      message: `KYC status updated to ${status} successfully`,
      data: {
        userId: user._id,
        kycStatus: status,
        reviewedAt: user.kyc!.reviewedAt,
        reviewedBy: adminId
      }
    });
  } catch (error) {
    console.error('Update user KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update KYC status'
    });
  }
};

export const getUserInvestments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const investments = await UserInvestment.find({ user: userId })
      .populate('investmentPlan', 'name category profitPercentage duration')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: investments
    });
  } catch (error) {
    console.error('Get user investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user investments'
    });
  }
};
