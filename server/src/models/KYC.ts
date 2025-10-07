import mongoose, { Document, Schema } from 'mongoose';

export interface IKYCDocument extends Document {
  user: mongoose.Types.ObjectId;
  type: 'drivers_license' | 'passport';
  frontImageUrl: string;
  backImageUrl?: string;
  frontImageKey: string; // Cloudinary public ID
  backImageKey?: string; // Cloudinary public ID
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: {
    originalName: string;
    size: number;
    mimeType: string;
  };
}

export interface IKYC extends Document {
  user: mongoose.Types.ObjectId;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  documents: IKYCDocument[];
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId; // Admin who reviewed
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KYCDocumentSchema = new Schema<IKYCDocument>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['drivers_license', 'passport'],
    required: true
  },
  frontImageUrl: {
    type: String,
    required: true
  },
  backImageUrl: {
    type: String,
    required: false
  },
  frontImageKey: {
    type: String,
    required: true
  },
  backImageKey: {
    type: String,
    required: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  metadata: {
    originalName: String,
    size: Number,
    mimeType: String
  }
}, {
  timestamps: true
});

const KYCSchema = new Schema<IKYC>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One KYC record per user
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'rejected'],
    default: 'pending'
  },
  documents: [KYCDocumentSchema],
  submittedAt: {
    type: Date,
    required: false
  },
  reviewedAt: {
    type: Date,
    required: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin user
    required: false
  },
  rejectionReason: {
    type: String,
    required: false,
    maxlength: 500
  },
  notes: {
    type: String,
    required: false,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
// Note: user field already has an index due to unique: true constraint
KYCSchema.index({ status: 1 });
KYCSchema.index({ submittedAt: 1 });
KYCSchema.index({ reviewedAt: 1 });

// Virtual for checking if documents are uploaded
KYCSchema.virtual('hasDocuments').get(function () {
  return this.documents && this.documents.length > 0;
});

// Virtual for getting approved documents count
KYCSchema.virtual('approvedDocumentsCount').get(function () {
  return this.documents ? this.documents.filter(doc => doc.status === 'approved').length : 0;
});

// Static methods
KYCSchema.statics.findByUserId = function (userId: string) {
  return this.findOne({ user: userId }).populate('reviewedBy', 'firstName lastName email');
};

KYCSchema.statics.findPendingSubmissions = function () {
  return this.find({ status: 'submitted' })
    .populate('user', 'firstName lastName email phone')
    .populate('reviewedBy', 'firstName lastName email')
    .sort({ submittedAt: -1 });
};

// Instance methods
KYCSchema.methods.canSubmitForReview = function () {
  return this.status === 'pending' && this.documents && this.documents.length > 0;
};

KYCSchema.methods.canUploadDocuments = function () {
  return this.status === 'pending' || this.status === 'rejected';
};

KYCSchema.methods.approve = function (adminId: string, notes?: string) {
  this.status = 'approved';
  this.reviewedAt = new Date();
  this.reviewedBy = adminId;
  if (notes) this.notes = notes;
  return this.save();
};

KYCSchema.methods.reject = function (adminId: string, reason: string, notes?: string) {
  this.status = 'rejected';
  this.reviewedAt = new Date();
  this.reviewedBy = adminId;
  this.rejectionReason = reason;
  if (notes) this.notes = notes;
  return this.save();
};

KYCSchema.methods.submitForReview = function () {
  if (!this.canSubmitForReview()) {
    throw new Error('Cannot submit KYC for review at this time');
  }
  this.status = 'submitted';
  this.submittedAt = new Date();
  return this.save();
};

// Pre-save middleware
KYCSchema.pre('save', function (next) {
  // If status is being changed to approved, update user's KYC status
  if (this.isModified('status') && this.status === 'approved') {
    // This will be handled in the controller to update the user's kyc.status
  }
  next();
});

export const KYCDocument = mongoose.model<IKYCDocument>('KYCDocument', KYCDocumentSchema);
export const KYC = mongoose.model<IKYC>('KYC', KYCSchema);

export default KYC;