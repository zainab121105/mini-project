import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import TicketCard from "../components/TicketCard";
import Navbar from "../components/Navbar";

export default function UserDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketAPI.getUserTickets();
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
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
        <div className="surface-card p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 mt-2">
              Welcome, {user?.name}
            </h1>
            <p className="text-slate-600 mt-2">
              Track requests, manage updates, and follow up faster.
            </p>
          </div>
          <button
            onClick={() => navigate("/create-ticket")}
            className="btn-primary"
          >
            Create ticket
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="surface-card-muted card-lift p-6">
            <p className="text-slate-500 text-sm font-semibold">Total</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {tickets.length}
            </p>
          </div>
          <div className="surface-card-muted card-lift p-6">
            <p className="text-slate-500 text-sm font-semibold">In progress</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {tickets.filter((t) => t.status === "InProgress").length}
            </p>
          </div>
          <div className="surface-card-muted card-lift p-6">
            <p className="text-slate-500 text-sm font-semibold">Resolved</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {tickets.filter((t) => t.status === "Resolved").length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="text-slate-600 mt-4">Loading your tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 surface-card">
            <p className="text-slate-500 text-lg">
              No tickets yet. Create your first request to get started.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              Your tickets
            </h2>
            <div className="grid gap-6">
              {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} isAdmin={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
