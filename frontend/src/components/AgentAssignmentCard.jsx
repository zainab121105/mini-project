import React, { useState, useEffect } from "react";

export default function AgentAssignmentCard({
  ticket,
  agents,
  onAssign,
  loading,
}) {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [recommendedAgent, setRecommendedAgent] = useState(null);

  useEffect(() => {
    // Find recommended agent based on ticket category
    const recommended = agents?.find((agent) =>
      agent.expertise.includes(ticket.category),
    );
    setRecommendedAgent(recommended);
    if (recommended) {
      setSelectedAgent(recommended._id);
    }
  }, [ticket.category, agents]);

  const handleAssign = () => {
    if (selectedAgent) {
      onAssign(ticket._id, selectedAgent);
    }
  };

  const getExpertiseColor = (expertise) => {
    switch (expertise) {
      case "Bug":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      case "Feature":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Payment":
        return "bg-sky-100 text-sky-800 border border-sky-200";
      case "Login":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Developer":
        return "👨‍💻";
      case "Payment Specialist":
        return "💳";
      case "Support Engineer":
        return "🔧";
      case "Generalist":
        return "👤";
      default:
        return "👤";
    }
  };

  return (
    <div className="surface-card-muted card-lift p-5">
      <h3 className="font-semibold text-slate-900 mb-3">Assign to agent</h3>

      {ticket.assignedTo ? (
        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-emerald-900 font-semibold text-sm">
            Assigned to <strong>{ticket.assignedTo.name}</strong> (
            {ticket.assignedTo.role})
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
            {agents?.map((agent) => (
              <div
                key={agent._id}
                onClick={() => setSelectedAgent(agent._id)}
                className={`p-3 rounded-lg cursor-pointer border-2 transition ${
                  selectedAgent === agent._id
                    ? "bg-white border-amber-400 shadow-md"
                    : "bg-white border-slate-200 hover:border-amber-200"
                } ${
                  recommendedAgent?._id === agent._id &&
                  selectedAgent !== agent._id
                    ? "border-l-4 border-l-emerald-400"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {getRoleIcon(agent.role)} {agent.name}
                    </p>
                    <p className="text-xs text-gray-600">{agent.role}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.expertise.map((exp) => (
                        <span
                          key={exp}
                          className={`badge ${getExpertiseColor(exp)}`}
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                  {recommendedAgent?._id === agent._id && (
                    <span
                      className="text-lg"
                      title="Recommended for this category"
                    >
                      Rec
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedAgent && (
            <button
              onClick={handleAssign}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? "Assigning..." : "Assign ticket"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
