import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import EnhancedTicketCard from "../components/EnhancedTicketCard";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchAllTickets();
  }, [statusFilter, priorityFilter, sortBy]);

  const fetchAllTickets = async () => {
    setLoading(true);
    try {
      const filters = {
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        sortBy,
      };
      const response = await ticketAPI.getAllTickets(filters);
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const response = await ticketAPI.updateTicket(ticketId, {
        status: newStatus,
      });
      if (response.data.success) {
        setTickets(
          tickets.map((t) =>
            t._id === ticketId ? { ...t, status: newStatus } : t,
          ),
        );
      }
    } catch (err) {
      alert(
        "Failed to update ticket: " + (err.response?.data?.message || "Error"),
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page-shell">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="surface-card p-6 md:p-8 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
            Admin
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 mt-2">
            Control panel
          </h1>
          <p className="text-slate-600 mt-2">
            Monitor all tickets, update statuses, and stay on top of activity.
          </p>
        </div>

        {/* Filters */}
        <div className="surface-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select-field"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2">
                Filter by Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="select-field"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select-field"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Display */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            📋 All Tickets
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              <p className="text-slate-600 mt-4">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 surface-card">
              <p className="text-slate-500 text-lg">No tickets found.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {tickets.map((ticket) => (
                <EnhancedTicketCard
                  key={ticket._id}
                  ticket={ticket}
                  onStatusUpdate={handleStatusUpdate}
                  isAdmin={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
