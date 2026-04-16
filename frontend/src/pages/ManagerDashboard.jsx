import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import EnhancedTicketCard from "../components/EnhancedTicketCard";
import AgentAssignmentCard from "../components/AgentAssignmentCard";
import Navbar from "../components/Navbar";

export default function ManagerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAllTickets();
    fetchSupportAgents();
  }, [priorityFilter, statusFilter, categoryFilter, sortBy]);

  useEffect(() => {
    if (!tickets.length) {
      setSelectedTicket(null);
      return;
    }

    if (!selectedTicket || !tickets.find((t) => t._id === selectedTicket._id)) {
      setSelectedTicket(tickets[0]);
    }
  }, [tickets, selectedTicket]);

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
        // Filter by category on frontend since backend doesn't support it yet
        let filteredTickets = response.data.tickets;
        if (categoryFilter) {
          filteredTickets = filteredTickets.filter(
            (t) => t.category === categoryFilter,
          );
        }
        setTickets(filteredTickets);
      }
    } catch (err) {
      alert("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportAgents = async () => {
    setAgentLoading(true);
    try {
      const response = await ticketAPI.getSupportAgents();
      if (response.data.success) {
        setAgents(response.data.agents);
      }
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const response = await ticketAPI.updateTicket(ticketId, {
        status: newStatus,
      });
      if (response.data.success) {
        setTickets((prev) =>
          prev.map((t) =>
            t._id === ticketId ? { ...t, status: newStatus } : t,
          ),
        );
        setSelectedTicket((prev) =>
          prev && prev._id === ticketId ? { ...prev, status: newStatus } : prev,
        );
        alert("✅ Ticket status updated successfully!");
      }
    } catch (err) {
      alert("❌ Failed to update ticket");
    }
  };

  const handleAssignTicket = async (ticketId, agentId) => {
    try {
      const response = await ticketAPI.assignTicket(ticketId, { agentId });
      if (response.data.success) {
        const updatedTicket = response.data.ticket;
        setTickets((prev) =>
          prev.map((t) =>
            t._id === ticketId
              ? {
                  ...t,
                  assignedTo: updatedTicket.assignedTo,
                  status: updatedTicket.status,
                }
              : t,
          ),
        );
        setSelectedTicket((prev) =>
          prev && prev._id === ticketId
            ? {
                ...prev,
                assignedTo: updatedTicket.assignedTo,
                status: updatedTicket.status,
              }
            : prev,
        );
        alert("✅ Ticket assigned successfully!");
      }
    } catch (err) {
      alert(
        "❌ Failed to assign ticket: " +
          (err.response?.data?.message || "Error"),
      );
    }
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      case "In Progress":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Pending":
        return "bg-slate-100 text-slate-800 border border-slate-200";
      case "Escalated":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "Resolved":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      case "Medium":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Low":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    pending: tickets.filter((t) => t.status === "Pending").length,
    escalated: tickets.filter((t) => t.status === "Escalated").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
    high: tickets.filter((t) => t.priority === "High").length,
    avgResolutionTime: "2.5 days",
    satisfactionRate: "92%",
  };

  return (
    <div className="page-shell">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="surface-card p-6 md:p-8 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
            Manager dashboard
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 mt-2">
            Team overview
          </h1>
          <p className="text-slate-600 mt-2">
            Filter the queue, assign agents, and stay ahead of escalations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total },
            { label: "Open", value: stats.open },
            { label: "In progress", value: stats.inProgress },
            { label: "Pending", value: stats.pending },
            { label: "Escalated", value: stats.escalated },
            { label: "High priority", value: stats.high },
          ].map((stat) => (
            <div key={stat.label} className="surface-card-muted card-lift p-4">
              <p className="text-slate-500 text-sm font-semibold">
                {stat.label}
              </p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Ticket queue
                  </h2>
                  <p className="text-sm text-slate-500">
                    {tickets.length} tickets in view
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAllTickets}
                  className="btn-secondary"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                  <p className="text-slate-600 mt-4">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-lg">No tickets found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => {
                    const isSelected = selectedTicket?._id === ticket._id;
                    return (
                      <button
                        key={ticket._id}
                        type="button"
                        onClick={() => handleSelectTicket(ticket)}
                        className={`w-full text-left rounded-2xl border p-5 transition ${
                          isSelected
                            ? "border-amber-300 bg-amber-50"
                            : "border-amber-100 bg-white hover:border-amber-200"
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {ticket.title}
                            </h3>
                            <span
                              className={`badge ${getStatusBadge(ticket.status)}`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`badge ${getPriorityBadge(ticket.priority)}`}
                            >
                              {ticket.priority}
                            </span>
                            {ticket.category && (
                              <span className="badge bg-slate-100 text-slate-700 border border-slate-200">
                                {ticket.category}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            <span>ID {String(ticket._id).slice(-8)}</span>
                            <span>
                              Created{" "}
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                            <span>
                              {ticket.assignedTo?.name
                                ? `Agent ${ticket.assignedTo.name}`
                                : "Unassigned"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                              {isSelected ? "Selected" : "Click to manage"}
                            </span>
                            <span className="text-amber-700 font-semibold">
                              Manage
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="surface-card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Selected ticket
              </h3>
              {selectedTicket ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {selectedTicket.title}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedTicket.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`badge ${getStatusBadge(selectedTicket.status)}`}
                    >
                      {selectedTicket.status}
                    </span>
                    <span
                      className={`badge ${getPriorityBadge(selectedTicket.priority)}`}
                    >
                      {selectedTicket.priority}
                    </span>
                    {selectedTicket.category && (
                      <span className="badge bg-slate-100 text-slate-700 border border-slate-200">
                        {selectedTicket.category}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-4">
                    <span>ID {String(selectedTicket._id).slice(-8)}</span>
                    <span>
                      Created{" "}
                      {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      {selectedTicket.assignedTo?.name
                        ? `Agent ${selectedTicket.assignedTo.name}`
                        : "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      Update status
                    </label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) =>
                        handleStatusUpdate(selectedTicket._id, e.target.value)
                      }
                      className="select-field text-sm"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/ticket/${selectedTicket._id}`)}
                      className="btn-primary text-sm"
                    >
                      View details
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Select a ticket to view its details and actions.
                </p>
              )}
            </div>

            <div className="surface-card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Filters
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="select-field"
                  >
                    <option value="">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    Priority
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
                  <label className="block text-slate-700 font-semibold mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="select-field"
                  >
                    <option value="">All Categories</option>
                    <option value="Bug">Bug</option>
                    <option value="Feature">Feature</option>
                    <option value="Payment">Payment</option>
                    <option value="Login">Login</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    Sort
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

            <div className="surface-card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Assign to agent
              </h3>
              {selectedTicket ? (
                selectedTicket.status === "Resolved" ? (
                  <p className="text-sm text-slate-500">
                    Resolved tickets cannot be reassigned.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <AgentAssignmentCard
                      ticket={selectedTicket}
                      agents={agents}
                      onAssign={handleAssignTicket}
                      loading={agentLoading}
                    />
                  </div>
                )
              ) : (
                <p className="text-sm text-slate-500">
                  Select a ticket from the queue to assign it.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
