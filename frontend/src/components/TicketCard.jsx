import React from "react";
import { useNavigate } from "react-router-dom";

export default function TicketCard({ ticket, isAdmin }) {
  const navigate = useNavigate();

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

  const handleCardClick = () => {
    navigate(`/ticket/${ticket._id}`);
  };

  return (
    <div
      className={`surface-card card-lift p-6 cursor-pointer border-l-4 ${getStatusBorder(ticket.status)}`}
      onClick={handleCardClick}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900">
            {ticket.title}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Created {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`badge ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>

      <p className="text-slate-600 mb-4 line-clamp-2">{ticket.description}</p>

      <div className="flex gap-2 flex-wrap">
        <span className={`badge ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority} Priority
        </span>
      </div>
    </div>
  );
}
