import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Search, Loader2, Eye, X, CheckCircle, XCircle, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:3000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.data);
        toast.success('Users loaded!');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.user_role === roleFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: users.length,
    admin: users.filter(u => u.user_role === 'admin').length,
    student: users.filter(u => u.user_role === 'student').length,
    active: users.filter(u => u.is_active).length,
    verified: users.filter(u => u.email_verify).length
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center space-x-2">
          <User className="text-green-600" size={32} />
          <span>Users Management</span>
        </h1>
        <p className="text-gray-600 mt-1">Manage all registered users</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Admins</p>
          <p className="text-2xl font-bold text-purple-600">{stats.admin}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Students</p>
          <p className="text-2xl font-bold text-green-600">{stats.student}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm">Active</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-teal-500">
          <p className="text-gray-600 text-sm">Verified</p>
          <p className="text-2xl font-bold text-teal-600">{stats.verified}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-green-600" size={40} />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <User className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
          <p className="text-gray-500">
            {searchQuery || roleFilter !== 'all' ? 'Try adjusting your filters' : 'Users will appear here'}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">#{user.user_id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 rounded-full p-2">
                            <User className="text-green-600" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.user_role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.user_role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_active ? (
                          <span className="flex items-center space-x-1 text-green-600">
                            <CheckCircle size={16} />
                            <span className="text-sm">Active</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-red-600">
                            <XCircle size={16} />
                            <span className="text-sm">Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email_verify ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : (
                          <XCircle className="text-gray-400" size={20} />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center space-x-2"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.user_id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 rounded-full p-2">
                      <User className="text-green-600" size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.username}</p>
                      <p className="text-xs text-gray-500">ID: #{user.user_id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.user_role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.user_role}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-3">
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-4">
                    <span className={`flex items-center space-x-1 ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {user.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      <span>{user.is_active ? 'Active' : 'Inactive'}</span>
                    </span>
                    <span className={`flex items-center space-x-1 ${user.email_verify ? 'text-green-600' : 'text-gray-400'}`}>
                      {user.email_verify ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      <span>{user.email_verify ? 'Verified' : 'Unverified'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Joined: {formatDate(user.created_at)}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDetailsModal(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center space-x-2 transition"
                >
                  <Eye size={16} />
                  <span>View Details</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-800">User Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">User ID</p>
                <p className="text-2xl font-bold text-gray-800">#{selectedUser.user_id}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">{selectedUser.username}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Mail size={16} className="text-gray-400" />
                      <span>{selectedUser.email}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Shield size={16} className="text-gray-400" />
                      <span className="capitalize">{selectedUser.user_role}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Status</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center justify-between">
                      <span className="text-gray-600">Active:</span>
                      {selectedUser.is_active ? (
                        <span className="flex items-center space-x-1 text-green-600">
                          <CheckCircle size={16} />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-red-600">
                          <XCircle size={16} />
                          <span>No</span>
                        </span>
                      )}
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-gray-600">Email Verified:</span>
                      {selectedUser.email_verify ? (
                        <span className="flex items-center space-x-1 text-green-600">
                          <CheckCircle size={16} />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-gray-600">
                          <XCircle size={16} />
                          <span>No</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Timeline</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(selectedUser.created_at)}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{formatDate(selectedUser.updated_at)}</span>
                  </p>
                  {selectedUser.last_login_at && (
                    <p className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-600">Last Login:</span>
                      <span className="font-medium">{formatDate(selectedUser.last_login_at)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
