import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Shield } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call real backend API
      const response = await axios.post('https://mountgc-backend.onrender.com/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Check if user is admin
        if (user.user_role !== 'admin') {
          toast.error("Access denied! Admin credentials required.");
          setLoading(false);
          return;
        }

        // Store real tokens and user data
        localStorage.setItem("adminToken", accessToken);
        localStorage.setItem("adminRefreshToken", refreshToken);
        localStorage.setItem("adminUser", JSON.stringify({
          user_id: user.user_id,
          email: user.email,
          username: user.username,
          role: user.user_role,
          name: user.username
        }));

        // Log token for Thunder Client testing
        console.log("🔑 Admin Access Token for Thunder Client:");
        console.log(accessToken);
        console.log("\n📋 Copy this token and use in Authorization header:");
        console.log(`Bearer ${accessToken}`);

        toast.success("Welcome back, Admin! 🎉");
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900 px-4">
      <Toaster position="top-center" />
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 w-16 h-16 flex items-center justify-center rounded-full shadow-lg">
              <Shield className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-700">Admin Portal</h1>
          <p className="text-gray-600 mt-2 font-medium">MountGC Admin Dashboard</p>
        </div>

        {/* Credentials Info */}
        <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-6 rounded">
          <p className="text-sm text-green-800 font-semibold mb-2">Admin Login:</p>
          <p className="text-xs text-green-700">Email: admin@mountgc.com</p>
          <p className="text-xs text-green-700">Password: admin123</p>
          <p className="text-xs text-gray-600 mt-2">
            💡 Token will be logged in console for Thunder Client
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@mountgc.com"
                className="w-full bg-gray-50 text-gray-900 pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-50 text-gray-900 pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Authenticating...
              </>
            ) : (
              <>
                <Shield className="mr-2" size={20} />
                Admin Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            🔒 Secure Admin Access Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
