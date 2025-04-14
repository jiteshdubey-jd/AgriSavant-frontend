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
import { Trash } from "lucide-react";

interface CropsType {
  name: string,
  yield: string,
  area: string
}

interface FarmType {
  _id?: string,
  id: string,
  name: string,
  location: string,
  size: string,
  crops: CropsType[]
}

export default function FarmManagement() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [farms, setFarms] = useState<FarmType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFarm, setNewFarm] = useState({
    name: "",
    location: "",
    size: "",
  });
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [editFarmData, setEditFarmData] = useState({
    name: "",
    location: "",
    size: "", // ✅ string
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      setToken(session.user.token);
    }
  }, [session, status]);

  useEffect(() => {
    const refreshSession = async () => {
      const newSession = await getSession();
      if (newSession?.user?.token) setToken(newSession.user.token);
    };
    if (!token && status === "authenticated") refreshSession();
  }, [token, status]);

  const fetchFarms = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/adminFarms`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("Content-Type");
        const errorBody = contentType?.includes("application/json")
          ? await response.json()
          : await response.text();
        throw new Error(
          typeof errorBody === "string"
            ? errorBody
            : errorBody.message || "Failed to fetch farms."
        );
      }

      const data: FarmType[] = await response.json();

      // ✅ Normalize farms so each has a consistent `id`
      const normalizedFarms = data.map((farm) => ({
        ...farm,
        id: farm._id || farm.id,
      }));

      setFarms(normalizedFarms);
    } catch (err) {
      console.error("🚨 Error in fetchFarms:", err);
      setError("Failed to fetch farms.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  const startEditing = (farm: FarmType) => {
    console.log("📦 Full farm object:", farm);
    console.log("🆔 farm._id:", farm._id);
    console.log("🆔 farm.id:", farm.id);
    setEditingFarmId(farm.id); // ✅ Now always available
    setEditFarmData({
      name: farm.name,
      location: farm.location,
      size: farm.size.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingFarmId(null);
    setEditFarmData({ name: "", location: "", size: "" });
  };

  const saveEdit = async () => {
    console.log("💾 saveEdit triggered. editingFarmId:", editingFarmId);
    console.log("🛠 Token sent:", token);
    console.log("🌐 Editing farm:", editingFarmId);

    if (!editingFarmId) {
      console.error("🚨 No editingFarmId set");
      return;
    }

    const { name, location, size } = editFarmData;
    console.log("💾 Saving with data:", {
      name,
      location,
      size: parseInt(size),
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/adminFarms/${editingFarmId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editFarmData.name,
            location: editFarmData.location,
            size: parseInt(editFarmData.size),
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update farm. ${text}`);
      }

      const updated = await response.json();
      setFarms((prev) =>
        prev.map((farm) =>
          (farm._id || farm.id) === editingFarmId ? updated : farm
        )
      );
      cancelEdit();
    } catch (err) {
      console.error(err);
      setError("Failed to update farm.");
    }
  };

  const handleAddFarm = async () => {
    if (!newFarm.name || !newFarm.location || !newFarm.size || !token) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/adminFarms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newFarm,
            size: parseInt(newFarm.size),
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to add farm.");
      const createdFarm = await response.json();
      //   setFarms((prev) => [...prev, createdFarm]);
      setFarms((prev) => [...prev, { ...createdFarm, id: createdFarm._id }]);

      setNewFarm({ name: "", location: "", size: "" });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to add farm.");
    }
  };

  const handleDeleteFarm = async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/adminFarms/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete farm.");
      setFarms((prev) => prev.filter((farm) => (farm._id || farm.id) !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete farm.");
    }
  };

  if (loading) return <p>Loading farms...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!token) return <p className="text-red-600">Unauthorized</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Farm Management</h1>
      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Add Farm</h2>
        <div className="flex space-x-2 mb-2">
          <Input
            placeholder="Name"
            value={newFarm.name}
            onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
          />
          <Input
            placeholder="Location"
            value={newFarm.location}
            onChange={(e) =>
              setNewFarm({ ...newFarm, location: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Size (acres)"
            value={newFarm.size}
            onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })}
          />
          <Button onClick={handleAddFarm}>Add Farm</Button>
        </div>
      </Card>
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr. no</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Size (acres)</TableHead>
              <TableHead>Crops</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {farms.length > 0 ? (
              farms.map((farm, index) => {
                const farmId = farm._id || farm.id as string;
                return (
                  <TableRow key={farmId}>
                    <TableCell>{index + 1}</TableCell>
                    {editingFarmId === farmId ? (
                      <>
                        <TableCell>
                          <Input
                            value={editFarmData.name}
                            onChange={(e) =>
                              setEditFarmData({
                                ...editFarmData,
                                name: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editFarmData.location}
                            onChange={(e) =>
                              setEditFarmData({
                                ...editFarmData,
                                location: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editFarmData.size}
                            onChange={(e) =>
                              setEditFarmData({
                                ...editFarmData,
                                size: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <em className="text-gray-500">
                            Editing not available
                          </em>
                        </TableCell>
                        <TableCell className="flex space-x-2">
                          <Button size="sm" onClick={saveEdit}>
                            Save
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{farm.name}</TableCell>
                        <TableCell>{farm.location}</TableCell>
                        <TableCell>{farm.size}</TableCell>
                        <TableCell>
                          <ul className="text-sm list-disc pl-4">
                            {farm.crops?.map((crop, idx) => (
                              <li key={idx}>
                                {crop.name} – {crop.area} acres, Yield:{" "}
                                {crop.yield}
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell className="flex space-x-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditing(farm)}
                          >
                            ✏️
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteFarm(farmId)}
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No farms found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
