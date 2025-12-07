import React, { useState, useEffect } from "react";
import { Clock, Plus, Edit2, Trash2, Power, Loader2, X, Globe } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const TimeSlotManagement = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newTimezone, setNewTimezone] = useState("IST");
  const [editingSlot, setEditingSlot] = useState(null);
  const [filterTimezone, setFilterTimezone] = useState("all");

  useEffect(() => {
    fetchTimeSlots();
  }, [filterTimezone]);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url = filterTimezone === "all" ? "https://mountgc-backend.onrender.com/api/admin/timeslots" : `https://mountgc-backend.onrender.com/api/admin/timeslots?timezone=${filterTimezone}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setTimeSlots(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load time slots");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = async () => {
    if (!newTime) {
      toast.error("Please enter a time");
      return;
    }
    if (!newTimezone) {
      toast.error("Please select a timezone");
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        "https://mountgc-backend.onrender.com/api/admin/timeslots",
        { time: newTime, timezone: newTimezone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Time slot added successfully!");
        setNewTime("");
        setNewTimezone("IST");
        setShowAddModal(false);
        fetchTimeSlots();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add time slot");
    }
  };

  const handleEditTimeSlot = async () => {
    if (!editingSlot || !editingSlot.time) {
      toast.error("Please enter a time");
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.put(
        `https://mountgc-backend.onrender.com/api/admin/timeslots/${editingSlot.timeslot_id}`,
        { time: editingSlot.time, timezone: editingSlot.timezone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Time slot updated successfully!");
        setShowEditModal(false);
        setEditingSlot(null);
        fetchTimeSlots();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update time slot");
    }
  };

  const handleToggleStatus = async (slotId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.patch(
        `https://mountgc-backend.onrender.com/api/admin/timeslots/${slotId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchTimeSlots();
      }
    } catch (error) {
      toast.error("Failed to toggle time slot status");
    }
  };

  const handleDeleteTimeSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this time slot?")) {
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.delete(
        `https://mountgc-backend.onrender.com/api/admin/timeslots/${slotId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Time slot deleted successfully!");
        fetchTimeSlots();
      }
    } catch (error) {
      toast.error("Failed to delete time slot");
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Clock className="text-green-600" size={28} />
            <span>Time Slot Management</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Manage available booking time slots for counseling sessions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filterTimezone}
            onChange={(e) => setFilterTimezone(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Timezones</option>
            <option value="IST">IST Only</option>
            <option value="CST">CST Only</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <Plus size={20} />
            <span>Add Time Slot</span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-green-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeSlots.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <Clock className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500">No time slots available</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-green-600 hover:text-green-700 font-semibold"
              >
                Add your first time slot
              </button>
            </div>
          ) : (
            timeSlots.map((slot) => (
              <div
                key={slot.timeslot_id}
                className={`bg-white border-2 rounded-lg p-4 shadow-sm transition ${slot.is_active ? "border-green-200 hover:shadow-md" : "border-gray-200 bg-gray-50"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Clock
                      className={slot.is_active ? "text-green-600" : "text-gray-400"}
                      size={24}
                    />
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {slot.time}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${slot.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                        >
                          {slot.is_active ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 flex items-center space-x-1">
                          <Globe size={12} />
                          <span>{slot.timezone}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(slot.timeslot_id)}
                    className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-md transition ${slot.is_active ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                  >
                    <Power size={16} />
                    <span className="text-sm font-medium">
                      {slot.is_active ? "Deactivate" : "Activate"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingSlot(slot);
                      setShowEditModal(true);
                    }}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-md transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTimeSlot(slot.timeslot_id)}
                    className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-md transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add Time Slot</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time (e.g., 10:00 AM)
              </label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={newTimezone}
                onChange={(e) => setNewTimezone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="IST">IST (India Standard Time)</option>
                <option value="CST">CST (Central Standard Time)</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTimeSlot}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && editingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Time Slot</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="text"
                value={editingSlot.time}
                onChange={(e) =>
                  setEditingSlot({ ...editingSlot, time: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={editingSlot.timezone}
                onChange={(e) =>
                  setEditingSlot({ ...editingSlot, timezone: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="IST">IST (India Standard Time)</option>
                <option value="CST">CST (Central Standard Time)</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTimeSlot}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
              >
                Update Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotManagement;
