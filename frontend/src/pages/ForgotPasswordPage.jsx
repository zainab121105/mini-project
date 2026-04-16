import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { authAPI } from "../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authAPI.forgotPassword({ email });
      if (response.data.success) {
        setSuccess("✅ Reset link sent to your email! Check your inbox.");
        setEmail("");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center p-4">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="surface-card p-8 animate-rise">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
              Reset access
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Reset your password
            </h2>
            <p className="text-slate-500 mt-2">
              Enter your email to receive a secure reset link.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
              <p className="text-sm text-slate-500 mt-2">
                We'll send a password reset link to this email address.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Remember your password?{" "}
              <a
                href="/login"
                className="text-amber-700 hover:text-amber-800 font-semibold transition"
              >
                Back to sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
