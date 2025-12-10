import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Edit,
  Eye,
  Plus,
  Save,
  X,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const TermsManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    research_paper: 0,
    visa_application: 0,
  });
  const [activeTab, setActiveTab] = useState("terms"); // terms | agreements
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit | view
  const [formData, setFormData] = useState({
    service_type: "research_paper",
    title: "",
    content: "",
  });
  const [selectedTerms, setSelectedTerms] = useState(null);

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

      const [termsRes, agreementsRes, statsRes] = await Promise.all([
        axios.get("https://mountgc-backend.onrender.com/api/admin/terms", { headers }),
        axios.get("https://mountgc-backend.onrender.com/api/admin/agreements", { headers }),
        axios.get("https://mountgc-backend.onrender.com/api/admin/agreements/stats", { headers }),
      ]);

      if (termsRes.data.success) setTerms(termsRes.data.data);
      if (agreementsRes.data.success) setAgreements(agreementsRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTerms = () => {
    setModalMode("create");
    setFormData({
      service_type: "research_paper",
      title: "",
      content: "",
    });
    setShowModal(true);
  };

  const handleEditTerms = (term) => {
    setModalMode("edit");
    setSelectedTerms(term);
    setFormData({
      service_type: term.service_type,
      title: term.title,
      content: term.content,
    });
    setShowModal(true);
  };

  const handleViewTerms = (term) => {
    setModalMode("view");
    setSelectedTerms(term);
    setFormData({
      service_type: term.service_type,
      title: term.title,
      content: term.content,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      if (modalMode === "create") {
        await axios.post(
          "https://mountgc-backend.onrender.com/api/admin/terms",
          formData,
          { headers }
        );
        toast.success("Terms created successfully!");
      } else if (modalMode === "edit") {
        await axios.put(
          `https://mountgc-backend.onrender.com/api/admin/terms/${selectedTerms.terms_id}`,
          { title: formData.title, content: formData.content },
          { headers }
        );
        toast.success("Terms updated successfully!");
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Error saving terms:", error);
      toast.error(error.response?.data?.message || "Failed to save terms");
    }
  };

  const handleActivateVersion = async (termsId) => {
    if (!window.confirm("Activate this version? This will deactivate all other versions.")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `https://mountgc-backend.onrender.com/api/admin/terms/${termsId}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Terms version activated!");
      fetchData();
    } catch (error) {
      console.error("Error activating terms:", error);
      toast.error("Failed to activate terms version");
    }
  };

  const getServiceTypeBadge = (serviceType) => {
    const colors = {
      research_paper: "bg-blue-100 text-blue-800",
      visa_application: "bg-purple-100 text-purple-800",
    };
    const labels = {
      research_paper: "Research Paper",
      visa_application: "Visa Application",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[serviceType]}`}>
        {labels[serviceType]}
      </span>
    );
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Terms & Conditions Management</h1>
            <p className="text-gray-600 mt-1">Manage terms and view user agreements</p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Agreements</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
              </div>
              <FileText className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Research Paper</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.research_paper}</p>
              </div>
              <Users className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Visa Application</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.visa_application}</p>
              </div>
              <Users className="text-purple-500" size={40} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === "terms"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FileText className="inline mr-2" size={20} />
              Terms & Conditions
            </button>
            <button
              onClick={() => setActiveTab("agreements")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === "agreements"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Users className="inline mr-2" size={20} />
              User Agreements ({agreements.length})
            </button>
          </div>
        </div>

        {/* Terms Tab */}
        {activeTab === "terms" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Terms & Conditions</h2>
              <button
                onClick={handleCreateTerms}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Create New Terms</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {terms.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No terms found. Click "Create New Terms" to add one.
                      </td>
                    </tr>
                  ) : (
                    terms.map((term) => (
                      <tr key={term.terms_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{getServiceTypeBadge(term.service_type)}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{term.title}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-gray-100 px-2 py-1 rounded text-sm">v{term.version}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {term.is_active ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(term.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewTerms(term)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditTerms(term)}
                              className="text-yellow-600 hover:text-yellow-800 transition"
                              title="Edit (creates new version)"
                            >
                              <Edit size={18} />
                            </button>
                            {!term.is_active && (
                              <button
                                onClick={() => handleActivateVersion(term.terms_id)}
                                className="text-green-600 hover:text-green-800 transition"
                                title="Activate this version"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
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

        {/* Agreements Tab */}
        {activeTab === "agreements" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">User Agreements</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signature</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terms Version</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agreed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agreements.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No user agreements found yet.
                      </td>
                    </tr>
                  ) : (
                    agreements.map((agreement) => (
                      <tr key={agreement.agreement_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{agreement.user.username}</p>
                            <p className="text-sm text-gray-500">{agreement.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getServiceTypeBadge(agreement.service_type)}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{agreement.signed_name}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm text-gray-600">{agreement.terms.title}</p>
                            <p className="text-xs text-gray-500">v{agreement.terms.version}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {agreement.ip_address || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(agreement.agreed_at).toLocaleString()}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {modalMode === "create" && "Create New Terms"}
                {modalMode === "edit" && "Edit Terms (Creates New Version)"}
                {modalMode === "view" && "View Terms"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Type</label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={modalMode === "view" || modalMode === "edit"}
                >
                  <option value="research_paper">Research Paper</option>
                  <option value="visa_application">Visa Application</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Research Paper Service Agreement"
                  required
                  disabled={modalMode === "view"}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content (Terms & Conditions)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="15"
                  placeholder="Enter the complete terms and conditions text..."
                  required
                  disabled={modalMode === "view"}
                />
              </div>

              {modalMode !== "view" && (
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center space-x-2"
                  >
                    <Save size={20} />
                    <span>{modalMode === "create" ? "Create" : "Update (New Version)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {modalMode === "view" && (
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
                >
                  Close
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsManagement;
