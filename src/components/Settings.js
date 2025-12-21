import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
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
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage system configuration and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <SettingsIcon className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Coming Soon
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            The Settings page is currently under development. Soon you'll be able to configure system preferences,
            manage integrations, and customize your admin experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">General Settings</h3>
              <p className="text-sm text-gray-600">Configure site name, branding, and basic preferences</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Email & Notifications</h3>
              <p className="text-sm text-gray-600">Manage email templates and notification preferences</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Integrations</h3>
              <p className="text-sm text-gray-600">Configure third-party services and API settings</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mt-8 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
