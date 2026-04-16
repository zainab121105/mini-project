import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import ChatBox from "../components/ChatBox";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

export default function TicketDetailPage() {
  const toast = useToast();
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      // Get all tickets and find the one we need
      let response;
      if (user.role === "user") {
        response = await ticketAPI.getUserTickets();
      } else if (user.role === "agent") {
        response = await ticketAPI.getAssignedTickets();
      } else {
        response = await ticketAPI.getAllTickets();
      }

      if (response.data.success) {
        const found = response.data.tickets.find(
          (t) => String(t._id) === ticketId,
        );
        if (found) {
          setTicket(found);
          setAgent(found.assignedTo || null);
        }
      }
    } catch (err) {
      toast.error("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Ticket not found
            </h2>
            <button onClick={() => navigate(-1)} className="btn-primary mt-4">
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      case "In Progress":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Resolved":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Escalated":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "Pending":
        return "bg-sky-100 text-sky-800 border border-sky-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const getPriorityColor = (priority) => {
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

  return (
    <div className="page-shell">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-amber-700 hover:text-amber-800 font-medium text-sm"
        >
          Back to tickets
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Details */}
          <div className="lg:col-span-1">
            <div className="surface-card p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                {ticket.title}
              </h2>

              <div className="space-y-4">
                {/* Ticket ID */}
                <div>
                  <p className="text-sm text-slate-500">Ticket ID</p>
                  <p className="font-mono text-lg text-slate-900">
                    {String(ticket._id).slice(-8)}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <span className={`badge ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>

                {/* Priority */}
                <div>
                  <p className="text-sm text-slate-500">Priority</p>
                  <span
                    className={`badge ${getPriorityColor(ticket.priority)}`}
                  >
                    {ticket.priority}
                  </span>
                </div>

                {/* Category */}
                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="text-slate-900">{ticket.category}</p>
                </div>

                {/* Created */}
                <div>
                  <p className="text-sm text-slate-500">Created</p>
                  <p className="text-slate-900">
                    {new Date(ticket.createdAt).toLocaleDateString()} at{" "}
                    {new Date(ticket.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Assigned Agent */}
                {agent && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-500">Assigned agent</p>
                    <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="font-semibold text-slate-900">
                        {agent.name}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {agent.role}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {agent.email}
                      </p>
                      {agent.expertise && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {agent.expertise.map((exp) => (
                            <span
                              key={exp}
                              className="badge bg-emerald-100 text-emerald-800 border border-emerald-200"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="border-t pt-4">
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="text-slate-900 mt-2 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* CSAT Rating Widget */}
                {ticket.status === "Resolved" && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-500 mb-2">Customer Satisfaction</p>
                    {ticket.rating ? (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={`static-${star}`}
                            className={`text-3xl ${star <= ticket.rating ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-sm font-semibold text-slate-700 ml-2 mt-1">
                          {ticket.rating}/5
                        </span>
                      </div>
                    ) : user.role === "user" ? (
                      <div>
                        <p className="text-xs text-slate-600 mb-2">How would you rate your support experience?</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={`action-${star}`}
                              type="button"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={async () => {
                                try {
                                  const res = await ticketAPI.rateTicket(ticket._id, { rating: star });
                                  if (res.data.success) {
                                    toast.success("Thank you for your feedback!");
                                    setTicket({ ...ticket, rating: star });
                                  }
                                } catch (err) {
                                  toast.error(err.response?.data?.message || "Failed to submit rating.");
                                }
                              }}
                              className={`text-3xl transition-transform duration-200 focus:outline-none hover:scale-110 ${star <= hoverRating ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`}
                              title={`Rate ${star} stars`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm italic text-slate-400">Waiting for user rating</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2 h-full">
            <ChatBox
              ticketId={ticketId}
              assignedAgentName={agent?.name}
              assignedAgentEmail={agent?.email}
              ticketTitle={ticket.title}
              ticketStatus={ticket.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
