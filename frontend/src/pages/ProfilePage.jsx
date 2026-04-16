import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { authAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function ProfilePage() {
  const { setToken, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response.data.success) {
          const user = response.data.user;
          setFormData({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "user",
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (passwordData.newPassword || passwordData.confirmPassword) {
      if (passwordData.newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        setSaving(false);
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New password and confirmation do not match");
        setSaving(false);
        return;
      }
    }

    const payload = {
      name: formData.name,
    };

    if (passwordData.newPassword) {
      payload.currentPassword = passwordData.currentPassword;
      payload.newPassword = passwordData.newPassword;
    }

    try {
      const response = await authAPI.updateProfile(payload);
      if (response.data.success) {
        setSuccess("Profile updated successfully");

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          setToken(response.data.token);
        }

        if (response.data.user) {
          setUser({
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
          });

          setFormData((prev) => ({
            ...prev,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
          }));
        }

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="surface-card p-6 md:p-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
              Profile
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 mt-2">
              Profile settings
            </h1>
            <p className="text-slate-600 mt-2">
              Update your personal details and change your password.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              <p className="text-slate-600 mt-4">Loading profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Personal details
                  </h2>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="input-field bg-slate-100 text-slate-600"
                      placeholder="you@example.com"
                      disabled
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Email updates are managed by administrators.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      className="input-field bg-slate-100 text-slate-600"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Password update
                  </h2>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      Current password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="input-field"
                      placeholder="Current password"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      New password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="input-field"
                      placeholder="New password"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input-field"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <p className="text-xs text-slate-500">
                    Leave password fields blank if you do not want to change it.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
