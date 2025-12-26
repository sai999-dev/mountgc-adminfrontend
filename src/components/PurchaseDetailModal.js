import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Save,
  Edit2,
  CheckCircle,
  Clock,
  Package,
  Globe,
  Users as UsersIcon,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const PurchaseDetailModal = ({ purchase, type, onClose, onUpdate }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState(purchase.admin_notes || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(purchase.status);
  const [caseStatus, setCaseStatus] = useState(purchase.case_status);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url =
        type === "research-paper"
          ? `https://mountgc-backend.onrender.com/api/admin/research-papers/purchases/${purchase.purchase_id}/status`
          : `https://mountgc-backend.onrender.com/api/admin/visa-applications/purchases/${purchase.purchase_id}`;

      const response = await axios.put(
        url,
        {
          admin_notes: adminNotes,
          status: status,
          case_status: caseStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Notes and status updated successfully!");
        setIsEditingNotes(false);
        if (onUpdate) onUpdate(response.data.data);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      initiated: { bg: "bg-blue-100", text: "text-blue-700", label: "Initiated" },
      in_progress: { bg: "bg-purple-100", text: "text-purple-700", label: "In Progress" },
      completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
    };
    const config = statusConfig[status] || statusConfig.initiated;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
      completed: { bg: "bg-green-100", text: "text-green-700", label: "Paid" },
      failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
    };
    const config = statusConfig[paymentStatus] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {type === "research-paper" ? "Research Paper" : "Visa Application"} Details
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Purchase ID: #{purchase.purchase_id} | Order ID: {purchase.order_id || "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              <User className="mr-2" size={20} />
              Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <User className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-gray-800">{purchase.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{purchase.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">{purchase.phone || "Not provided"}</p>
                </div>
              </div>
              {purchase.user && (
                <div className="flex items-center">
                  <User className="text-gray-400 mr-3" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="font-medium text-gray-800">{purchase.user.username}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              <Package className="mr-2" size={20} />
              Purchase Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type === "research-paper" ? (
                <>
                  <div className="flex items-center">
                    <UsersIcon className="text-gray-400 mr-3" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Co-Authors</p>
                      <p className="font-medium text-gray-800">{purchase.co_authors}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-gray-400 mr-3" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Research Group</p>
                      <p className="font-medium text-gray-800">
                        {purchase.research_group ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <Globe className="text-gray-400 mr-3" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Country</p>
                      <p className="font-medium text-gray-800">{purchase.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="text-gray-400 mr-3" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Dependents</p>
                      <p className="font-medium text-gray-800">{purchase.dependents}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="text-gray-400 mr-3" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Mock Interviews</p>
                      <p className="font-medium text-gray-800">{purchase.mocks}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-gray-400 mr-3" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Visa Guarantee</p>
                      <p className="font-medium text-gray-800">
                        {purchase.visa_guarantee ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center">
                <DollarSign className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Currency</p>
                  <p className="font-medium text-gray-800">{purchase.currency}</p>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Final Amount</p>
                  <p className="font-medium text-gray-800">
                    {purchase.currency} {purchase.final_amount.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium text-gray-800">{purchase.duration}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="text-gray-400 mr-3" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Purchased On</p>
                  <p className="font-medium text-gray-800">{formatDate(purchase.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              <CheckCircle className="mr-2" size={20} />
              Status Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="initiated">Initiated</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Status
                </label>
                <select
                  value={caseStatus}
                  onChange={(e) => setCaseStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <div className="py-2">{getPaymentStatusBadge(purchase.payment_status)}</div>
              </div>
            </div>
          </div>

          {/* Admin Notes Section */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center text-gray-800">
                <FileText className="mr-2" size={20} />
                Admin Notes (Private)
              </h3>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit2 size={16} />
                  <span>Edit Notes</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add your private notes here... (visible only to admins)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-32"
                  rows={6}
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setAdminNotes(purchase.admin_notes || "");
                      setIsEditingNotes(false);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap">
                {adminNotes || (
                  <p className="text-gray-400 italic">No notes added yet. Click Edit to add notes.</p>
                )}
              </div>
            )}
          </div>

          {/* Student Notes (if any) */}
          {purchase.notes && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold mb-2 flex items-center text-gray-800">
                <MessageSquare className="mr-2" size={20} />
                Student Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{purchase.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;
