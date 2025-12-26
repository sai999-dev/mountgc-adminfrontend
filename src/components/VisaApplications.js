import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Globe,
  ArrowLeft,
  Eye,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import PurchaseDetailModal from "./PurchaseDetailModal";

const VisaApplications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    completedPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    currency: "",
    dependents: "",
    mocks: "",
    actual_price: "",
    discounted_price: "",
    discount_percent: 20,
    duration_months: "1-2 months",
  });
  const [activeTab, setActiveTab] = useState("configs"); // configs | purchases
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setShowDetailModal(false);
    setSelectedPurchase(null);
  };

  const handlePurchaseUpdate = (updatedPurchase) => {
    setPurchases(
      purchases.map((p) =>
        p.purchase_id === updatedPurchase.purchase_id ? updatedPurchase : p
      )
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please login as admin first");
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [configsRes, purchasesRes, statsRes] = await Promise.all([
        axios.get("https://mountgc-backend.onrender.com/api/admin/visa-applications/configs", { headers }),
        axios.get("https://mountgc-backend.onrender.com/api/admin/visa-applications/purchases", { headers }),
        axios.get("https://mountgc-backend.onrender.com/api/admin/visa-applications/purchases/stats", { headers }),
      ]);

      if (configsRes.data.success) {
        setConfigs(configsRes.data.data);
      }

      if (purchasesRes.data.success) {
        setPurchases(purchasesRes.data.data);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitConfig = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("adminToken");
      const url = editingConfig
        ? `https://mountgc-backend.onrender.com/api/admin/visa-applications/configs/${editingConfig.config_id}`
        : "https://mountgc-backend.onrender.com/api/admin/visa-applications/configs";

      const method = editingConfig ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(editingConfig ? "Configuration updated!" : "Configuration created!");
        setShowConfigModal(false);
        setEditingConfig(null);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error(error.response?.data?.message || "Failed to save configuration");
    }
  };

  const handleEditConfig = (config) => {
    setEditingConfig(config);
    setFormData({
      currency: config.currency,
      dependents: config.dependents,
      mocks: config.mocks,
      actual_price: config.actual_price,
      discounted_price: config.discounted_price,
      discount_percent: config.discount_percent,
      duration_months: config.duration_months,
    });
    setShowConfigModal(true);
  };

  const handleDeleteConfig = async (configId) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `https://mountgc-backend.onrender.com/api/admin/visa-applications/configs/${configId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Configuration deleted!");
      fetchData();
    } catch (error) {
      console.error("Error deleting configuration:", error);
      toast.error("Failed to delete configuration");
    }
  };

  const handleUpdatePurchaseStatus = async (purchaseId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `https://mountgc-backend.onrender.com/api/admin/visa-applications/purchases/${purchaseId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Purchase status updated!");
      fetchData();
    } catch (error) {
      console.error("Error updating purchase status:", error);
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      currency: "",
      dependents: "",
      mocks: "",
      actual_price: "",
      discounted_price: "",
      discount_percent: 20,
      duration_months: "1-2 months",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update the field
    const updatedData = { ...formData, [name]: value };

    // Auto-calculate discount percentage when prices change
    if (name === "actual_price" || name === "discounted_price") {
      const actual = parseFloat(name === "actual_price" ? value : formData.actual_price);
      const discounted = parseFloat(name === "discounted_price" ? value : formData.discounted_price);

      if (actual > 0 && discounted > 0 && discounted < actual) {
        const discountPercent = ((actual - discounted) / actual * 100).toFixed(2);
        updatedData.discount_percent = parseFloat(discountPercent);
      }
    }

    setFormData(updatedData);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      initiated: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
              <Plane className="text-blue-600" />
              <span>Visa Application Management</span>
            </h1>
            <p className="text-gray-600 mt-1">Manage pricing configurations and visa applications</p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Applications</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalPurchases}</p>
              </div>
              <Plane className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedPayments}</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingPayments}</p>
              </div>
              <Clock className="text-yellow-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  ${stats.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
                </p>
              </div>
              <TrendingUp className="text-purple-500" size={40} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("configs")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === "configs"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <DollarSign className="inline mr-2" size={20} />
              Pricing Configurations
            </button>
            <button
              onClick={() => setActiveTab("purchases")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === "purchases"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Users className="inline mr-2" size={20} />
              Applications ({purchases.length})
            </button>
          </div>
        </div>

        {/* Pricing Configurations Tab */}
        {activeTab === "configs" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Pricing Configurations</h2>
              <button
                onClick={() => {
                  setEditingConfig(null);
                  resetForm();
                  setShowConfigModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Configuration</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dependents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mocks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actual Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Discounted Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Discount %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {configs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No configurations found. Click "Add Configuration" to create one.
                      </td>
                    </tr>
                  ) : (
                    configs.map((config) => (
                      <tr key={config.config_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-800">{config.currency}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {config.dependents}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {config.mocks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {config.currency} {Number(config.actual_price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                          {config.currency} {Number(config.discounted_price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                            {config.discount_percent}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {config.duration_months}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditConfig(config)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Edit configuration"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteConfig(config.config_id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete configuration"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "purchases" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Visa Applications</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                        No visa applications found yet.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr key={purchase.purchase_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          #{purchase.purchase_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {purchase.user?.username || purchase.name}
                            </p>
                            <p className="text-sm text-gray-500">{purchase.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <Globe size={14} className="text-gray-400" />
                            <span className="text-gray-600">{purchase.country}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-600">
                            <div>{purchase.currency}</div>
                            <div>Deps: {purchase.dependents}</div>
                            <div>Mocks: {purchase.mocks}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                          {purchase.currency} {Number(purchase.final_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(purchase.payment_status)}`}>
                            {purchase.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={purchase.status}
                            onChange={(e) => handleUpdatePurchaseStatus(purchase.purchase_id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="initiated">Initiated</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(purchase)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-semibold transition"
                          >
                            <Eye size={16} />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingConfig ? "Edit Configuration" : "Add Configuration"}
              </h3>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setEditingConfig(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Currency Code
                </label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  placeholder="e.g., USD, EUR, INR, GBP"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  maxLength="10"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter any currency code (e.g., USD, EUR, INR, GBP, CAD)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Dependents
                </label>
                <input
                  type="number"
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleChange}
                  placeholder="e.g., 0, 1, 2"
                  min="0"
                  max="10"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Typically 0, 1, or 2 dependents
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Mock Interviews
                </label>
                <input
                  type="number"
                  name="mocks"
                  value={formData.mocks}
                  onChange={handleChange}
                  placeholder="e.g., 1, 2, 3"
                  min="1"
                  max="10"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of mock interview sessions included
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Actual Price
                </label>
                <input
                  type="number"
                  name="actual_price"
                  value={formData.actual_price}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discounted Price
                </label>
                <input
                  type="number"
                  name="discounted_price"
                  value={formData.discounted_price}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Percentage
                  <span className="ml-2 text-xs font-normal text-blue-600">
                    (Auto-calculated ✨)
                  </span>
                </label>
                <input
                  type="number"
                  name="discount_percent"
                  value={formData.discount_percent}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                  required
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Automatically calculated from actual and discounted prices
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration_months"
                  value={formData.duration_months}
                  onChange={handleChange}
                  placeholder="e.g., 1-2 months"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <Save size={20} />
                  <span>{editingConfig ? "Update" : "Create"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigModal(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Detail Modal */}
      {showDetailModal && selectedPurchase && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          type="visa-application"
          onClose={handleModalClose}
          onUpdate={handlePurchaseUpdate}
        />
      )}
    </div>
  );
};

export default VisaApplications;
