"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const ReportAnalytics = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  const token = session?.user?.token;
  console.log("✅ Token:", token);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.token) return;

    const fetchData = async () => {
      try {
        // Fetch Users
        const userRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!userRes.ok) throw new Error("Failed to fetch users");
        const usersData = await userRes.json();
        setUsers(usersData);

        // Fetch Activity Logs
        const logsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!logsRes.ok) throw new Error("Failed to fetch logs");
        const logsData = await logsRes.json();
        setLogs(logsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // 📊 Calculate Role Distribution
  const roleData = [
    { role: "Admin", count: users.filter((u) => u.role === "admin").length },
    { role: "Client", count: users.filter((u) => u.role === "client").length },
  ];

  // 📈 Generate User Signup Trends
  const signupTrends = users.reduce((acc, user) => {
    const date = new Date(user.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const signupChartData = Object.entries(signupTrends).map(([date, count]) => ({
    date,
    signups: count,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Report & Analytics</h1>

      {/* 📌 User Statistics */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold">👥 User Statistics</h2>
        <p>Total Users: {users.length}</p>
        <p>Active Users: {users.filter((u) => u.isActive).length}</p>
        <p>New Signups (Last 7 Days): {signupChartData.length}</p>
      </div>

      {/* 📌 Role Distribution */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold">📌 Role Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={roleData}>
            <XAxis dataKey="role" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📌 User Signup Trends */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold">📈 User Signup Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={signupChartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="signups" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📌 Recent Activity Logs */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold">📜 Recent Activity</h2>
        <ul>
          {logs.map((log) => (
            <li key={log._id} className="border-b py-2">
              {new Date(log.createdAt).toLocaleString()} - {log.action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportAnalytics;
