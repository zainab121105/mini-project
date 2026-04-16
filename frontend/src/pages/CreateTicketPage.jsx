import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function CreateTicketPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Bug");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Prevent non-users from accessing this page
  useEffect(() => {
    if (user && user.role !== "user") {
      if (user.role === "agent") {
        navigate("/agent-dashboard");
      } else if (user.role === "manager") {
        navigate("/manager-dashboard");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await ticketAPI.createTicket({
        title,
        description,
        category,
        priority,
      });
      if (response.data.success) {
        setSuccess("Ticket created successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="surface-card p-8 animate-rise">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
              New request
            </p>
            <h1 className="text-4xl font-semibold text-slate-900 mb-2">
              Create a ticket
            </h1>
            <p className="text-slate-500">
              Describe your issue and we'll route it to the right team.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Ticket title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="e.g., Login page not loading"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea-field h-40 resize-none"
                placeholder="Provide detailed information about your issue..."
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                {description.length} / 500 characters
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {["Bug", "Feature", "Payment", "Login", "Other"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-3 px-4 rounded-lg font-bold transition transform ${
                      category === cat
                        ? "bg-amber-500 text-white scale-105"
                        : "bg-white text-slate-700 hover:bg-amber-50 border border-amber-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Priority level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Low", "Medium", "High"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-3 px-4 rounded-lg font-bold transition transform ${
                      priority === p
                        ? p === "Low"
                          ? "bg-emerald-500 text-white scale-105"
                          : p === "Medium"
                            ? "bg-amber-500 text-white scale-105"
                            : "bg-rose-500 text-white scale-105"
                        : p === "Low"
                          ? "bg-emerald-50 text-emerald-800"
                          : p === "Medium"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-rose-50 text-rose-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create ticket"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
