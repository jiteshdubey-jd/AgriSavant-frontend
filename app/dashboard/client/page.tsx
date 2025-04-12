"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ClientData {
  _id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  address?: string;
  country?: string;
  state?: string;
}

export default function ClientDashboard() {
  const { data: session, status } = useSession(); // ✅ include status
  const router = useRouter();

  const [client, setClient] = useState<ClientData | null>(null);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    country: "",
    state: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role === "admin") {
      router.push("/dashboard/admin");
      return;
    }

    const fetchClientData = async () => {
      try {
        if (!session?.user?.token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clients`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.user.token}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error(`Error: ${userResponse.statusText}`);
        }

        const userData = await userResponse.json();

        if (!userData || userData.error) {
          setError(userData.error || "User data not found");
          setLoading(false);
          return;
        }

        setClient(userData);
        setFormData({
          phone: userData.mobileNumber || "",
          address: userData.address || "",
          country: userData.country || "",
          state: userData.state || "",
        });

        setLoading(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchClientData();
    }
  }, [session, status, router]);

  const handleSaveProfile = async () => {
    if (!session?.user?.token) {
      console.error("No session token found.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clients`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.token}`,
          },
          body: JSON.stringify({
            mobileNumber: formData.phone,
            address: formData.address,
            country: formData.country,
            state: formData.state,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile.");
      }

      setSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Update Error:", error);
      setError("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="gap-8 p-8">
      {/* Profile Settings */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>
        <div className="grid gap-4">
          <Label>Name</Label>
          <Input value={client?.name || ""} readOnly />
          <Label>Email</Label>
          <Input value={client?.email || ""} readOnly />
          <Label>Mobile Number</Label>
          <Input
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <Label>Address</Label>
          <Input
            placeholder="Enter address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
          <Label>Country</Label>
          <Input
            placeholder="Country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
          />
          <Label>State/Region</Label>
          <Input
            placeholder="State"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
          />
          <Button className="mt-4" onClick={handleSaveProfile}>
            Save Profile
          </Button>
          {success && <p className="text-green-600">{success}</p>}
        </div>
      </Card>
    </div>
  );
}
