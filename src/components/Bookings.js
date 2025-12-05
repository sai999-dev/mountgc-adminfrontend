import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, Globe, Search, Loader2, Eye, X, Video, Copy, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:3000/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBookings(response.data.data);
        toast.success('Bookings loaded!');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (!searchQuery) {
      setFilteredBookings(bookings);
      return;
    }
    const filtered = bookings.filter(b =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBookings(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openZoomLink = (zoomLink) => {
    window.open(zoomLink, '_blank');
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center space-x-2">
          <Calendar className="text-green-600" size={32} />
          <span>Bookings</span>
        </h1>
        <p className="text-gray-600 mt-1">All counseling session bookings with Zoom links</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-green-600" size={40} />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search' : 'Bookings will appear here'}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time (CST)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zoom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">#{booking.booking_id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 rounded-full p-2">
                            <User className="text-green-600" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{booking.name}</p>
                            <p className="text-sm text-gray-500">{booking.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{booking.session_type}</p>
                        <p className="text-sm text-gray-500">{booking.category}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800 flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{formatDate(booking.booking_date)}</span>
                        </p>
                        <p className="text-sm text-blue-600 flex items-center space-x-1 mt-1">
                          <Clock size={14} />
                          <span>{booking.booking_time_cst}</span>
                        </p>
                        {booking.original_timezone === 'IST' && (
                          <p className="text-xs text-gray-400 mt-1">
                            Original: {booking.original_time} IST
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openZoomLink(booking.zoom_link)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1 transition"
                        >
                          <Video size={14} />
                          <span>Join</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailsModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition flex items-center space-x-2"
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
            {filteredBookings.map((booking) => (
              <div key={booking.booking_id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 rounded-full p-2">
                      <User className="text-green-600" size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{booking.name}</p>
                      <p className="text-xs text-gray-500">ID: #{booking.booking_id}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-3">
                  <p className="text-gray-600">{booking.email}</p>
                  <p className="flex items-center space-x-2 text-gray-700">
                    <Calendar size={14} />
                    <span>{formatDate(booking.booking_date)}</span>
                  </p>
                  <p className="flex items-center space-x-2 text-blue-600 font-medium">
                    <Clock size={14} />
                    <span>{booking.booking_time_cst} CST</span>
                  </p>
                  {booking.original_timezone === 'IST' && (
                    <p className="text-xs text-gray-400 ml-6">
                      Original: {booking.original_time} IST
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-medium">{booking.session_type}</span> - {booking.category}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openZoomLink(booking.zoom_link)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center space-x-2 transition"
                  >
                    <Video size={16} />
                    <span>Join Zoom</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetailsModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="text-2xl font-bold text-gray-800">#{selectedBooking.booking_id}</p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                  <Video size={20} />
                  <span>Zoom Meeting Details</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white p-2 rounded">
                    <p className="text-sm text-gray-600">Meeting Link:</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openZoomLink(selectedBooking.zoom_link)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <Video size={14} />
                        <span>Join Meeting</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(selectedBooking.zoom_link, 'Zoom Link')}
                        className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
                      >
                        {copiedField === 'Zoom Link' ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded">
                    <p className="text-sm text-gray-600">Meeting ID:</p>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-medium">{selectedBooking.zoom_meeting_id}</span>
                      <button
                        onClick={() => copyToClipboard(selectedBooking.zoom_meeting_id, 'Meeting ID')}
                        className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
                      >
                        {copiedField === 'Meeting ID' ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded">
                    <p className="text-sm text-gray-600">Password:</p>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-medium">{selectedBooking.zoom_password}</span>
                      <button
                        onClick={() => copyToClipboard(selectedBooking.zoom_password, 'Password')}
                        className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
                      >
                        {copiedField === 'Password' ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Student Information</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">{selectedBooking.name}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Mail size={16} className="text-gray-400" />
                      <span>{selectedBooking.email}</span>
                    </p>
                    {selectedBooking.phone && (
                      <p className="flex items-center space-x-2">
                        <Phone size={16} className="text-gray-400" />
                        <span>{selectedBooking.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Session Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Type:</span> <span className="font-medium">{selectedBooking.session_type}</span></p>
                    <p><span className="text-gray-600">Category:</span> <span className="font-medium">{selectedBooking.category}</span></p>
                    <p className="flex items-center space-x-2">
                      <Globe size={16} className="text-gray-400" />
                      <span>Booked in {selectedBooking.original_timezone}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Schedule</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="flex items-center space-x-2">
                    <Calendar size={18} className="text-green-600" />
                    <span className="font-medium">{formatDate(selectedBooking.booking_date)}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Clock size={18} className="text-blue-600" />
                    <span className="font-medium">{selectedBooking.booking_time_cst} CST</span>
                  </p>
                  {selectedBooking.original_timezone === 'IST' && (
                    <p className="text-sm text-gray-500 ml-7">
                      Original booking: {selectedBooking.original_time} IST
                    </p>
                  )}
                </div>
              </div>

              {selectedBooking.message && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Message</h3>
                  <p className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">{selectedBooking.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
