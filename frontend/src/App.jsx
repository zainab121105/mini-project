import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UserDashboard from "./pages/UserDashboard";
import TicketDetailPage from "./pages/TicketDetailPage";
import AgentDashboard from "./pages/AgentDashboard";
import AgentActionsPage from "./pages/AgentActionsPage";
import ManagerDashboard from "./pages/ManagerDashboard";
import ReportsPage from "./pages/ReportsPage";
import AgentPerformancePage from "./pages/AgentPerformancePage";
import CreateTicketPage from "./pages/CreateTicketPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const { token, user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={!token ? <LoginPage /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/register"
        element={!token ? <RegisterPage /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/forgot-password"
        element={!token ? <ForgotPasswordPage /> : <Navigate to="/dashboard" />}
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-ticket"
        element={
          <ProtectedRoute>
            <CreateTicketPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ticket/:ticketId"
        element={
          <ProtectedRoute>
            <TicketDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent-dashboard"
        element={
          <ProtectedRoute requiredRole="agent">
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent-actions"
        element={
          <ProtectedRoute requiredRole="agent">
            <AgentActionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager-dashboard"
        element={
          <ProtectedRoute requiredRole="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredRole="manager">
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/performance"
        element={
          <ProtectedRoute requiredRole="manager">
            <AgentPerformancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200">
            <Router>
              <ToastContainer />
              <AppRoutes />
            </Router>
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
