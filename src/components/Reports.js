import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");

    if (!token || !user) {
      toast.error("Please login as admin first");
      navigate("/admin/login");
      return;
    }

    setAdminUser(JSON.parse(user));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-sm text-gray-500">Analytics and reporting dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Coming Soon
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            The Reports feature is currently under development. Soon you'll be able to view comprehensive analytics,
            generate detailed reports, and track important metrics for your platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">User Analytics</h3>
              <p className="text-sm text-gray-600">Track user growth, engagement, and activity patterns</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Revenue Reports</h3>
              <p className="text-sm text-gray-600">Monitor bookings, transactions, and financial metrics</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Performance Insights</h3>
              <p className="text-sm text-gray-600">Analyze service performance and user satisfaction</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
