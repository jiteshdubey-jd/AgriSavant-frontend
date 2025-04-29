"use client";

import { useState } from "react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">⚙️ Admin Settings</h1>

      {/* Sidebar Navigation */}
      <div className="flex">
        <aside className="w-1/4 p-4 bg-gray-100 rounded-lg">
          <nav>
            {[
              { key: "general", label: "General Settings" },
              { key: "users", label: "User Management" },
              { key: "security", label: "Security" },
              { key: "api", label: "API & Integrations" },
              { key: "notifications", label: "Notifications" },
              { key: "logs", label: "Activity Logs" },
              { key: "backup", label: "Backup & Restore" },
              { key: "performance", label: "Performance Monitoring" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`block w-full text-left p-2 mb-2 rounded-lg ${
                  activeTab === tab.key ? "bg-blue-500 text-white" : "bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Panel */}
        <div className="w-3/4 p-4 bg-white shadow rounded-lg">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "api" && <APISettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "logs" && <LogsActivity />}
          {activeTab === "backup" && <BackupRestore />}
          {activeTab === "performance" && <PerformanceMonitoring />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

/* Components for Each Tab */
const GeneralSettings = () => (
  <div>
    <h2 className="text-lg font-bold mb-2">🌎 General Settings</h2>
    <label className="block mb-2">Admin Name</label>
    <input type="text" className="w-full p-2 border rounded mb-2" placeholder="Enter name" />

    <label className="block mb-2">Company Name</label>
    <input type="text" className="w-full p-2 border rounded mb-2" placeholder="Enter company name" />

    <label className="block mb-2">Timezone</label>
    <select className="w-full p-2 border rounded">
      <option>UTC</option>
      <option>PST</option>
      <option>EST</option>
    </select>
  </div>
);

const UserManagement = () => (
  <div>
    <h2 className="text-lg font-bold mb-2">👥 User Management</h2>
    <button className="bg-blue-500 text-white p-2 rounded">Add New Admin</button>
    <p className="mt-4">Manage admin roles, enable/disable accounts.</p>
  </div>
);

const SecuritySettings = () => (
  <div>
    <h2 className="text-lg font-bold mb-2">🔒 Security Settings</h2>
    <label className="block mb-2">Change Password</label>
    <input type="password" className="w-full p-2 border rounded mb-2" placeholder="New Password" />

    <label className="block mb-2">Enable 2FA</label>
    <button className="bg-green-500 text-white p-2 rounded">Enable</button>
  </div>
);

const APISettings = () => (
  <div>
    <h2 className="text-lg font-bold mb-2">🔑 API & Integrations</h2>
    <p>Manage API keys and third-party integrations.</p>
  </div>
);

const NotificationSettings = () => (
  <div>
    <h2 className="text-lg font-bold mb-2">📢 Notification Settings</h2>
    <label className="block mb-2">Email Notifications</label>
    <input type="checkbox" className="mr-2" />
    Enable email notifications
  </div>
);

const LogsActivity = () => (
  <div>
    <h2 className="text-lg font-bold mb-2">📜 Activity Logs</h2>
    <p>View system logs and track changes made by admins.</p>
  </div>
);

const BackupRestore = () => (
  <div>
    <h2 className="text-lg font-bold mb-2">💾 Backup & Restore</h2>
    <button className="bg-blue-500 text-white p-2 rounded">Backup Now</button>
    <p className="mt-4">Schedule automatic backups and restore previous data.</p>
  </div>
);

const PerformanceMonitoring = () => (
  <div>
    <h2 className="text-lg font-bold mb-2">📊 Performance Monitoring</h2>
    <p>Monitor server performance and system logs.</p>
  </div>
);
