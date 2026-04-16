import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import EnhancedTicketCard from "../components/EnhancedTicketCard";
import Navbar from "../components/Navbar";

export default function AgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchAllTickets();
  }, [statusFilter, sortBy]);

  const fetchAllTickets = async () => {
    setLoading(true);
    try {
      const filters = {
        ...(statusFilter && { status: statusFilter }),
        sortBy,
      };
      const response = await ticketAPI.getAssignedTickets(filters);
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (err) {
      alert("Failed to fetch tickets");
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
        alert("✅ Ticket status updated successfully!");
      }
    } catch (err) {
      alert(
        "❌ Failed to update ticket: " +
          (err.response?.data?.message || "Error"),
      );
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  return (
    <div className="page-shell">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="surface-card p-6 md:p-8 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
            Agent workspace
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 mt-2">
            Assigned tickets
          </h1>
          <p className="text-slate-600 mt-2">
            Review your queue, update statuses, and reply fast.
          </p>
        </div>

        {/* Filters */}
        <div className="surface-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select-field"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2">
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

        {/* Tickets List */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">
            Assigned tickets
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              <p className="text-slate-600 mt-4">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 surface-card">
              <p className="text-slate-500 text-lg">
                No tickets to display. You're all caught up.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {tickets.map((ticket) => (
                <EnhancedTicketCard
                  key={ticket._id}
                  ticket={ticket}
                  onStatusUpdate={handleStatusUpdate}
                  isAgent={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
