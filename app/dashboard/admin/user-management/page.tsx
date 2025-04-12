"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";

export default function UserManagement() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "client",
    password: "", // Add the password field
  });

  const [editUser, setEditUser] = useState(null);
  const [token, setToken] = useState(null); // ✅ Store token separately

  // ✅ Extract token only when session is available
  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      setToken(session.user.token);
      console.log("🛠 Extracted Token:", session.user.token);
    }
  }, [session, status]);

  // ✅ Refresh session manually
  useEffect(() => {
    const refreshSession = async () => {
      const newSession = await getSession();
      console.log("🔄 Manually fetched session:", newSession);
      if (newSession?.user?.token) {
        setToken(newSession.user.token);
      }
    };

    if (!token && status === "authenticated") {
      refreshSession();
    }
  }, [token, status]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    try {
      console.log("Sending Token:", token);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched Data:", data);

      setUsers((prevUsers) =>
        JSON.stringify(prevUsers) !== JSON.stringify(data) ? data : prevUsers
      );
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Ensure this only runs when fetchUsers changes

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !token) {
      setError("Please fill in all fields and ensure you're logged in.");
      return;
    }
    console.log("Adding user with data:", newUser); // Log the newUser data

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/register`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.message || "Failed to add user");
      }

      const data = await response.json();
      // ✅ Make sure _id is used in state update
      setUsers((prevUsers) => [...prevUsers, { ...newUser, id: newUser._id }]);
      setNewUser({ name: "", email: "", role: "client", password: "" }); // Reset password
      setError(null); // Clear any previous error messages
    } catch (error) {
      console.error("❌ Error adding user:", error);
      setError(error.message || "Failed to add user. Please try again.");
    }
  };

  const handleUpdateUser = async (updatedFields) => {
    if (!updatedFields || typeof updatedFields !== "object") {
      console.error(
        "❌ Error: `updatedFields` is missing or invalid",
        updatedFields
      );
      return;
    }

    if (!updatedFields._id) {
      console.error("❌ Error: Missing user ID", updatedFields);
      return;
    }

    if (!token) {
      console.error("❌ Error: Missing token");
      setError("Unauthorized: No token found.");

      return;
    }

    const userId = updatedFields._id; // ✅ Extract correct ID

    console.log("🛠 Updating user details for ID:", userId);
    console.log("🔄 New Data:", updatedFields); // Log what is being sent

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFields), // 🔥 Send full updated user data
        }
      );

      if (!response.ok) {
        throw new Error(`❌ Failed to update user: ${response.statusText}`);
      }

      const updatedUser = await response.json();

      // ✅ Update state with new user details
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === userId ? { ...u, ...updatedUser } : u))
      );

      console.log(`✅ User ${userId} updated successfully.`);
    } catch (error) {
      console.error("❌ Error updating user:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!id) {
      console.error(
        "❌ Error: Missing user ID (Check if `_id` is used correctly)"
      );
      return;
    }

    if (!token) {
      console.error("❌ Error: Missing token");
      return;
    }

    console.log("🛠 Attempting to delete user...");
    console.log("🆔 User ID:", id);
    console.log("🔑 Token:", token);

    // ✅ Optimistically update the UI BEFORE API call
    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== id && user._id !== id)
    );

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`❌ Failed to delete user: ${response.statusText}`);
      }

      // ✅ Update state by filtering out deleted user
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      console.log(`✅ User ${id} deleted successfully.`);
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (status === "loading") return <p>Loading session...</p>;
  if (!token)
    return <p className="text-red-600">Unauthorized: No token found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">
          {editUser ? "Edit User" : "Add User"}
        </h2>
        <div className="flex space-x-2 mb-2">
          <Input
            type="text"
            placeholder="Name"
            value={editUser ? editUser.name : newUser.name}
            onChange={(e) =>
              editUser
                ? setEditUser({ ...editUser, name: e.target.value })
                : setNewUser({ ...newUser, name: e.target.value })
            }
          />
          <Input
            type="email"
            placeholder="Email"
            value={editUser ? editUser.email : newUser.email}
            onChange={(e) =>
              editUser
                ? setEditUser({ ...editUser, email: e.target.value })
                : setNewUser({ ...newUser, email: e.target.value })
            }
          />
          <Input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />

          <select
            className="border p-2 rounded"
            value={editUser ? editUser.role : newUser.role}
            onChange={(e) =>
              editUser
                ? setEditUser({ ...editUser, role: e.target.value })
                : setNewUser({ ...newUser, role: e.target.value })
            }
          >
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button
          onClick={() =>
            editUser ? handleUpdateUser(editUser) : handleAddUser()
          }
        >
          {editUser ? "Update User" : "Add User"}
        </Button>
      </Card>
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr. no</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>{" "}
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditUser(user)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <Trash className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
