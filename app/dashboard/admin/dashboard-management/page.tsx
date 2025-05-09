"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
interface ChartDataPoint {
  day?: string;
  time?: string;
  name?: string;
  value: number;
}
interface DashboardEntry {
  _id: string;
  userId: string;
  farmId: {
    _id: string;
    name: string;
    location: string;
  };
  charts: {
    rh: ChartDataPoint[]; // Relative Humidity data
    temp: ChartDataPoint[]; // Temperature data
    rainfall: ChartDataPoint[]; // Rainfall data
  };
  weather: {
    forecast: string;
    temperature: string;
    humidity: string;
  };
  soil: {
    pH: number;
    moisture: string;
  };
  upcomingTasks: string[];
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}
export default function DashboardManagementPage() {
  const { data: session, status } = useSession();
  const [dashboards, setDashboards] = useState<DashboardEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<DashboardEntry | null>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [mergedData, setMergedData] = useState<DashboardEntry[]>([]);

  const [newEntry, setNewEntry] = useState({
    farmId: { name: "", location: "" },
    weather: { forecast: "", temperature: "", humidity: "" },
    soil: { pH: 0, moisture: "" },
    upcomingTasks: [],
    image: "",
    charts: {
      rh: Array(5).fill({ day: "", value: 0 }),
      temp: Array(5).fill({ time: "", value: 0 }),
      rainfall: Array(5).fill({ name: "", value: 0 }),
    },
  });

  const userId = session?.user?.id;
  const token = session?.user?.token;

  // Fetch all dashboard data, including all necessary fields
  const fetchDashboards = async () => {
    if (!userId || !token) {
      console.error("User ID or Token not provided.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDashboards(data);
      } else {
        console.error("Error fetching dashboards:", data.message);
      }
    } catch (error) {
      console.error("Error fetching dashboards:", error);
    }
  };

  const fetchFarms = async () => {
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
      const data = await response.json();
      if (response.ok) {
        setFarms(data);
      } else {
        console.error("Error fetching farms:", data.message);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && userId && token) {
      fetchFarms();
      fetchDashboards();
    }
  }, [status, userId, token]);

  useEffect(() => {
    if (farms.length && dashboards.length) {
      const merged = farms.map((farm) => {
        const matchingDashboard = dashboards.find(
          (dash) => dash.farmId._id === farm._id
        );

        return matchingDashboard
          ? matchingDashboard
          : {
              _id: `no-dashboard-${farm._id}`,
              userId: userId ?? "", // ✅ fix here
              farmId: {
                _id: farm._id,
                name: farm.name,
                location: farm.location,
              },
              charts: {
                rh: [],
                temp: [],
                rainfall: [],
              },
              weather: {
                forecast: "",
                temperature: "",
                humidity: "",
              },
              soil: {
                pH: 0,
                moisture: "",
              },
              upcomingTasks: [],
              image: "",
            };
      });

      setMergedData(merged);
    }
  }, [farms, dashboards]);

  const handleInputChange = (farmId: string, field: string, value: any) => {
    setMergedData((prevData) =>
      prevData.map((item) =>
        item._id === farmId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async (dashboardId?: string) => {
    if (!userId || !token || !editingEntry) return;

    const isNew = !dashboardId || dashboardId.startsWith("no-dashboard");
    const url = isNew
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard/${dashboardId}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...editingEntry, userId }),
      });

      if (res.ok) {
        await fetchDashboards();
        setEditingEntry(null);
      } else {
        const data = await res.json();
        console.error("Failed to save:", data.message);
      }
    } catch (error) {
      console.error("Error saving dashboard:", error);
    }
  };

  const handleAddNewEntry = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        }
      );

      if (!res.ok) throw new Error("Failed to add dashboard data");

      const saved = await res.json();
      setMergedData((prev) => [...prev, saved]);
      setNewEntry({
        farmId: { name: "", location: "" },
        weather: { forecast: "", temperature: "", humidity: "" },
        soil: { pH: 0, moisture: "" },
        upcomingTasks: [],
        image: "",
        charts: {
          rh: Array(5).fill({ day: "", value: 0 }),
          temp: Array(5).fill({ time: "", value: 0 }),
          rainfall: Array(5).fill({ name: "", value: 0 }),
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (dashboardId: string) => {
    if (!userId || !token) return;
    const confirmDelete = confirm(
      "Are you sure you want to delete this dashboard?"
    );
    if (!confirmDelete) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard/${dashboardId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        await fetchDashboards(); // Refresh list after deletion
      } else {
        const errorData = await res.json();
        console.error("Error deleting dashboard:", errorData.message);
      }
    } catch (error) {
      console.error("Error deleting dashboard:", error);
    }
  };
  if (status === "loading") {
    return <p className="text-center p-10">Loading session...</p>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Admin Dashboard Management
      </h1>
      <div className="overflow-x-auto max-w-full">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Farm Name</th>
              <th className="border p-2">Weather Forecast</th>
              <th className="border p-2">Temperature</th>
              <th className="border p-2">Humidity</th>
              <th className="border p-2">Soil pH</th>
              <th className="border p-2">Soil Moisture</th>
              <th className="border p-2">Upcoming Tasks</th>
              <th className="border p-2">Image URL</th>
              <th className="border p-2">Relative Humidity</th>
              <th className="border p-2">Temperature Data</th>
              <th className="border p-2">Rainfall</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mergedData.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center p-4">
                  No dashboards found.
                </td>
              </tr>
            ) : (
              mergedData.map((dash) => (
                <tr key={dash._id}>
                  <td className="border p-2">
                    {editingEntry?._id === dash._id ? (
                      <Input
                        value={editingEntry.farmId.name}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            farmId: {
                              ...editingEntry.farmId,
                              name: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      dash.farmId.name
                    )}
                  </td>
                  <td className="border p-2">
                    {editingEntry?._id === dash._id ? (
                      <Input
                        value={editingEntry.weather.forecast}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            weather: {
                              ...editingEntry.weather,
                              forecast: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      dash.weather.forecast
                    )}
                  </td>
                  <td className="border p-2">
                    {editingEntry?._id === dash._id ? (
                      <Input
                        value={editingEntry.weather.temperature}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            weather: {
                              ...editingEntry.weather,
                              temperature: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      dash.weather.temperature
                    )}
                  </td>
                  <td className="border p-2 align-middle text-center">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="border px-2 py-1">
                            {editingEntry?._id === dash._id ? (
                              <Input
                                className="h-8 w-20 text-center mx-auto"
                                value={editingEntry.weather.humidity}
                                onChange={(e) =>
                                  setEditingEntry({
                                    ...editingEntry,
                                    weather: {
                                      ...editingEntry.weather,
                                      humidity: e.target.value,
                                    },
                                  })
                                }
                              />
                            ) : (
                              <span className="block mx-auto">
                                {dash.weather.humidity}
                              </span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  {/* Soil pH */}
                  <td className="border p-2">
                    {editingEntry?._id === dash._id ? (
                      <Input
                        type="number"
                        className="w-24 text-base px-2 py-1"
                        value={editingEntry.soil.pH}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            soil: {
                              ...editingEntry.soil,
                              pH: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    ) : (
                      dash.soil.pH
                    )}
                  </td>

                  <td className="border p-2">
                    {editingEntry?._id === dash._id ? (
                      <Input
                        value={editingEntry.soil.moisture}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            soil: {
                              ...editingEntry.soil,
                              moisture: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      dash.soil.moisture
                    )}
                  </td>
                  <td className="border p-2 whitespace-nowrap">
                    {editingEntry?._id === dash._id ? (
                      <Textarea
                        value={editingEntry.upcomingTasks.join(", ")}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            upcomingTasks: e.target.value
                              .split(",")
                              .map((task) => task.trim()),
                          })
                        }
                      />
                    ) : (
                      dash.upcomingTasks.map((task, index) => (
                        <span key={index}>
                          {task}
                          {index !== dash.upcomingTasks.length - 1 && ","}
                          <br />
                        </span>
                      ))
                    )}
                  </td>
                  <td className="border p-2">
                    {editingEntry?._id === dash._id ? (
                      <Input
                        value={editingEntry.image}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            image: e.target.value,
                          })
                        }
                      />
                    ) : (
                      dash.image
                    )}
                  </td>

                  {/* Humidity (RH) Table */}
                  <td className="border p-2">
                    <table className="border-collapse border">
                      <thead>
                        <tr>
                          <th className="border p-2">Day</th>
                          {Array.from({ length: 7 }).map((_, index) => {
                            const point = dash.charts.rh?.[index] || {};
                            return (
                              <th key={index} className="border p-2">
                                {editingEntry?._id === dash._id ? (
                                  <Input
                                    value={
                                      editingEntry.charts.rh?.[index]?.day || ""
                                    }
                                    onChange={(e) => {
                                      const updatedRH = [
                                        ...(editingEntry.charts.rh ||
                                          Array(7).fill({ day: "", value: 0 })),
                                      ];
                                      updatedRH[index] = {
                                        ...updatedRH[index],
                                        day: e.target.value,
                                      };
                                      setEditingEntry({
                                        ...editingEntry,
                                        charts: {
                                          ...editingEntry.charts,
                                          rh: updatedRH,
                                        },
                                      });
                                    }}
                                  />
                                ) : (
                                  point.day || "-"
                                )}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2 font-semibold">Value</td>
                          {Array.from({ length: 7 }).map((_, index) => {
                            const point = dash.charts.rh?.[index] || {};
                            return (
                              <td key={index} className="border p-2">
                                {editingEntry?._id === dash._id ? (
                                  <Input
                                    type="number"
                                    value={
                                      editingEntry.charts.rh?.[index]?.value ??
                                      ""
                                    }
                                    onChange={(e) => {
                                      const updatedRH = [
                                        ...(editingEntry.charts.rh ||
                                          Array(7).fill({ day: "", value: 0 })),
                                      ];
                                      updatedRH[index] = {
                                        ...updatedRH[index],
                                        value: parseFloat(e.target.value) || 0,
                                      };
                                      setEditingEntry({
                                        ...editingEntry,
                                        charts: {
                                          ...editingEntry.charts,
                                          rh: updatedRH,
                                        },
                                      });
                                    }}
                                  />
                                ) : point.value !== undefined ? (
                                  `${point.value}%`
                                ) : (
                                  "-"
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* Temperature (RH) Table */}
                  <td className="border p-2">
                    <table className="border-collapse border">
                      <thead>
                        <tr>
                          <th className="border p-2">Time</th>
                          {Array.from({ length: 4 }).map((_, index) => {
                            const point = dash.charts.temp?.[index] || {};
                            return (
                              <th key={index} className="border p-2">
                                {editingEntry?._id === dash._id ? (
                                  <Input
                                    value={
                                      editingEntry.charts.temp?.[index]?.time ||
                                      ""
                                    }
                                    onChange={(e) => {
                                      const updatedTemp = [
                                        ...(editingEntry.charts.temp ||
                                          Array(4).fill({
                                            time: "",
                                            value: 0,
                                          })),
                                      ];
                                      updatedTemp[index] = {
                                        ...updatedTemp[index],
                                        time: e.target.value,
                                      };
                                      setEditingEntry({
                                        ...editingEntry,
                                        charts: {
                                          ...editingEntry.charts,
                                          temp: updatedTemp,
                                        },
                                      });
                                    }}
                                  />
                                ) : (
                                  point.time || "-"
                                )}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2 font-semibold">Value</td>
                          {Array.from({ length: 4 }).map((_, index) => {
                            const point = dash.charts.temp?.[index] || {};
                            return (
                              <td key={index} className="border p-2">
                                {editingEntry?._id === dash._id ? (
                                  <Input
                                    type="number"
                                    value={
                                      editingEntry.charts.temp?.[index]
                                        ?.value ?? ""
                                    }
                                    onChange={(e) => {
                                      const updatedTemp = [
                                        ...(editingEntry.charts.temp ||
                                          Array(4).fill({
                                            time: "",
                                            value: 0,
                                          })),
                                      ];
                                      updatedTemp[index] = {
                                        ...updatedTemp[index],
                                        value: parseFloat(e.target.value) || 0,
                                      };
                                      setEditingEntry({
                                        ...editingEntry,
                                        charts: {
                                          ...editingEntry.charts,
                                          temp: updatedTemp,
                                        },
                                      });
                                    }}
                                  />
                                ) : point.value !== undefined ? (
                                  `${point.value}°C`
                                ) : (
                                  "-"
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* Rainfall */}
                  <td className="border p-2">
                    <table className="border-collapse border">
                      <thead>
                        <tr>
                          <th className="border p-2">Name</th>
                          {Array.from({ length: 3 }).map((_, index) => {
                            const point = dash.charts.rainfall?.[index] || {};
                            return (
                              <th key={index} className="border p-2">
                                {editingEntry?._id === dash._id ? (
                                  <Input
                                    value={
                                      editingEntry.charts.rainfall?.[index]
                                        ?.name || ""
                                    }
                                    onChange={(e) => {
                                      const updatedRainfall = [
                                        ...(editingEntry.charts.rainfall ||
                                          Array(3).fill({
                                            name: "",
                                            value: 0,
                                          })),
                                      ];
                                      updatedRainfall[index] = {
                                        ...updatedRainfall[index],
                                        name: e.target.value,
                                      };
                                      setEditingEntry({
                                        ...editingEntry,
                                        charts: {
                                          ...editingEntry.charts,
                                          rainfall: updatedRainfall,
                                        },
                                      });
                                    }}
                                  />
                                ) : (
                                  point.name || "-"
                                )}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2 font-semibold">Value</td>
                          {Array.from({ length: 3 }).map((_, index) => {
                            const point = dash.charts.rainfall?.[index] || {};
                            return (
                              <td key={index} className="border p-2">
                                {editingEntry?._id === dash._id ? (
                                  <Input
                                    type="number"
                                    value={
                                      editingEntry.charts.rainfall?.[index]
                                        ?.value ?? ""
                                    }
                                    onChange={(e) => {
                                      const updatedRainfall = [
                                        ...(editingEntry.charts.rainfall ||
                                          Array(3).fill({
                                            name: "",
                                            value: 0,
                                          })),
                                      ];
                                      updatedRainfall[index] = {
                                        ...updatedRainfall[index],
                                        value: parseFloat(e.target.value) || 0,
                                      };
                                      setEditingEntry({
                                        ...editingEntry,
                                        charts: {
                                          ...editingEntry.charts,
                                          rainfall: updatedRainfall,
                                        },
                                      });
                                    }}
                                  />
                                ) : point.value !== undefined ? (
                                  `${point.value}mm`
                                ) : (
                                  "-"
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* Actions */}
                  <td className="border p-2 space-y-2">
                    {editingEntry?._id === dash._id ? (
                      <>
                        <Button
                          variant="default"
                          className="w-full bg-green-500 text-white"
                          onClick={() => handleSave(dash._id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-gray-400 text-white"
                          onClick={() => setEditingEntry(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          // variant="secondary"
                          className="w-full bg-blue-500 text-white"
                          onClick={() => setEditingEntry(dash)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full bg-red-500 text-white"
                          onClick={() => handleDelete(dash._id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
