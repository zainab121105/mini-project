import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/me", data),
};

// Ticket APIs
export const ticketAPI = {
  createTicket: (data) => api.post("/tickets/create", data),
  getUserTickets: () => api.get("/tickets/user"),
  getAllTickets: (filters) => api.get("/tickets/all", { params: filters }),
  getAssignedTickets: (filters) =>
    api.get("/tickets/assigned", { params: filters }),
  updateTicket: (id, data) => api.put(`/tickets/update/${id}`, data),
  assignTicket: (id, data) => api.put(`/tickets/assign/${id}`, data),
  reopenTicket: (id) => api.put(`/tickets/reopen/${id}`),
  getSupportAgents: () => api.get("/tickets/agents/list"),
  rateTicket: (id, data) => api.post(`/tickets/${id}/rate`, data),
};

// Chat APIs
export const chatAPI = {
  sendMessage: (ticketId, message) =>
    api.post("/chat/send", { ticketId, message }),
  getTicketChat: (ticketId) => api.get(`/chat/ticket/${ticketId}`),
  getUnreadCount: () => api.get("/chat/unread-count"),
  getUserChats: () => api.get("/chat/user-chats"),
  getAgentChats: () => api.get("/chat/agent-chats"),
};

export default api;
