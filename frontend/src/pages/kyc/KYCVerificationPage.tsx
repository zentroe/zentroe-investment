import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/context/UserContext';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Shield,
  CreditCard,
  IdCard
} from 'lucide-react';
import { toast } from 'sonner';
import { getUserKYCStatus, uploadKYCDocument, submitKYCVerification } from '../../services/kycService';

interface KYCDocument {
  type: 'drivers_license' | 'passport';
  frontImage?: File;
  backImage?: File;
  frontImageUrl?: string;
  backImageUrl?: string;
}

interface KYCStatus {
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documents?: {
    type: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    uploadedAt: string;
  }[];
}

const KYCVerificationPage: React.FC = () => {
  const { refreshUser } = useUser();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<'drivers_license' | 'passport'>('drivers_license');
  const [documents, setDocuments] = useState<KYCDocument>({
    type: 'drivers_license'
  });
  const [dragOver, setDragOver] = useState<{ front: boolean; back: boolean }>({
    front: false,
    back: false
  });

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      setLoading(true);
      const status = await getUserKYCStatus();
      setKycStatus(status);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      toast.error('Failed to fetch KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentTypeChange = (type: 'drivers_license' | 'passport') => {
    setSelectedDocumentType(type);
    setDocuments({
      type,
      frontImage: undefined,
      backImage: undefined
    });
  };

  const handleFileUpload = async (file: File, side: 'front' | 'back') => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      // Show compression progress
      toast.info('Compressing image...');

      // Compress the image
      const compressedFile = await compressImage(file);

      // Log compression results
      const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
      const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
      console.log(`Original size: ${originalSizeMB}MB → Compressed size: ${compressedSizeMB}MB`);

      // Final validation - ensure compressed file is under 5MB for base64 encoding
      const maxCompressedSize = 5 * 1024 * 1024; // 5MB
      if (compressedFile.size > maxCompressedSize) {
        toast.error('Image is too large even after compression. Please use a smaller image or lower quality photo.');
        return;
      }

      setDocuments(prev => ({
        ...prev,
        [side === 'front' ? 'frontImage' : 'backImage']: compressedFile
      }));

      toast.success(`Image compressed from ${originalSizeMB}MB to ${compressedSizeMB}MB and uploaded successfully`);
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.error('Failed to process image. Please try again.');
    }
  };

  const removeFile = (side: 'front' | 'back') => {
    setDocuments(prev => ({
      ...prev,
      [side === 'front' ? 'frontImage' : 'backImage']: undefined
    }));
  };

  const handleDragOver = (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [side]: true }));
  };

  const handleDragLeave = (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [side]: false }));
  };

  const handleDrop = async (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [side]: false }));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files[0], side);
    }
  };

  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg', // Convert to JPEG for better compression
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uploadDocuments = async () => {
    if (!documents.frontImage) {
      toast.error('Please upload the front side of your document');
      return;
    }

    // For driver's license, back image is required
    if (selectedDocumentType === 'drivers_license' && !documents.backImage) {
      toast.error('Please upload the back side of your driver\'s license');
      return;
    }

    try {
      setUploading(true);

      // Convert files to base64
      const frontImageBase64 = await convertFileToBase64(documents.frontImage);
      let backImageBase64: string | undefined;

      if (documents.backImage) {
        backImageBase64 = await convertFileToBase64(documents.backImage);
      }

      const uploadData = {
        documentType: selectedDocumentType,
        frontImage: frontImageBase64,
        backImage: backImageBase64
      };

      await uploadKYCDocument(uploadData);
      toast.success('Documents uploaded successfully');

      // Refresh KYC status
      await fetchKYCStatus();

      // Clear uploaded files
      setDocuments({
        type: selectedDocumentType
      });

    } catch (error: any) {
      console.error('Error uploading documents:', error);
      toast.error(error.response?.data?.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const submitForReview = async () => {
    try {
      setSubmitting(true);
      await submitKYCVerification();
      toast.success('KYC documents submitted for review');

      // Refresh KYC status and user data
      await fetchKYCStatus();
      await refreshUser();

    } catch (error: any) {
      console.error('Error submitting KYC for review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit for review');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'submitted':
        return <Badge className="bg-primary/10 text-primary"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const canUploadDocuments = () => {
    return kycStatus?.status === 'pending' || kycStatus?.status === 'rejected' || !kycStatus;
  };

  const canSubmitForReview = () => {
    return kycStatus?.status === 'pending' && kycStatus?.documents && kycStatus.documents.length > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
              <p className="text-gray-600">
                Verify your identity to enable withdrawals and full account access
              </p>
            </div>
          </div>

          {kycStatus && (
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
              <div>
                <h3 className="font-medium text-gray-900">Verification Status</h3>
                <p className="text-sm text-gray-600">
                  Current status of your identity verification
                </p>
              </div>
              {getStatusBadge(kycStatus.status)}
            </div>
          )}
        </div>

        {/* KYC Status Messages */}
        {kycStatus?.status === 'approved' && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Identity Verified</h3>
                <p className="text-green-700">
                  Your identity has been successfully verified. You can now access all platform features including withdrawals.
                </p>
              </div>
            </div>
          </Card>
        )}

        {kycStatus?.status === 'rejected' && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Verification Rejected</h3>
                <p className="text-red-700 mb-2">
                  Your identity verification was rejected. Please review the feedback and resubmit your documents.
                </p>
                {kycStatus.rejectionReason && (
                  <p className="text-red-600 text-sm bg-red-100 p-2 rounded">
                    <strong>Reason:</strong> {kycStatus.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {kycStatus?.status === 'submitted' && (
          <Card className="p-6 mb-6 bg-primary/10 border-primary/20">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold text-primary">Under Review</h3>
                <p className="text-primary/80">
                  Your documents are currently under review. We'll notify you once the verification is complete.
                  This usually takes 1-3 business days.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Document Upload Section */}
        {canUploadDocuments() && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Identity Documents</h3>
            <p className="text-gray-600 mb-6">
              Please select and upload a valid government-issued ID to verify your identity.
            </p>

            {/* Document Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Document Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleDocumentTypeChange('drivers_license')}
                  className={`p-4 border-2 rounded-lg transition-colors ${selectedDocumentType === 'drivers_license'
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Driver's License</h4>
                      <p className="text-sm text-gray-600">Government-issued driver's license</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDocumentTypeChange('passport')}
                  className={`p-4 border-2 rounded-lg transition-colors ${selectedDocumentType === 'passport'
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <IdCard className="w-6 h-6 text-gray-600" />
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">International Passport</h4>
                      <p className="text-sm text-gray-600">Valid international passport</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* File Upload Areas */}
            <div className="space-y-4">
              {/* Front Side Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedDocumentType === 'passport' ? 'Passport Photo Page' : 'Front Side'}
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${dragOver.front
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}
                  onDragOver={(e) => handleDragOver(e, 'front')}
                  onDragLeave={(e) => handleDragLeave(e, 'front')}
                  onDrop={(e) => handleDrop(e, 'front')}
                >
                  {documents.frontImage ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{documents.frontImage.name}</p>
                          <p className="text-xs text-gray-500">
                            {(documents.frontImage.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile('front')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="flex flex-col items-center">
                        <label htmlFor="front-upload" className="cursor-pointer">
                          <span className="text-primary hover:text-primary/80">Click to upload</span>
                          <span className="text-gray-500"> or drag and drop</span>
                        </label>
                        <input
                          id="front-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) await handleFileUpload(file, 'front');
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 10MB (auto-compressed)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Side Upload (for driver's license only) */}
              {selectedDocumentType === 'drivers_license' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back Side
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 transition-colors ${dragOver.back
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                    onDragOver={(e) => handleDragOver(e, 'back')}
                    onDragLeave={(e) => handleDragLeave(e, 'back')}
                    onDrop={(e) => handleDrop(e, 'back')}
                  >
                    {documents.backImage ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{documents.backImage.name}</p>
                            <p className="text-xs text-gray-500">
                              {(documents.backImage.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile('back')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <div className="flex flex-col items-center">
                          <label htmlFor="back-upload" className="cursor-pointer">
                            <span className="text-primary hover:text-primary/80">Click to upload</span>
                            <span className="text-gray-500"> or drag and drop</span>
                          </label>
                          <input
                            id="back-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) await handleFileUpload(file, 'back');
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 10MB (auto-compressed)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="mt-6">
              <Button
                onClick={uploadDocuments}
                disabled={
                  uploading ||
                  !documents.frontImage ||
                  (selectedDocumentType === 'drivers_license' && !documents.backImage)
                }
                className="w-full py-3"
              >
                {uploading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Uploading Documents...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Uploaded Documents */}
        {kycStatus?.documents && kycStatus.documents.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
            <div className="space-y-4">
              {kycStatus.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {doc.type === 'drivers_license' ? 'Driver\'s License' : 'International Passport'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>

            {/* Submit for Review Button */}
            {canSubmitForReview() && (
              <div className="mt-6">
                <Button
                  onClick={submitForReview}
                  disabled={submitting}
                  className="w-full py-3"
                >
                  {submitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting for Review...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Information Card */}
        <Card className="p-6 bg-gray-100 border-gray-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Important Information</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Ensure all information on your ID is clearly visible and readable</li>
                <li>• Photos should be taken in good lighting without glare or shadows</li>
                <li>• Your document must be valid and not expired</li>
                <li>• Processing typically takes 1-3 business days</li>
                <li>• You must complete KYC verification to enable withdrawals</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default KYCVerificationPage;