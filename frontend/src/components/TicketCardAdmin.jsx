import React, { useState } from "react";

export default function TicketCardAdmin({ ticket, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800 border border-red-200";
      case "InProgress":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Resolved":
        return "bg-green-100 text-green-800 border border-green-200";
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

  const getStatusBorder = (status) => {
    switch (status) {
      case "Open":
        return "border-l-rose-400";
      case "InProgress":
        return "border-l-amber-400";
      case "Resolved":
        return "border-l-emerald-400";
      default:
        return "border-l-slate-300";
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    await onStatusUpdate(ticket._id, newStatus);
    setUpdating(false);
  };

  return (
    <div
      className={`surface-card card-lift p-6 border-l-4 ${getStatusBorder(ticket.status)}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            {ticket.title}
          </h3>
          <p className="text-slate-600 text-sm">
            By: {ticket.userId?.name || "Unknown"} ({ticket.userId?.email})
          </p>
          <p className="text-slate-600 text-sm">
            Created: {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-left md:text-right">
          <label className="block text-slate-700 font-semibold mb-2">
            Update Status
          </label>
          <select
            value={ticket.status}
            onChange={handleStatusChange}
            disabled={updating}
            className="select-field disabled:opacity-50"
          >
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <p className="text-slate-600 mb-4">{ticket.description}</p>

      <div className="flex gap-2 flex-wrap">
        <span className={`badge ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
        <span className={`badge ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority} Priority
        </span>
      </div>
    </div>
  );
}
