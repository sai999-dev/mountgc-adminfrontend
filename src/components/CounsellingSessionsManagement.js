import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const CounsellingSessionsManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [pricingConfigs, setPricingConfigs] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    completedPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });

  const [activeTab, setActiveTab] = useState("purchases");

  // Modal states
  const [showServiceTypeModal, setShowServiceTypeModal] = useState(false);
  const [showCounsellorModal, setShowCounsellorModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Editing states
  const [editingServiceType, setEditingServiceType] = useState(null);
  const [editingCounsellor, setEditingCounsellor] = useState(null);
  const [editingPricing, setEditingPricing] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);

  // Form data
  const [serviceTypeForm, setServiceTypeForm] = useState({
    name: "",
    description: "",
    duration: "1 hour",
    is_active: true,
    display_order: 0,
  });

  const [counsellorForm, setCounsellorForm] = useState({
    name: "",
    role: "",
    email: "",
    bio: "",
    is_active: true,
  });

  const [pricingForm, setPricingForm] = useState({
    service_type_id: "",
    counselor_id: "",
    currency: "USD",
    actual_price: 0,
    discount_percent: 0,
    discounted_price: 0,
    is_active: true,
  });

  // Auto-calculate discounted price when actual_price or discount_percent changes
  const handlePricingChange = (field, value) => {
    const newForm = { ...pricingForm, [field]: value };

    if (field === 'actual_price' || field === 'discount_percent') {
      const actualPrice = field === 'actual_price' ? parseFloat(value) || 0 : parseFloat(newForm.actual_price) || 0;
      const discountPercent = field === 'discount_percent' ? parseFloat(value) || 0 : parseFloat(newForm.discount_percent) || 0;
      newForm.discounted_price = Math.round((actualPrice - (actualPrice * discountPercent / 100)) * 100) / 100;
    }

    setPricingForm(newForm);
  };

  const [purchaseForm, setPurchaseForm] = useState({
    status: "pending",
    admin_notes: "",
    meeting_link: "",
  });

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

      const [serviceTypesRes, counsellorsRes, pricingRes, purchasesRes] = await Promise.all([
        axios.get("https://mountgc-backend.onrender.com/api/counselling/admin/service-types", { headers }),
        axios.get("https://mountgc-backend.onrender.com/api/counselling/admin/counselors", { headers }),
        axios.get("https://mountgc-backend.onrender.com/api/counselling/admin/pricing", { headers }),
        axios.get("https://mountgc-backend.onrender.com/api/counselling/admin/purchases", { headers }),
      ]);

      if (serviceTypesRes.data.success) setServiceTypes(serviceTypesRes.data.data || []);
      if (counsellorsRes.data.success) setCounsellors(counsellorsRes.data.data || []);
      if (pricingRes.data.success) setPricingConfigs(pricingRes.data.data || []);
      if (purchasesRes.data.success) {
        const purchasesData = purchasesRes.data.data || [];
        setPurchases(purchasesData);

        // Calculate stats
        const completedPayments = purchasesData.filter(p => p.payment_status === "completed").length;
        const totalRevenue = purchasesData
          .filter(p => p.payment_status === "completed")
          .reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);

        setStats({
          totalPurchases: purchasesData.length,
          completedPayments,
          pendingPayments: purchasesData.length - completedPayments,
          totalRevenue,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Service Type handlers
  const handleSubmitServiceType = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingServiceType
        ? `https://mountgc-backend.onrender.com/api/counselling/admin/service-types/${editingServiceType.service_type_id}`
        : "https://mountgc-backend.onrender.com/api/counselling/admin/service-types";
      const method = editingServiceType ? "put" : "post";

      await axios[method](url, serviceTypeForm, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(editingServiceType ? "Service type updated!" : "Service type created!");
      setShowServiceTypeModal(false);
      setEditingServiceType(null);
      resetServiceTypeForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save service type");
    }
  };

  const handleDeleteServiceType = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service type?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`https://mountgc-backend.onrender.com/api/counselling/admin/service-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Service type deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete service type");
    }
  };

  // Counsellor handlers
  const handleSubmitCounsellor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingCounsellor
        ? `https://mountgc-backend.onrender.com/api/counselling/admin/counselors/${editingCounsellor.counselor_id}`
        : "https://mountgc-backend.onrender.com/api/counselling/admin/counselors";
      const method = editingCounsellor ? "put" : "post";

      await axios[method](url, counsellorForm, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(editingCounsellor ? "Counsellor updated!" : "Counsellor created!");
      setShowCounsellorModal(false);
      setEditingCounsellor(null);
      resetCounsellorForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save counsellor");
    }
  };

  const handleDeleteCounsellor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this counsellor?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`https://mountgc-backend.onrender.com/api/counselling/admin/counselors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Counsellor deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete counsellor");
    }
  };

  // Pricing handlers
  const handleSubmitPricing = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingPricing
        ? `https://mountgc-backend.onrender.com/api/counselling/admin/pricing/${editingPricing.id}`
        : "https://mountgc-backend.onrender.com/api/counselling/admin/pricing";
      const method = editingPricing ? "put" : "post";

      const data = {
        ...pricingForm,
        service_type_id: parseInt(pricingForm.service_type_id),
        counselor_id: parseInt(pricingForm.counselor_id),
        actual_price: parseFloat(pricingForm.actual_price),
        discount_percent: parseFloat(pricingForm.discount_percent),
        discounted_price: parseFloat(pricingForm.discounted_price),
      };

      await axios[method](url, data, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(editingPricing ? "Pricing updated!" : "Pricing created!");
      setShowPricingModal(false);
      setEditingPricing(null);
      resetPricingForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save pricing");
    }
  };

  const handleDeletePricing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pricing?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`https://mountgc-backend.onrender.com/api/counselling/admin/pricing/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Pricing deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete pricing");
    }
  };

  // Purchase handlers
  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `https://mountgc-backend.onrender.com/api/counselling/admin/purchases/${editingPurchase.id}`,
        purchaseForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Purchase updated!");
      setShowPurchaseModal(false);
      setEditingPurchase(null);
      resetPurchaseForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update purchase");
    }
  };

  // Reset forms
  const resetServiceTypeForm = () => {
    setServiceTypeForm({ name: "", description: "", duration: "1 hour", is_active: true, display_order: 0 });
  };

  const resetCounsellorForm = () => {
    setCounsellorForm({ name: "", role: "", email: "", bio: "", is_active: true });
  };

  const resetPricingForm = () => {
    setPricingForm({ service_type_id: "", counselor_id: "", currency: "USD", actual_price: 0, discount_percent: 0, discounted_price: 0, is_active: true });
  };

  const resetPurchaseForm = () => {
    setPurchaseForm({ status: "pending", admin_notes: "", meeting_link: "" });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
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
              <MessageSquare className="text-green-600" />
              <span>Counselling Sessions Management</span>
            </h1>
            <p className="text-gray-600 mt-1">Manage service types, counsellors, pricing, and student purchases</p>
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
                <p className="text-gray-600 text-sm">Total Purchases</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalPurchases}</p>
              </div>
              <MessageSquare className="text-green-500" size={40} />
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
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="text-purple-500" size={40} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: "purchases", label: "Purchases", icon: Users },
              { id: "service-types", label: "Service Types", icon: MessageSquare },
              { id: "counsellors", label: "Counsellors", icon: UserCheck },
              { id: "pricing", label: "Pricing", icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-semibold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <tab.icon className="inline mr-2" size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Purchases Tab */}
        {activeTab === "purchases" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Counselling Purchases</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Counsellor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                        No counselling purchases found yet.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-800">{purchase.order_id}</td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{purchase.user?.username || purchase.name}</p>
                            <p className="text-xs text-gray-500">{purchase.user?.email || purchase.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{purchase.service_type?.name || "N/A"}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{purchase.counselor?.name || "N/A"}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-800">
                          {purchase.currency} {purchase.amount_paid}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            purchase.payment_status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {purchase.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(purchase.status)}`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setEditingPurchase(purchase);
                              setPurchaseForm({
                                status: purchase.status,
                                admin_notes: purchase.admin_notes || "",
                                meeting_link: purchase.meeting_link || "",
                              });
                              setShowPurchaseModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={18} />
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

        {/* Service Types Tab */}
        {activeTab === "service-types" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Service Types</h2>
              <button
                onClick={() => {
                  setEditingServiceType(null);
                  resetServiceTypeForm();
                  setShowServiceTypeModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Service Type</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {serviceTypes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No service types found. Click "Add Service Type" to create one.
                      </td>
                    </tr>
                  ) : (
                    serviceTypes.map((type) => (
                      <tr key={type.service_type_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-800">{type.name}</td>
                        <td className="px-6 py-4 text-gray-600">{type.description || "-"}</td>
                        <td className="px-6 py-4 text-gray-600">{type.duration || "1 hour"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            type.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {type.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingServiceType(type);
                                setServiceTypeForm({
                                  name: type.name,
                                  description: type.description || "",
                                  duration: type.duration || "1 hour",
                                  is_active: type.is_active,
                                  display_order: type.display_order,
                                });
                                setShowServiceTypeModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteServiceType(type.service_type_id)}
                              className="text-red-600 hover:text-red-800"
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

        {/* Counsellors Tab */}
        {activeTab === "counsellors" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Counsellors</h2>
              <button
                onClick={() => {
                  setEditingCounsellor(null);
                  resetCounsellorForm();
                  setShowCounsellorModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Counsellor</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {counsellors.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No counsellors found. Click "Add Counsellor" to create one.
                      </td>
                    </tr>
                  ) : (
                    counsellors.map((counsellor) => (
                      <tr key={counsellor.counselor_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-800">{counsellor.name}</td>
                        <td className="px-6 py-4 text-gray-600">{counsellor.role || "-"}</td>
                        <td className="px-6 py-4 text-gray-600">{counsellor.email || "-"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            counsellor.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {counsellor.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingCounsellor(counsellor);
                                setCounsellorForm({
                                  name: counsellor.name,
                                  role: counsellor.role || "",
                                  email: counsellor.email || "",
                                  bio: counsellor.bio || "",
                                  is_active: counsellor.is_active,
                                });
                                setShowCounsellorModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCounsellor(counsellor.counselor_id)}
                              className="text-red-600 hover:text-red-800"
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

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Pricing Configurations</h2>
              <button
                onClick={() => {
                  setEditingPricing(null);
                  resetPricingForm();
                  setShowPricingModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Pricing</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Counsellor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pricingConfigs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No pricing found. Click "Add Pricing" to create one.
                      </td>
                    </tr>
                  ) : (
                    pricingConfigs.map((pricing) => (
                      <tr key={pricing.config_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-800">{pricing.service_type?.name || "N/A"}</td>
                        <td className="px-6 py-4 text-gray-600">{pricing.counselor?.name || "N/A"}</td>
                        <td className="px-6 py-4 text-gray-600">{pricing.currency}</td>
                        <td className="px-6 py-4 text-gray-600">{pricing.actual_price}</td>
                        <td className="px-6 py-4 text-orange-600 font-semibold">{pricing.discount_percent || 0}%</td>
                        <td className="px-6 py-4 font-semibold text-green-600">{pricing.discounted_price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            pricing.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {pricing.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingPricing({ ...pricing, id: pricing.config_id });
                                const discountPercent = pricing.actual_price > 0
                                  ? Math.round((1 - pricing.discounted_price / pricing.actual_price) * 100)
                                  : 0;
                                setPricingForm({
                                  service_type_id: pricing.service_type_id,
                                  counselor_id: pricing.counselor_id,
                                  currency: pricing.currency,
                                  actual_price: pricing.actual_price,
                                  discount_percent: discountPercent,
                                  discounted_price: pricing.discounted_price,
                                  is_active: pricing.is_active,
                                });
                                setShowPricingModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeletePricing(pricing.config_id)}
                              className="text-red-600 hover:text-red-800"
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
      </div>

      {/* Service Type Modal */}
      {showServiceTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingServiceType ? "Edit Service Type" : "Add Service Type"}
              </h3>
              <button onClick={() => setShowServiceTypeModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitServiceType} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={serviceTypeForm.name}
                  onChange={(e) => setServiceTypeForm({ ...serviceTypeForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={serviceTypeForm.description}
                  onChange={(e) => setServiceTypeForm({ ...serviceTypeForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  value={serviceTypeForm.duration}
                  onChange={(e) => setServiceTypeForm({ ...serviceTypeForm, duration: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 1 hour, 30 minutes"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active_service"
                  checked={serviceTypeForm.is_active}
                  onChange={(e) => setServiceTypeForm({ ...serviceTypeForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-green-600"
                />
                <label htmlFor="is_active_service" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center space-x-2">
                  <Save size={20} />
                  <span>{editingServiceType ? "Update" : "Create"}</span>
                </button>
                <button type="button" onClick={() => setShowServiceTypeModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Counsellor Modal */}
      {showCounsellorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingCounsellor ? "Edit Counsellor" : "Add Counsellor"}
              </h3>
              <button onClick={() => setShowCounsellorModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitCounsellor} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={counsellorForm.name}
                  onChange={(e) => setCounsellorForm({ ...counsellorForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={counsellorForm.role}
                  onChange={(e) => setCounsellorForm({ ...counsellorForm, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Senior Counsellor"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={counsellorForm.email}
                  onChange={(e) => setCounsellorForm({ ...counsellorForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea
                  value={counsellorForm.bio}
                  onChange={(e) => setCounsellorForm({ ...counsellorForm, bio: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active_counsellor"
                  checked={counsellorForm.is_active}
                  onChange={(e) => setCounsellorForm({ ...counsellorForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-green-600"
                />
                <label htmlFor="is_active_counsellor" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center space-x-2">
                  <Save size={20} />
                  <span>{editingCounsellor ? "Update" : "Create"}</span>
                </button>
                <button type="button" onClick={() => setShowCounsellorModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingPricing ? "Edit Pricing" : "Add Pricing"}
              </h3>
              <button onClick={() => setShowPricingModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitPricing} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Type *</label>
                <select
                  value={pricingForm.service_type_id}
                  onChange={(e) => setPricingForm({ ...pricingForm, service_type_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Service Type</option>
                  {serviceTypes.map((type) => (
                    <option key={type.service_type_id} value={type.service_type_id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Counsellor *</label>
                <select
                  value={pricingForm.counselor_id}
                  onChange={(e) => setPricingForm({ ...pricingForm, counselor_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Counsellor</option>
                  {counsellors.map((c) => (
                    <option key={c.counselor_id} value={c.counselor_id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Currency *</label>
                <select
                  value={pricingForm.currency}
                  onChange={(e) => setPricingForm({ ...pricingForm, currency: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Price *</label>
                  <input
                    type="number"
                    value={pricingForm.actual_price}
                    onChange={(e) => handlePricingChange('actual_price', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount %</label>
                  <input
                    type="number"
                    value={pricingForm.discount_percent}
                    onChange={(e) => handlePricingChange('discount_percent', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Final Price</label>
                  <input
                    type="number"
                    value={pricingForm.discounted_price}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-green-600 font-semibold"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active_pricing"
                  checked={pricingForm.is_active}
                  onChange={(e) => setPricingForm({ ...pricingForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-green-600"
                />
                <label htmlFor="is_active_pricing" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center space-x-2">
                  <Save size={20} />
                  <span>{editingPricing ? "Update" : "Create"}</span>
                </button>
                <button type="button" onClick={() => setShowPricingModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Edit Modal */}
      {showPurchaseModal && editingPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Edit Purchase</h3>
              <button onClick={() => setShowPurchaseModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Purchase Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Order: <span className="font-semibold text-gray-800">{editingPurchase.order_id}</span></p>
              <p className="text-sm text-gray-600">Student: <span className="font-semibold text-gray-800">{editingPurchase.user?.username || editingPurchase.name}</span></p>
              <p className="text-sm text-gray-600">Email: <span className="font-semibold text-gray-800">{editingPurchase.user?.email || editingPurchase.email}</span></p>
              <p className="text-sm text-gray-600">Service: <span className="font-semibold text-gray-800">{editingPurchase.service_type?.name}</span></p>
              <p className="text-sm text-gray-600">Counsellor: <span className="font-semibold text-gray-800">{editingPurchase.counselor?.name}</span></p>
              <p className="text-sm text-gray-600">Amount: <span className="font-semibold text-green-600">{editingPurchase.currency} {editingPurchase.amount_paid}</span></p>
              {editingPurchase.student_notes && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Student Notes:</p>
                  <p className="text-sm text-gray-800 italic">"{editingPurchase.student_notes}"</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitPurchase} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={purchaseForm.status}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Link</label>
                <input
                  type="url"
                  value={purchaseForm.meeting_link}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, meeting_link: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={purchaseForm.admin_notes}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, admin_notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Internal notes about this counselling session..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center space-x-2">
                  <Save size={20} />
                  <span>Update</span>
                </button>
                <button type="button" onClick={() => setShowPurchaseModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellingSessionsManagement;
