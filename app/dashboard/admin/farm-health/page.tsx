"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

interface FarmHealth {
  _id: string;
  farmId: string;
  farmDetails?: {
    name: string;
    location: string;
    size: number;
    userId: string;
  };
  pestPressure: {
    needleValue: number;
    pests: { name: string; level: number }[];
  };
  nutrientStatus: {
    needleValue: number;
    nutrients: { name: string; level: number }[];
  };
  diseaseRisk: {
    needleValue: number;
    riskLevel: string;
    potentialDiseases: string[];
    suggestions: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminFarmHealth() {
  const [farmsWithHealth, setFarmsWithHealth] = useState<FarmHealth[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [editedFarmData, setEditedFarmData] =
    useState<Partial<FarmHealth> | null>(null);

  const searchParams = useSearchParams();
  const farmId = searchParams.get("farmId"); // Retrieve farmId from URL query string

  useEffect(() => {
    if (farmId) {
      console.log("Fetching farm health for farmId:", farmId);
      fetchFarmHealth(farmId);
    }
  }, [farmId]);

  const fetchFarmHealth = async (farmId: string) => {
    setLoading(true);
    try {
      const session = await getSession();
      const token = session?.user?.token;
      if (!token) throw new Error("No token found.");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/farmhealth/${farmId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      console.log("Fetched farm health data:", data); // Log the data
      setFarmsWithHealth([data]);
    } catch (error) {
      console.error("Failed to fetch farm health data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Farms data loaded:", farmsWithHealth); // Log farms data
  }, [farmsWithHealth]);

  const handleEditClick = (farm: FarmHealth) => {
    if (!farm.farmDetails) {
      console.warn("Missing farmDetails for:", farm._id);
    }
    setEditingFarmId(farm._id);
    setEditedFarmData(JSON.parse(JSON.stringify(farm)));
  };

  const handleCancelEdit = () => {
    setEditingFarmId(null);
    setEditedFarmData(null);
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!editedFarmData) return;
    const updatedFarm = JSON.parse(JSON.stringify(editedFarmData));
    const keys = field.split(".");
    let current: any = updatedFarm;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    setEditedFarmData(updatedFarm);
  };

  const handleSave = async () => {
    if (!editedFarmData) return;
    setLoading(true);
    try {
      const session = await getSession();
      const token = session?.user?.token;
      if (!token) throw new Error("No token found.");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/farmhealth/${editingFarmId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editedFarmData),
        }
      );

      if (!res.ok) throw new Error(`Failed to save farm health`);
      const updatedFarm = await res.json();
      const updatedList = farmsWithHealth.map((f) =>
        f._id === editingFarmId ? updatedFarm : f
      );
      setFarmsWithHealth(updatedList);
      handleCancelEdit();
    } catch (error) {
      console.error("Error saving farm health:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (farmId: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete farm health data with ID: ${farmId}?`
    );

    if (confirmDelete) {
      try {
        const session = await getSession();
        const token = session?.user?.token;
        if (!token) throw new Error("No token found.");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/farmhealth/${farmId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error(`Failed to delete farm health data`);
        const result = await res.json();
        alert(result.message); // Success message
        setFarmsWithHealth(
          farmsWithHealth.filter((farm) => farm._id !== farmId)
        );
      } catch (error) {
        console.error("Error deleting farm health:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!loading && farmsWithHealth.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">No farms available.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-6">
        <h1 className="text-3xl text-center font-semibold text-gray-800">
          All Farms Health Overview
        </h1>
        <p className="text-gray-600 text-center mt-2">
          View and monitor farm health data for all clients.
        </p>

        <div className="mt-10 flex justify-center">
          <div className="overflow-auto border border-gray-300 rounded-md">
            <Table className="w-full text-sm text-left border-collapse">
              <TableHeader className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2">
                    Farm Name
                  </th>
                  <th className="border border-gray-300 px-3 py-2">Location</th>
                  <th className="border border-gray-300 px-3 py-2">
                    Pest Pressure
                  </th>
                  <th className="border border-gray-300 px-3 py-2">
                    Nutrient Status
                  </th>
                  <th className="border border-gray-300 px-3 py-2">
                    Disease Risk
                  </th>
                  <th className="border border-gray-300 px-3 py-2">Actions</th>
                </tr>
              </TableHeader>
              <tbody>
                {farmsWithHealth.map((farm) => {
                  const isEditing = editingFarmId === farm._id;
                  const currentFarm = isEditing ? editedFarmData : farm;

                  return (
                    <tr key={farm._id}>
                      <td className="border border-gray-300 px-3 py-2">
                        {currentFarm?.farmDetails?.name ||
                          farm?.farmDetails?.name ||
                          "N/A"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {currentFarm?.farmDetails?.location ||
                          farm?.farmDetails?.location ||
                          "N/A"}
                      </td>
                      {/* Pest Pressure */}
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="font-semibold text-center">
                          Needle Value:{" "}
                          {isEditing ? (
                            <input
                              value={
                                currentFarm?.pestPressure?.needleValue ?? 0
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  "pestPressure.needleValue",
                                  Number(e.target.value)
                                )
                              }
                              className="border px-1"
                            />
                          ) : (
                            currentFarm?.pestPressure?.needleValue
                          )}
                        </div>
                        <table className="w-full text-sm text-left border border-gray-300 mt-2">
                          <thead>
                            <tr>
                              <th className="bg-gray-100 border px-2 py-1">
                                Pest
                              </th>
                              <th className="bg-gray-100 border px-2 py-1">
                                Level
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {currentFarm?.pestPressure?.pests.map((pest, i) => (
                              <tr key={i}>
                                <td className="border px-2 py-1">
                                  {pest.name}
                                </td>
                                <td className="border px-2 py-1">
                                  {isEditing ? (
                                    <input
                                      value={pest.level}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          `pestPressure.pests.${i}.level`,
                                          e.target.value
                                        )
                                      }
                                      className="border px-1"
                                    />
                                  ) : (
                                    pest.level
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                      {/* Nutrient Status */}
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="font-semibold">
                          Needle Value:{" "}
                          {isEditing ? (
                            <input
                              value={
                                currentFarm?.nutrientStatus?.needleValue ?? ""
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  "nutrientStatus.needleValue",
                                  Number(e.target.value)
                                )
                              }
                              className="border px-1"
                            />
                          ) : (
                            currentFarm?.nutrientStatus?.needleValue ?? "N/A"
                          )}
                        </div>

                        <table className="w-full text-sm text-left border border-gray-300 mt-2">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border px-2 py-1">Nutrient</th>
                              <th className="border px-2 py-1">Level</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentFarm?.nutrientStatus?.nutrients?.map(
                              (nutrient, i) => (
                                <tr key={i}>
                                  <td className="border px-2 py-1">
                                    {nutrient.name}
                                  </td>
                                  <td className="border px-2 py-1">
                                    {isEditing ? (
                                      <input
                                        value={nutrient.level}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            `nutrientStatus.nutrients.${i}.level`,
                                            e.target.value
                                          )
                                        }
                                        className="border px-1"
                                      />
                                    ) : (
                                      nutrient.level
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </td>

                      <td className="border border-gray-300 px-3 py-2">
                        <table className="w-full text-sm text-left border border-gray-300">
                          <tbody>
                            {/* Needle Value */}
                            <tr>
                              <th className="bg-gray-100 border px-2 py-1">
                                Needle Value
                              </th>
                              <td className="border px-2 py-1">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={
                                      currentFarm?.diseaseRisk?.needleValue ??
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        "diseaseRisk.needleValue",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="border px-1"
                                  />
                                ) : (
                                  currentFarm?.diseaseRisk?.needleValue ?? "N/A"
                                )}
                              </td>
                            </tr>

                            {/* Potential Diseases */}
                            <tr>
                              <th className="bg-gray-100 border px-2 py-1">
                                Potential Diseases
                              </th>
                              <td className="border px-2 py-1">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={
                                      currentFarm?.diseaseRisk?.potentialDiseases?.join(
                                        ", "
                                      ) ?? ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        "diseaseRisk.potentialDiseases",
                                        e.target.value.split(", ")
                                      )
                                    }
                                    className="border px-1 w-full"
                                  />
                                ) : (
                                  currentFarm?.diseaseRisk?.potentialDiseases?.join(
                                    ", "
                                  ) ?? "N/A"
                                )}
                              </td>
                            </tr>

                            {/* Risk Level */}
                            <tr>
                              <th className="bg-gray-100 border px-2 py-1">
                                Risk Level
                              </th>
                              <td className="border px-2 py-1">
                                {currentFarm?.diseaseRisk?.riskLevel ?? "N/A"}
                              </td>
                            </tr>

                            {/* Suggestions */}
                            <tr>
                              <th className="bg-gray-100 border px-2 py-1">
                                Suggestions
                              </th>
                              <td className="border px-2 py-1">
                                {isEditing ? (
                                  <textarea
                                    value={
                                      currentFarm?.diseaseRisk?.suggestions ??
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        "diseaseRisk.suggestions",
                                        e.target.value
                                      )
                                    }
                                    className="border px-1 py-1 w-full"
                                  />
                                ) : (
                                  currentFarm?.diseaseRisk?.suggestions ?? "N/A"
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>

                      {/* Render editable data */}
                      <td className="border border-gray-300 px-3 py-2">
                        {isEditing ? (
                          <>
                            <Button
                              onClick={handleSave}
                              className="mr-2"
                              disabled={loading}
                            >
                              Save
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleEditClick(farm)}
                              className="mr-2"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(farm._id)}
                              variant="destructive"
                              disabled={isDeleting}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
