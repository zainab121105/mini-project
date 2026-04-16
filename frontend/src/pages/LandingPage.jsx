import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="page-shell">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
              Support ticket platform
            </p>
            <h1 className="text-5xl md:text-6xl font-semibold text-slate-900">
              Support tickets that feel calm and clear.
            </h1>
            <p className="text-lg text-slate-600 max-w-xl">
              Keep customers informed and teams aligned with a workspace built
              for fast triage, smart routing, and clean reporting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/login")}
                className="btn-primary"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/register")}
                className="btn-secondary"
              >
                Create account
              </button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-500">
              <span>Trusted by growing teams</span>
              <span>Instant routing</span>
              <span>Real-time status</span>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-slate-500">Today</p>
                <p className="text-xl font-semibold text-slate-900">
                  Ticket overview
                </p>
              </div>
              <span className="badge bg-amber-50 text-amber-800 border border-amber-200">
                Live
              </span>
            </div>
            <div className="space-y-3">
              {[
                { title: "Login issue for remote team", status: "Open" },
                { title: "Billing update request", status: "In Progress" },
                { title: "Feature request intake", status: "Resolved" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl border border-amber-100 bg-white"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Status: {item.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Active teams", value: "1,000+" },
            { label: "Tickets resolved", value: "50K+" },
            { label: "Average SLA", value: "2.5 hrs" },
            { label: "Uptime", value: "99.9%" },
          ].map((stat) => (
            <div key={stat.label} className="surface-card-muted p-5">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
              Built for focus
            </p>
            <h2 className="text-4xl font-semibold text-slate-900">
              Everything you need to run support
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Smart routing",
                body: "Assign tickets by priority and category with a single view.",
              },
              {
                title: "Clear status",
                body: "Keep customers aligned with real-time ticket updates.",
              },
              {
                title: "Actionable insights",
                body: "Spot bottlenecks early with built-in reporting.",
              },
            ].map((feature) => (
              <div key={feature.title} className="surface-card p-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
              Roles aligned
            </p>
            <h2 className="text-4xl font-semibold text-slate-900">
              Built for every team member
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "User",
                body: "Submit, track, and follow up on requests.",
              },
              {
                title: "Agent",
                body: "Stay focused on assigned tickets and updates.",
              },
              {
                title: "Manager",
                body: "Monitor queues, assign work, and analyze trends.",
              },
              {
                title: "Admin",
                body: "Manage the system, permissions, and workflows.",
              },
            ].map((role) => (
              <div key={role.title} className="surface-card p-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {role.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2">{role.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto surface-card p-10 text-center">
          <h2 className="text-4xl font-semibold text-slate-900 mb-4">
            Ready to streamline support?
          </h2>
          <p className="text-slate-600 mb-8">
            Start free and bring your team into a focused support workspace.
          </p>
          <button onClick={() => navigate("/register")} className="btn-primary">
            Get started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-12 bg-slate-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>
            &copy; 2026 Support Tickets. All rights reserved. | Built with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
