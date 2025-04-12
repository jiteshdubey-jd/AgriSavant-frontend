"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface AdminData {
  _id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  address?: string;
  country?: string;
  state?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [formData, setFormData] = useState({
    mobileNumber: "",
    address: "",
    country: "",
    state: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (session.user.role === "client") {
      router.push("/dashboard/client");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const token = session.user.token;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/profile`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch admin");

        setAdmin(data);
        setFormData({
          mobileNumber: data.mobileNumber || "",
          address: data.address || "",
          country: data.country || "",
          state: data.state || "",
        });
      } catch (err) {
        setError("Failed to fetch admin details");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [session, status, router]);

  const handleSaveProfile = async () => {
    if (!session?.user?.token || !admin) return;

    try {
      const res = await fetch(`${process.env.MONGODB_URI}/api/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Update failed");
      }

      setAdmin(result);
      toast.success("Profile updated successfully");
      setSuccess("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
      setError("Failed to update profile");
    }
  };

  if (loading) return <p className="text-center text-lg">Loading profile...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="gap-8 p-8">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Admin Profile</h2>
        <div className="grid gap-4">
          <Label>Name</Label>
          <Input value={admin?.name || ""} readOnly />

          <Label>Email</Label>
          <Input value={admin?.email || ""} readOnly />

          <Label>Mobile Number</Label>
          <Input
            placeholder="Enter mobile number"
            value={formData.mobileNumber}
            onChange={(e) =>
              setFormData({ ...formData, mobileNumber: e.target.value })
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
            placeholder="Enter country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
          />

          <Label>State</Label>
          <Input
            placeholder="Enter state"
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
