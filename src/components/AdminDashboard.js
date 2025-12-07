import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  Bell,
  Search,
  Clock,
  Plane,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalTimeslots: 0,
    activeUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");
    
    if (!token || !user) {
      toast.error("Please login as admin first");
      navigate("/admin/login");
      return;
    }
    
    setAdminUser(JSON.parse(user));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      
      const [usersRes, bookingsRes, timeslotsRes] = await Promise.all([
        axios.get('https://mountgc-backend.onrender.com/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://mountgc-backend.onrender.com/api/admin/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://mountgc-backend.onrender.com/api/admin/timeslots', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (usersRes.data.success) {
        const users = usersRes.data.data;
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.is_active).length
        }));
        
        const recent = users
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentUsers(recent);
      }

      if (bookingsRes.data.success) {
        setStats(prev => ({
          ...prev,
          totalBookings: bookingsRes.data.data.length
        }));
      }

      if (timeslotsRes.data.success) {
        setStats(prev => ({
          ...prev,
          totalTimeslots: timeslotsRes.data.data.length
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      // Call backend logout API to invalidate device session
      if (token) {
        console.log('🚪 Calling logout API...');
        await axios.post('https://mountgc-backend.onrender.com/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Logout API call successful');
      }
    } catch (error) {
      console.error('❌ Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear localStorage and redirect
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      toast.success("Logged out successfully!");
      navigate("/admin/login");
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "bookings", label: "Bookings", icon: BookOpen, path: "/admin/bookings" },
    { id: "timeslots", label: "Time Slots", icon: Clock, path: "/admin/timeslots" },
    { id: "research-papers", label: "Research Papers", icon: FileText, path: "/admin/research-papers" },
    { id: "visa-applications", label: "Visa Applications", icon: Plane, path: "/admin/visa-applications" },
    { id: "reports", label: "Reports", icon: FileText, path: "/admin/reports" },
    { id: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const handleNavigation = (item) => {
    setActiveTab(item.id);
    if (item.path) {
      navigate(item.path);
    }
  };

  const dashboardStats = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      change: `${stats.activeUsers} active`,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      change: "All sessions",
      icon: BookOpen,
      color: "bg-green-500",
    },
    {
      title: "Time Slots",
      value: stats.totalTimeslots.toString(),
      change: "Available",
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toString(),
      change: `${((stats.activeUsers / stats.totalUsers) * 100 || 0).toFixed(0)}% of total`,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster position="top-right" />

      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-green-800 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-green-700">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-800 font-bold text-xl">M</span>
              </div>
              <div>
                <h2 className="font-bold text-xl">MountGC</h2>
                <p className="text-xs text-green-200">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto">
              <span className="text-green-800 font-bold text-xl">M</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-700/50"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-green-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-green-100 hover:bg-red-600 transition-all duration-200"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button className="relative text-gray-600 hover:text-gray-900">
                <Bell size={24} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.totalBookings > 0 ? Math.min(stats.totalBookings, 9) : 0}
                </span>
              </button>

              <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {adminUser?.name?.charAt(0) || "A"}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {adminUser?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">{adminUser?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {dashboardStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <span className="text-green-600 text-sm font-semibold">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Users</h2>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-green-600 hover:text-green-700 text-sm font-semibold"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Loading...</p>
                ) : recentUsers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No users yet</p>
                ) : (
                  recentUsers.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="text-green-600" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Users size={20} />
                  <span>Manage Users</span>
                </button>
                <button 
                  onClick={() => navigate('/admin/timeslots')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Clock size={20} />
                  <span>Manage Time Slots</span>
                </button>
                <button
                  onClick={() => navigate('/admin/bookings')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <BookOpen size={20} />
                  <span>View Bookings</span>
                </button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

