"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define types for the data you're working with
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard`, // Replace with your API endpoint
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDashboards(data); // Ensure all necessary data is set in state
      } else {
        console.error("Error fetching dashboards:", data.message);
      }
    } catch (error) {
      console.error("Error fetching dashboards:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && userId && token) {
      fetchDashboards();
    }
  }, [status, userId, token]);

  // Handle save action for edited data
  const handleSave = async (dashboardId: string) => {
    if (!userId || !token || !editingEntry) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard/${dashboardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingEntry),
        }
      );

      if (res.ok) {
        await fetchDashboards();
        setEditingEntry(null);
      }
    } catch (error) {
      console.error("Error saving dashboard:", error);
    }
  };

  // Handle delete action for a dashboard
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

      {/* Scrollable table displaying dashboard data */}
      <div className="overflow-x-auto max-w-full">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Farm Name</th>
              <th className="border p-2">Location</th>
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
            {dashboards.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center p-4">
                  No dashboards found.
                </td>
              </tr>
            ) : (
              dashboards.map((dash) => (
                <tr key={dash._id}>
                  {/* Editable Fields */}

                  {/* <td className="border p-2">
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
                  </td> */}
                  <td className="border p-2">
                    {editingEntry?._id === dash._id ? (
                      <Input
                        value={editingEntry.farmId.location}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            farmId: {
                              ...editingEntry.farmId,
                              location: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      dash.farmId.location
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

                  <td className="border p-2">
                    {editingEntry?._id === dash._id ? (
                      <Input
                        value={editingEntry.soil.pH}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            soil: {
                              ...editingEntry.soil,
                              pH: parseFloat(e.target.value),
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
                          {dash.charts.rh.map((point, index) => (
                            <th key={index} className="border p-2">
                              {editingEntry?._id === dash._id ? (
                                <Input
                                  value={
                                    editingEntry.charts.rh[index]?.day || ""
                                  }
                                  onChange={(e) => {
                                    const updatedRH = [
                                      ...editingEntry.charts.rh,
                                    ];
                                    updatedRH[index].day = e.target.value;
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
                                point.day
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2 font-semibold">Value</td>
                          {dash.charts.rh.map((point, index) => (
                            <td key={index} className="border p-2">
                              {editingEntry?._id === dash._id ? (
                                <Input
                                  value={
                                    editingEntry.charts.rh[index]?.value || ""
                                  }
                                  onChange={(e) => {
                                    const updatedRH = [
                                      ...editingEntry.charts.rh,
                                    ];
                                    updatedRH[index].value =
                                      parseFloat(e.target.value) || 0;
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
                                `${point.value}%`
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* Temperature (Temp) Table */}
                  <td className="border p-2">
                    <table className="border-collapse border">
                      <thead>
                        <tr>
                          <th className="border p-2">Time</th>
                          {dash.charts.temp.map((point, index) => (
                            <th key={index} className="border p-2">
                              {editingEntry?._id === dash._id ? (
                                <Input
                                  value={
                                    editingEntry.charts.temp[index]?.time || ""
                                  }
                                  onChange={(e) => {
                                    const updatedTemp = [
                                      ...editingEntry.charts.temp,
                                    ];
                                    updatedTemp[index].time = e.target.value;
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
                                point.time
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2 font-semibold">Value</td>
                          {dash.charts.temp.map((point, index) => (
                            <td key={index} className="border p-2">
                              {editingEntry?._id === dash._id ? (
                                <Input
                                  value={
                                    editingEntry.charts.temp[index]?.value || ""
                                  }
                                  onChange={(e) => {
                                    const updatedTemp = [
                                      ...editingEntry.charts.temp,
                                    ];
                                    updatedTemp[index].value =
                                      parseFloat(e.target.value) || 0;
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
                                point.value
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* Rainfall Table */}
                  <td className="border p-2">
                    <table className="border-collapse border">
                      <thead>
                        <tr>
                          <th className="border p-2">Name</th>
                          {dash.charts.rainfall.map((point, index) => (
                            <th key={index} className="border p-2">
                              {editingEntry?._id === dash._id ? (
                                <Input
                                  value={
                                    editingEntry.charts.rainfall[index]?.name ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    const updatedRainfall = [
                                      ...editingEntry.charts.rainfall,
                                    ];
                                    updatedRainfall[index].name =
                                      e.target.value;
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
                                point.name
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2 font-semibold">Value</td>
                          {dash.charts.rainfall.map((point, index) => (
                            <td key={index} className="border p-2">
                              {editingEntry?._id === dash._id ? (
                                <Input
                                  value={
                                    editingEntry.charts.rainfall[index]
                                      ?.value || ""
                                  }
                                  onChange={(e) => {
                                    const updatedRainfall = [
                                      ...editingEntry.charts.rainfall,
                                    ];
                                    updatedRainfall[index].value =
                                      parseFloat(e.target.value) || 0;
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
                                point.value
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  <td className="border p-2 flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        editingEntry?._id === dash._id
                          ? handleSave(dash._id)
                          : setEditingEntry(dash)
                      }
                    >
                      {editingEntry?._id === dash._id ? "Save" : "Edit"}
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(dash._id)}
                    >
                      Delete
                    </Button>
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
