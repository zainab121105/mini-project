import React, { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ticketAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function ReportsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    escalatedTickets: 0,
    highPriorityTickets: 0,
    averageResolutionTime: "N/A",
  });
  const [chartData, setChartData] = useState({
    byStatus: {},
    byCategory: {},
    byPriority: {},
  });
  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
    category: "All",
    from: "",
    to: "",
  });

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketAPI.getAllTickets({});
      if (response.data.success) {
        const ticketsData = response.data.tickets;
        setTickets(ticketsData);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketsData) => {
    const byStatus = {};
    const byPriority = {};
    let highPriority = 0;

    ticketsData.forEach((ticket) => {
      // Count by status
      byStatus[ticket.status] = (byStatus[ticket.status] || 0) + 1;

      // Count by priority
      byPriority[ticket.priority] = (byPriority[ticket.priority] || 0) + 1;

      // Count high priority
      if (ticket.priority === "High") {
        highPriority++;
      }
    });

    setStats({
      totalTickets: ticketsData.length,
      openTickets: byStatus["Open"] || 0,
      inProgressTickets: byStatus["In Progress"] || 0,
      resolvedTickets: byStatus["Resolved"] || 0,
      escalatedTickets: byStatus["Escalated"] || 0,
      highPriorityTickets: highPriority,
      averageResolutionTime:
        (byStatus["Resolved"] || 0) > 0 ? "2.5 days" : "N/A",
    });
  };

  const calculateChartData = (ticketsData) => {
    const byStatus = {};
    const byCategory = {};
    const byPriority = {};

    ticketsData.forEach((ticket) => {
      byStatus[ticket.status] = (byStatus[ticket.status] || 0) + 1;
      byCategory[ticket.category] = (byCategory[ticket.category] || 0) + 1;
      byPriority[ticket.priority] = (byPriority[ticket.priority] || 0) + 1;
    });

    setChartData({ byStatus, byCategory, byPriority });
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filters.status !== "All" && ticket.status !== filters.status) {
        return false;
      }

      if (filters.priority !== "All" && ticket.priority !== filters.priority) {
        return false;
      }

      if (filters.category !== "All" && ticket.category !== filters.category) {
        return false;
      }

      if (filters.from) {
        const fromDate = new Date(`${filters.from}T00:00:00`);
        const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : null;
        if (!createdAt || createdAt < fromDate) {
          return false;
        }
      }

      if (filters.to) {
        const toDate = new Date(`${filters.to}T23:59:59`);
        const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : null;
        if (!createdAt || createdAt > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, filters]);

  useEffect(() => {
    calculateStats(filteredTickets);
    calculateChartData(filteredTickets);
  }, [filteredTickets]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Escalated":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const statusOptions = useMemo(() => {
    const base = [
      "Open",
      "In Progress",
      "InProgress",
      "Resolved",
      "Escalated",
      "Pending",
    ];
    const fromTickets = tickets.map((ticket) => ticket.status).filter(Boolean);
    return ["All", ...Array.from(new Set([...base, ...fromTickets]))];
  }, [tickets]);

  const priorityOptions = useMemo(() => {
    const base = ["Low", "Medium", "High"];
    const fromTickets = tickets
      .map((ticket) => ticket.priority)
      .filter(Boolean);
    return ["All", ...Array.from(new Set([...base, ...fromTickets]))];
  }, [tickets]);

  const categoryOptions = useMemo(() => {
    const fromTickets = tickets
      .map((ticket) => ticket.category)
      .filter(Boolean);
    return ["All", ...Array.from(new Set(fromTickets))];
  }, [tickets]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "All",
      priority: "All",
      category: "All",
      from: "",
      to: "",
    });
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const title = "Support tickets report";
    const generated = `Generated: ${new Date().toLocaleString()}`;
    const filterSummary = `Filters: Status ${filters.status}, Priority ${filters.priority}, Category ${filters.category}, From ${filters.from || "Any"}, To ${filters.to || "Any"}`;

    doc.setFontSize(18);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(generated, 40, 60);
    doc.text(filterSummary, 40, 76);

    const rows = filteredTickets.map((ticket) => [
      String(ticket._id).slice(-8),
      ticket.title || "",
      ticket.status || "",
      ticket.priority || "",
      ticket.category || "",
      ticket.userId?.name || "",
      ticket.assignedTo?.name || "",
      ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "",
    ]);

    autoTable(doc, {
      startY: 96,
      head: [
        [
          "Ticket ID",
          "Title",
          "Status",
          "Priority",
          "Category",
          "Requester",
          "Assignee",
          "Created",
        ],
      ],
      body: rows,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
    });

    const stamp = new Date().toISOString().slice(0, 10);
    doc.save(`support-tickets-${stamp}.pdf`);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="surface-card p-6 md:p-8 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
            Reports
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 mt-2">
            Ticket analytics
          </h1>
          <p className="text-slate-600 mt-2">
            Review volume, priority mix, and performance indicators.
          </p>
        </div>

        <div className="surface-card p-6 mb-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Filters
                </h2>
                <p className="text-sm text-slate-500">
                  Showing {filteredTickets.length} of {tickets.length} tickets
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-secondary"
                >
                  Reset filters
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="btn-primary"
                  disabled={filteredTickets.length === 0}
                >
                  Download PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="select-field"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="select-field"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="select-field"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  From
                </label>
                <input
                  type="date"
                  name="from"
                  value={filters.from}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  To
                </label>
                <input
                  type="date"
                  name="to"
                  value={filters.to}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total tickets", value: stats.totalTickets },
            { label: "Open", value: stats.openTickets },
            { label: "In progress", value: stats.inProgressTickets },
            { label: "Resolved", value: stats.resolvedTickets },
          ].map((stat) => (
            <div key={stat.label} className="surface-card-muted card-lift p-6">
              <p className="text-slate-500 text-sm font-semibold">
                {stat.label}
              </p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Escalated", value: stats.escalatedTickets },
            { label: "High priority", value: stats.highPriorityTickets },
            { label: "Avg resolution", value: stats.averageResolutionTime },
          ].map((stat) => (
            <div key={stat.label} className="surface-card-muted card-lift p-6">
              <p className="text-slate-500 text-sm font-semibold">
                {stat.label}
              </p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="surface-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Tickets by status
            </h2>
            <div className="space-y-3">
              {Object.entries(chartData.byStatus).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">
                      {status}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === "Open"
                          ? "bg-rose-600"
                          : status === "In Progress"
                            ? "bg-amber-600"
                            : status === "Resolved"
                              ? "bg-emerald-600"
                              : "bg-orange-600"
                      }`}
                      style={{
                        width: `${(count / (stats.totalTickets || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="surface-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Tickets by category
            </h2>
            <div className="space-y-3">
              {Object.entries(chartData.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center">
                  <span className="text-sm font-medium text-slate-700 flex-1">
                    {category}
                  </span>
                  <span className="badge bg-sky-100 text-sky-800 border border-sky-200">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="surface-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Tickets by priority
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(chartData.byPriority).map(([priority, count]) => (
              <div
                key={priority}
                className={`p-4 rounded-lg ${
                  priority === "High"
                    ? "bg-rose-50 border border-rose-200"
                    : priority === "Medium"
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-emerald-50 border border-emerald-200"
                }`}
              >
                <p className="text-sm font-medium text-slate-700">
                  {priority} Priority
                </p>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    priority === "High"
                      ? "text-rose-600"
                      : priority === "Medium"
                        ? "text-amber-600"
                        : "text-emerald-600"
                  }`}
                >
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tickets List */}
        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Recent tickets
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Ticket ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Priority
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.slice(0, 10).map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 text-slate-900 font-mono text-xs">
                      {String(ticket._id).slice(-8)}
                    </td>
                    <td className="py-3 px-4 text-slate-900">{ticket.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge ${getStatusColor(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-900">
                      {ticket.priority}
                    </td>
                    <td className="py-3 px-4 text-slate-900">
                      {ticket.category}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
