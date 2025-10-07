import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User,
  FileText,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllKYCSubmissions,
  getKYCSubmissionById,
  reviewKYCSubmission,
  getKYCStatistics
} from '@/services/kycService';

interface KYCSubmission {
  _id: string;
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  documents: Array<{
    type: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    uploadedAt: string;
  }>;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rejectionReason?: string;
  notes?: string;
}

interface KYCStats {
  totalSubmissions: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  thisMonthSubmissions: number;
  averageReviewTime: string;
  approvalRate: string;
}

const AdminKYCPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [stats, setStats] = useState<KYCStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchSubmissions();
    fetchStatistics();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await getAllKYCSubmissions({
        page: currentPage,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        search: searchTerm || undefined
      });
      console.log('KYC Submissions fetched:', response.submissions);
      response.submissions.forEach(sub => {
        console.log(`Submission ${sub._id}: status=${sub.status}, documents=${sub.documents.length}, canReview=${sub.status === 'submitted' || (sub.status === 'pending' && sub.documents.length > 0)}`);
      });
      setSubmissions(response.submissions);
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
      toast.error('Failed to fetch KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const statistics = await getKYCStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error fetching KYC statistics:', error);
    }
  };

  const handleViewSubmission = async (submissionId: string) => {
    try {
      const submission = await getKYCSubmissionById(submissionId);
      setSelectedSubmission(submission);
    } catch (error) {
      console.error('Error fetching submission details:', error);
      toast.error('Failed to fetch submission details');
    }
  };

  const handleReviewSubmission = async () => {
    if (!selectedSubmission) return;

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setReviewing(true);
      await reviewKYCSubmission(
        selectedSubmission._id,
        reviewAction,
        reviewAction === 'reject' ? rejectionReason : undefined,
        reviewNotes || undefined
      );

      toast.success(`KYC submission ${reviewAction}d successfully`);
      setShowReviewModal(false);
      setSelectedSubmission(null);
      setRejectionReason('');
      setReviewNotes('');
      fetchSubmissions();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error reviewing submission:', error);
      toast.error(error.response?.data?.message || 'Failed to review submission');
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canReview = (submission: KYCSubmission) => {
    return submission.status === 'submitted' || (submission.status === 'pending' && submission.documents.length > 0);
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            KYC Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage user identity verification submissions
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Approved</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="w-full"
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Submissions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.user.firstName && submission.user.lastName
                            ? `${submission.user.firstName} ${submission.user.lastName}`
                            : 'N/A'
                          }
                        </div>
                        <div className="text-sm text-gray-500">{submission.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(submission.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.documents.length} document(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.submittedAt ? formatDate(submission.submittedAt) : 'Not submitted'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      onClick={() => handleViewSubmission(submission._id)}
                      variant="outline"
                      className="px-3 py-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {canReview(submission) && (
                      <Button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowReviewModal(true);
                        }}
                        className="px-3 py-1"
                      >
                        Review
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {submissions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No KYC submissions</h3>
            <p className="mt-1 text-sm text-gray-500">
              No KYC submissions found matching your criteria.
            </p>
          </div>
        )}
      </Card>

      {/* Submission Detail Modal */}
      {selectedSubmission && !showReviewModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">KYC Submission Details</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 font-medium">
                        {selectedSubmission.user.firstName && selectedSubmission.user.lastName
                          ? `${selectedSubmission.user.firstName} ${selectedSubmission.user.lastName}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 font-medium">{selectedSubmission.user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedSubmission.status)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>
                      <span className="ml-2 font-medium">
                        {selectedSubmission.submittedAt ? formatDate(selectedSubmission.submittedAt) : 'Not submitted'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSubmission.documents.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {doc.type === 'drivers_license' ? 'Driver\'s License' : 'International Passport'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(doc.uploadedAt)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {doc.frontImageUrl && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Front:</p>
                              <img
                                src={doc.frontImageUrl}
                                alt="Document front"
                                className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-75"
                                onClick={() => window.open(doc.frontImageUrl, '_blank')}
                              />
                            </div>
                          )}

                          {doc.backImageUrl && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Back:</p>
                              <img
                                src={doc.backImageUrl}
                                alt="Document back"
                                className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-75"
                                onClick={() => window.open(doc.backImageUrl, '_blank')}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review History */}
                {selectedSubmission.reviewedAt && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Review History</h4>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-gray-500">Reviewed by:</span>
                        <span className="ml-2 font-medium">
                          {selectedSubmission.reviewedBy
                            ? `${selectedSubmission.reviewedBy.firstName} ${selectedSubmission.reviewedBy.lastName}`
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Reviewed at:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedSubmission.reviewedAt)}</span>
                      </div>
                      {selectedSubmission.rejectionReason && (
                        <div>
                          <span className="text-gray-500">Rejection reason:</span>
                          <p className="mt-1 text-red-600 bg-red-50 p-2 rounded text-sm">
                            {selectedSubmission.rejectionReason}
                          </p>
                        </div>
                      )}
                      {selectedSubmission.notes && (
                        <div>
                          <span className="text-gray-500">Notes:</span>
                          <p className="mt-1 bg-white p-2 rounded text-sm border">
                            {selectedSubmission.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {canReview(selectedSubmission) && (
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setReviewAction('reject');
                        setShowReviewModal(true);
                      }}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setReviewAction('approve');
                        setShowReviewModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {reviewAction === 'approve' ? 'Approve' : 'Reject'} KYC Submission
                </h3>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setRejectionReason('');
                    setReviewNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to {reviewAction} this KYC submission from {selectedSubmission.user.email}?
                </p>

                {reviewAction === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Any additional notes for this review..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    onClick={() => {
                      setShowReviewModal(false);
                      setRejectionReason('');
                      setReviewNotes('');
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReviewSubmission}
                    disabled={reviewing || (reviewAction === 'reject' && !rejectionReason.trim())}
                    className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  >
                    {reviewing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {reviewAction === 'approve' ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        {reviewAction === 'approve' ? 'Approve' : 'Reject'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYCPage;