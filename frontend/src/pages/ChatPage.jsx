import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { chatAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (activeChat) {
      const ticketId = activeChat._id || activeChat.ticketId;
      fetchMessages(ticketId);
      const interval = setInterval(() => fetchMessages(ticketId), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const fetchChats = async () => {
    try {
      // Use different API based on user role
      const response =
        user.role === "agent"
          ? await chatAPI.getAgentChats()
          : await chatAPI.getUserChats();
      if (response.data.success) {
        setChats(response.data.chats);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId) => {
    try {
      const response = await chatAPI.getTicketChat(ticketId);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    setSending(true);
    try {
      const ticketId = activeChat._id || activeChat.ticketId;
      const response = await chatAPI.sendMessage(ticketId, newMessage);

      if (response.data.success) {
        setMessages([...messages, response.data.chat]);
        setNewMessage("");
        fetchChats();
      }
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="surface-card p-6 md:p-8 mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
            Messages
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 mt-2">
            Conversations
          </h1>
          <p className="text-slate-600 mt-2">
            Keep ticket discussions in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="surface-card overflow-hidden">
            <div className="p-4 border-b border-amber-100/70 bg-amber-50/60">
              <h2 className="font-semibold text-slate-900">Conversations</h2>
            </div>

            {chats.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y max-h-96 overflow-y-auto">
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => setActiveChat(chat)}
                    className={`p-4 cursor-pointer hover:bg-amber-50 transition ${
                      activeChat?._id === chat._id
                        ? "bg-amber-50 border-l-4 border-amber-500"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {chat.latestMessage?.senderRole === "agent"
                            ? "Support Agent"
                            : "You"}
                        </p>
                        <p className="text-sm text-slate-600 truncate">
                          {chat.latestMessage?.message || "No messages"}
                        </p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="inline-block bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 surface-card flex flex-col overflow-hidden">
            {activeChat ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-amber-100/70 bg-amber-50/60">
                  <h3 className="font-semibold text-slate-900">
                    {activeChat.latestMessage?.senderRole === "agent"
                      ? "Support Agent"
                      : "Your Conversation"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Ticket: {activeChat.ticketDetails?.[0]?.title || "Ticket"}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-amber-50/40">
                  {messages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-8">
                      <p>Start a conversation</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const senderIdStr =
                        typeof msg.senderId === "object"
                          ? msg.senderId?._id
                          : msg.senderId;
                      const isOwnMessage =
                        String(senderIdStr) === String(user.id);
                      return (
                        <div
                          key={msg._id || idx}
                          className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? "bg-amber-500 text-white shadow"
                                : "bg-white text-slate-900 border border-amber-100 shadow-sm"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-slate-200 p-4"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="input-field flex-1"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="btn-primary px-4 py-2 disabled:opacity-60"
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
