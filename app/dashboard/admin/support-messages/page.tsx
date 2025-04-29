"use client";

import { useState } from "react";

const SupportMessagesPage = () => {
  const [message, setMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [tickets, setTickets] = useState([
    { id: 1, subject: "Login Issue", status: "Open" },
    { id: 2, subject: "Payment Error", status: "Resolved" },
  ]);
  const [messages, setMessages] = useState([
    { id: 1, sender: "User1", text: "Hello, I need help!", time: "10:30 AM" },
    {
      id: 2,
      sender: "User2",
      text: "Is there an update on my ticket?",
      time: "11:00 AM",
    },
  ]);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Support request submitted!");
    setMessage("");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: "Admin",
        text: newMessage,
        time: "Now",
      },
    ]);
    setNewMessage("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🛠 Support & Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 📌 Support Section */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold">❓ Support</h2>

          {/* FAQs */}
          <div className="mt-4">
            <h3 className="font-semibold">Common Questions</h3>
            <ul className="list-disc ml-6 text-sm">
              <li>How do I reset my password?</li>
              <li>How to update billing information?</li>
              <li>How to contact customer support?</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="mt-4">
            <h3 className="font-semibold">📩 Submit a Ticket</h3>
            <form onSubmit={handleSupportSubmit} className="mt-2">
              <textarea
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Describe your issue..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                Submit
              </button>
            </form>
          </div>

          {/* Ticket Status */}
          <div className="mt-4">
            <h3 className="font-semibold">📜 Ticket Status</h3>
            <ul>
              {tickets.map((ticket) => (
                <li key={ticket.id} className="border-b py-2">
                  {ticket.subject} -{" "}
                  <span className="font-bold">{ticket.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 📌 Messages Section */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold">💬 Messages</h2>

          {/* Messages Inbox */}
          <div className="mt-4">
            <h3 className="font-semibold">📥 Inbox</h3>
            <ul>
              {messages.map((msg) => (
                <li key={msg.id} className="border-b py-2">
                  <strong>{msg.sender}</strong>: {msg.text}{" "}
                  <span className="text-gray-500">({msg.time})</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat Box */}
          <div className="mt-4">
            <h3 className="font-semibold">📨 Send a Message</h3>
            <form onSubmit={handleSendMessage} className="mt-2">
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportMessagesPage;
