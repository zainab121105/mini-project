import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { authAPI } from "../services/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenValid, setTokenValid] = useState(null);
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Token is missing.");
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword({ token, password });
      if (response.data.success) {
        setSuccess("✅ Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="page-shell flex items-center justify-center p-4">
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="surface-card p-8 text-center animate-rise">
            <h2 className="text-2xl font-semibold text-slate-900">
              Invalid reset link
            </h2>
            <p className="text-slate-600 mt-4">
              The password reset link is missing or invalid.
            </p>
            <a
              href="/forgot-password"
              className="mt-6 inline-block btn-primary"
            >
              Request new link
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="page-shell flex items-center justify-center p-4">
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

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
              Create a new password
            </h2>
            <p className="text-slate-500 mt-2">
              Enter your new password below.
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
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
              <p className="text-sm text-slate-500 mt-1">
                At least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
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
