import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { chatAPI } from "../services/api";

export default function ChatBox({
  ticketId,
  assignedAgentName,
  assignedAgentEmail,
  ticketTitle,
  ticketStatus,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await chatAPI.getTicketChat(ticketId);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [ticketId]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!polling) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [ticketId, polling]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await chatAPI.sendMessage(ticketId, newMessage);
      if (response.data.success) {
        setMessages([...messages, response.data.chat]);
        setNewMessage("");
        scrollToBottom();
      }
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  // Check if it's a different day
  const isDifferentDay = (msg1, msg2) => {
    if (!msg1 || !msg2) return true;
    const date1 = new Date(msg1.createdAt).toDateString();
    const date2 = new Date(msg2.createdAt).toDateString();
    return date1 !== date2;
  };

  const canChat = ticketStatus !== "Resolved";

  return (
    <div className="surface-card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-amber-100/70 bg-amber-50/80 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">
              Conversation
            </h3>
            <p className="text-sm text-slate-600">Ticket: {ticketTitle}</p>
            {assignedAgentName && (
              <p className="text-sm text-slate-600 mt-1">
                Agent: {assignedAgentName}
              </p>
            )}
          </div>
          {ticketStatus === "Resolved" && (
            <div className="bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800">
              Resolved
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/40">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const senderIdStr =
              typeof msg.senderId === "object"
                ? msg.senderId?._id
                : msg.senderId;
            const isOwnMessage = String(senderIdStr) === String(user.id);
            const showDateSeparator =
              idx === 0 || isDifferentDay(messages[idx - 1], msg);

            return (
              <div key={msg._id}>
                {showDateSeparator && (
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-xs text-gray-500">
                      {formatDate(msg.createdAt)}
                    </span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                )}

                <div
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-amber-500 text-white rounded-br-none shadow"
                        : "bg-white text-slate-900 rounded-bl-none border border-amber-100 shadow-sm"
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1">
                      {typeof msg.senderId === "object"
                        ? msg.senderId?.name
                        : "User"}{" "}
                      {msg.senderRole === "agent" && "Support"}
                    </p>
                    <p className="break-words">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-amber-100" : "text-slate-500"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                      {!msg.isRead && isOwnMessage && " ⏱️"}
                      {msg.isRead && isOwnMessage && " ✓"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Hidden if ticket is resolved */}
      {canChat ? (
        <form
          onSubmit={handleSendMessage}
          className="border-t border-amber-100/70 p-4 bg-white"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Messages refresh every 3 seconds
          </p>
        </form>
      ) : (
        <div className="border-t border-amber-100/70 p-4 bg-amber-50">
          <p className="text-sm text-amber-800 text-center">
            Ticket is resolved. New messages cannot be sent.
          </p>
        </div>
      )}
    </div>
  );
}
