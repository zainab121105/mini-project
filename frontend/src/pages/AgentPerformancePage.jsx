import React, { useState, useEffect } from "react";
import { ticketAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function AgentPerformancePage() {
  const [agents, setAgents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, ticketsRes] = await Promise.all([
        ticketAPI.getSupportAgents(),
        ticketAPI.getAllTickets({}),
      ]);

      if (agentsRes.data.success && ticketsRes.data.success) {
        setAgents(agentsRes.data.agents);
        setTickets(ticketsRes.data.tickets);
      }
    } catch (err) {
      console.error("Failed to fetch performance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAgentMetrics = (agentId) => {
    const agentTickets = tickets.filter(
      (t) => t.assignedTo && t.assignedTo._id === agentId
    );
    
    const active = agentTickets.filter((t) => t.status !== "Resolved").length;
    const resolvedTix = agentTickets.filter((t) => t.status === "Resolved");
    const resolved = resolvedTix.length;
    const escalated = agentTickets.filter((t) => t.status === "Escalated").length;
    const total = agentTickets.length;
    
    // Calculate Average CSAT Rating out of 5
    const ratedTickets = resolvedTix.filter((t) => t.rating);
    const avgCsat = ratedTickets.length > 0 
      ? ratedTickets.reduce((acc, t) => acc + t.rating, 0) / ratedTickets.length 
      : null;
    
    let score = 0;
    if (total > 0) {
      score = Math.round(Math.max(0, 100 - (escalated * 5) * (resolved / total || 0.5)));
      if (escalated === 0 && resolved > 0) score += Math.min(10, resolved * 2); 
      
      // Inject CSAT multiplier
      if (avgCsat !== null) {
        // If they have 5 stars, bonus +10. If 1 star, huge penalty -20.
        score += (avgCsat - 3.5) * 10;
      }
    }

    return { 
      active, 
      resolved, 
      escalated, 
      total, 
      avgCsat,
      score: Math.max(0, Math.min(100, Math.round(score || 100))) 
    };
  };

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="surface-card p-6 md:p-8 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold inline-block mb-2">
            Operations
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Agent Performance
          </h1>
          <p className="text-slate-600 mt-2">
            Monitor workloads, resolution metrics, and overall health scores for your support team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const metrics = getAgentMetrics(agent._id);
            return (
              <div key={agent._id} className="surface-card card-lift p-6">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      {agent.name}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">{agent.role}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {agent.expertise?.map((exp) => (
                        <span key={exp} className="badge bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg border-4 ${
                      metrics.score >= 90 ? "border-emerald-400 text-emerald-700 bg-emerald-50" :
                      metrics.score >= 70 ? "border-amber-400 text-amber-700 bg-amber-50" :
                      "border-rose-400 text-rose-700 bg-rose-50"
                    }`}>
                      {metrics.score}
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium">Active Tickets</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.active}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <p className="text-xs text-emerald-700 font-medium">Total Resolved</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">{metrics.resolved}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl flex flex-col justify-between">
                    <p className="text-xs text-amber-700 font-medium">Avg Satisfaction</p>
                    <p className="text-xl font-bold text-amber-700 mt-1 flex items-center gap-1">
                      {metrics.avgCsat ? metrics.avgCsat.toFixed(1) : "N/A"} <span className="text-sm">★</span>
                    </p>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl flex flex-col justify-between">
                    <p className="text-xs text-rose-700 font-medium">Escalated</p>
                    <p className="text-xl font-bold text-rose-700 mt-1">{metrics.escalated}</p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {agents.length === 0 && (
             <div className="col-span-full surface-card p-12 text-center">
               <p className="text-slate-500">No support agents found.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
