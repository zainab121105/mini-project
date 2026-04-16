import React from "react";
import { useNavigate } from "react-router-dom";

export default function EnhancedTicketCard({
  ticket,
  onStatusUpdate,
  isAdmin,
  isAgent,
}) {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low":
        return "bg-sky-100 text-sky-800 border border-sky-200";
      case "Medium":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "High":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Bug":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      case "Feature":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Payment":
        return "bg-sky-100 text-sky-800 border border-sky-200";
      case "Login":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case "Open":
        return "border-l-rose-400";
      case "In Progress":
        return "border-l-amber-400";
      case "Pending":
        return "border-l-slate-400";
      case "Escalated":
        return "border-l-orange-400";
      case "Resolved":
        return "border-l-emerald-400";
      default:
        return "border-l-slate-300";
    }
  };

  const handleViewTicket = () => {
    navigate(`/ticket/${ticket._id}`);
  };

  return (
    <div
      className={`surface-card card-lift border-l-4 ${getStatusBorder(ticket.status)} p-6 cursor-pointer`}
      onClick={handleViewTicket}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left - Ticket Info */}
        <div className="md:col-span-2">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                {ticket.title}
              </h3>
              <p className="text-sm text-slate-500">
                Ticket ID #{ticket._id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          <p className="text-slate-600 mb-4 line-clamp-2">
            {ticket.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`badge ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className={`badge ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority} Priority
            </span>
            {ticket.category && (
              <span className={`badge ${getCategoryColor(ticket.category)}`}>
                {ticket.category}
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p>
              Created {new Date(ticket.createdAt).toLocaleDateString()} at{" "}
              {new Date(ticket.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {ticket.userId && (
              <p>
                Submitted by {ticket.userId.name} ({ticket.userId.email})
              </p>
            )}
            {ticket.assignedTo && (
              <p>
                Assigned to {ticket.assignedTo.name} ({ticket.assignedTo.role})
              </p>
            )}
          </div>
        </div>

        {/* Right - Actions */}
        {(isAdmin || isAgent) && (
          <div className="md:col-span-1 flex flex-col gap-2">
            <label className="block text-slate-700 font-bold text-sm">
              Update Status
            </label>
            <select
              value={ticket.status}
              onChange={(e) => {
                e.stopPropagation();
                onStatusUpdate && onStatusUpdate(ticket._id, e.target.value);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="select-field text-sm font-semibold"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </select>

            {isAgent && (
              <button
                className="btn-soft text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/ticket/${ticket._id}`);
                }}
              >
                💬 Reply
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
