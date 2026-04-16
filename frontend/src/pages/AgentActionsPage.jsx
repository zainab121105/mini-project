import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

export default function AgentActionsPage() {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    openTickets: 0,
    inProgressTickets: 0,
    highPriorityTickets: 0,
    averageResolutionTime: "N/A",
  });
  const [loading, setLoading] = useState(false);
  const [escMessage, setEscMessage] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  const fetchAssignedTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketAPI.getAssignedTickets({});
      if (response.data.success) {
        const ticketsData = response.data.tickets;
        setTickets(ticketsData);
        calculateStats(ticketsData);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketsData) => {
    const openTickets = ticketsData.filter((t) => t.status === "Open").length;
    const inProgressTickets = ticketsData.filter(
      (t) => t.status === "In Progress",
    ).length;
    const highPriorityTickets = ticketsData.filter(
      (t) => t.priority === "High",
    ).length;

    setStats({
      totalAssigned: ticketsData.length,
      openTickets,
      inProgressTickets,
      highPriorityTickets,
      averageResolutionTime: "2.5 days",
    });
  };

  const handleEscalate = async (ticketId) => {
    if (!escMessage) {
      toast.error("Please enter an escalation message");
      return;
    }

    try {
      const response = await ticketAPI.updateTicket(ticketId, {
        status: "Escalated",
      });

      if (response.data.success) {
        toast.success("Ticket escalated to manager");
        setEscMessage("");
        fetchAssignedTickets();
      }
    } catch (err) {
      toast.error("Failed to escalate ticket");
    }
  };

  const handleQuickAction = async (ticketId, action) => {
    if (action === "resolve") {
      try {
        const response = await ticketAPI.updateTicket(ticketId, {
          status: "Resolved",
        });
        if (response.data.success) {
          toast.success("Ticket marked as resolved");
          fetchAssignedTickets();
        }
      } catch (err) {
        toast.error("Failed to resolve ticket");
      }
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

  const priorityTickets = tickets.filter(
    (t) => t.priority === "High" && t.status !== "Resolved",
  );
  const openTickets = tickets.filter((t) => t.status === "Open");
  const inProgressTickets = tickets.filter((t) => t.status === "In Progress");

  return (
    <div className="page-shell">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="surface-card p-6 md:p-8 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
            Agent actions
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 mt-2">
            Quick actions
          </h1>
          <p className="text-slate-600 mt-2">
            Prioritize urgent work and keep tickets moving.
          </p>
        </div>

        {/* Agent Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Assigned", value: stats.totalAssigned },
            { label: "Open", value: stats.openTickets },
            { label: "In progress", value: stats.inProgressTickets },
            { label: "High priority", value: stats.highPriorityTickets },
            { label: "Avg resolution", value: stats.averageResolutionTime },
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

        {/* Priority Section */}
        {priorityTickets.length > 0 && (
          <div className="surface-card p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              High priority tickets ({priorityTickets.length})
            </h2>
            <div className="space-y-4">
              {priorityTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="border-l-4 border-rose-400 bg-rose-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {ticket.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {ticket.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="badge bg-orange-100 text-orange-800 border border-orange-200">
                          {ticket.priority}
                        </span>
                        <span className="badge bg-sky-100 text-sky-800 border border-sky-200">
                          {ticket.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/ticket/${ticket._id}`)}
                      className="ml-4 btn-primary"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open Tickets Section */}
        {openTickets.length > 0 && (
          <div className="surface-card p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Open tickets ({openTickets.length})
            </h2>
            <div className="space-y-3">
              {openTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{ticket.title}</p>
                    <p className="text-sm text-slate-600">
                      ID: {String(ticket._id).slice(-8)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickAction(ticket._id, "start")}
                    className="btn-soft text-sm"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress Section */}
        {inProgressTickets.length > 0 && (
          <div className="surface-card p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              In progress ({inProgressTickets.length})
            </h2>
            <div className="space-y-4">
              {inProgressTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="border border-amber-200 bg-amber-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {ticket.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {ticket.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs text-slate-600">
                          Created:{" "}
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => handleQuickAction(ticket._id, "resolve")}
                        className="btn-primary text-sm"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => {
                          setEscMessage(`Escalating ticket: ${ticket.title}`);
                          handleEscalate(ticket._id);
                        }}
                        className="btn-secondary text-sm"
                      >
                        Escalate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tickets.length === 0 && (
          <div className="surface-card p-12 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              All clear
            </h2>
            <p className="text-slate-600">
              You have no assigned tickets right now.
            </p>
          </div>
        )}

        {/* Quick Reference */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="surface-card-muted p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Pro tip</h3>
            <p className="text-sm text-slate-600">
              Focus on high-priority tickets first to keep SLAs healthy.
            </p>
          </div>

          <div className="surface-card-muted p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Best practice</h3>
            <p className="text-sm text-slate-600">
              Keep users updated on ticket status to maintain satisfaction.
            </p>
          </div>

          <div className="surface-card-muted p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Need help?</h3>
            <p className="text-sm text-slate-600">
              Escalate complex tickets to your manager for additional support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
