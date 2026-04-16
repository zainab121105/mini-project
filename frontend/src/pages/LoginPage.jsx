import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { authAPI } from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAgentsDropdown, setShowAgentsDropdown] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AuthContext);

  const demoAccounts = [
    {
      name: "Demo User",
      email: "demo-user@example.com",
      password: "Test123!",
      role: "user",
    },
    {
      name: "Demo Manager",
      email: "demo-manager@example.com",
      password: "Test123!",
      role: "manager",
    },
  ];

  const supportAgents = [
    {
      name: "John Smith",
      role: "Developer",
      expertise: ["Bug", "Feature"],
      email: "john.smith@support.com",
      password: "Agent123!",
    },
    {
      name: "Sarah Johnson",
      role: "Payment Specialist",
      expertise: ["Payment"],
      email: "sarah.johnson@support.com",
      password: "Agent123!",
    },
    {
      name: "Mike Davis",
      role: "Support Engineer",
      expertise: ["Login", "Bug"],
      email: "mike.davis@support.com",
      password: "Agent123!",
    },
    {
      name: "General Support Agent",
      role: "Generalist",
      expertise: ["Bug", "Login", "Payment", "Feature"],
      email: "general@support.com",
      password: "Agent123!",
    },
  ];

  const handleUseDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleUseAgent = (agentEmail, agentPassword) => {
    setEmail(agentEmail);
    setPassword(agentPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);

        const role = response.data.user?.role;
        if (role === "manager") {
          navigate("/manager-dashboard");
        } else if (role === "agent") {
          navigate("/agent-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center p-4">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-6xl relative z-10">
        <div className="surface-card p-8 md:p-12 animate-rise">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
                  SupportFlow
                </p>
                <h1 className="text-4xl font-semibold text-slate-900">
                  Welcome back
                </h1>
                <p className="text-slate-600">
                  Sign in to manage requests, coordinate teams, and keep support
                  moving.
                </p>
              </div>

              <div className="surface-card-muted p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold mb-3">
                  Test accounts
                </p>
                <div className="space-y-3">
                  {demoAccounts.map((account, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleUseDemo(account.email, account.password)
                      }
                      className="w-full text-left p-3 rounded-xl border border-amber-100 hover:border-amber-200 hover:bg-white transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {account.name}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            {account.email}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-amber-700">
                          Use
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="surface-card-muted p-5">
                <button
                  type="button"
                  onClick={() => setShowAgentsDropdown(!showAgentsDropdown)}
                  className="w-full flex items-center justify-between text-slate-900 font-semibold"
                >
                  <span>Support agents</span>
                  <span
                    className={`text-sm transition-transform ${showAgentsDropdown ? "rotate-180" : ""}`}
                  >
                    v
                  </span>
                </button>
                <p className="text-xs text-slate-500 mt-1">
                  {supportAgents.length} agents available
                </p>

                {showAgentsDropdown && (
                  <div className="mt-4 space-y-2">
                    {supportAgents.map((agent, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleUseAgent(agent.email, agent.password)
                        }
                        className="w-full text-left p-3 rounded-lg border border-amber-100 hover:border-amber-200 hover:bg-white transition"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {agent.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {agent.role}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {agent.expertise.map((exp, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100"
                                >
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-emerald-700">
                            Select
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center h-full">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6">
                  <p className="font-semibold">Login failed</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6">
                  <p className="font-semibold">Success</p>
                  <p className="text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="text-right">
                  <a
                    href="/forgot-password"
                    className="text-sm text-amber-700 hover:text-amber-800 transition"
                  >
                    Forgot your password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-60 text-base"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-slate-600">
                  No account?{" "}
                  <a
                    href="/register"
                    className="text-amber-700 hover:text-amber-800 font-semibold"
                  >
                    Create one
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
