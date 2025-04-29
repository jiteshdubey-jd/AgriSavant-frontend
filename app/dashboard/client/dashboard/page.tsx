"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      const token = session?.user?.token;

      if (!token) {
        console.error("No token found in session");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setDashboardData(data); // now setting array
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchData();
  }, []);

  if (dashboardData.length === 0) return <p>Loading dashboard...</p>;

  const currentDashboard = dashboardData[currentPage];

  if (!currentDashboard) {
    return <p>No farm data available.</p>;
  }

  const {
    farmName,
    farmSize,
    cropName,
    sowingDate,
    stage,
    weather,
    soil,
    upcomingTasks,
    charts,
    farmImage,
  } = currentDashboard;

  // useEffect(() => {
  //   if (currentPage >= dashboardData.length && dashboardData.length > 0) {
  //     setCurrentPage(dashboardData.length - 1);
  //   }
  // }, [dashboardData, currentPage]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl text-center font-semibold text-gray-800">
        {farmName} Dashboard
      </h1>
      {/* Pagination Buttons */}
      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </Button>
        <span className="text-sm text-gray-500">
          Farm {currentPage + 1} of {dashboardData.length}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, dashboardData.length - 1)
            )
          }
          disabled={currentPage === dashboardData.length - 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </Button>
      </div>

      <Card className="p-6 bg-yellow-400 text-center">
        <h2 className="text-lg font-bold">Upcoming Tasks</h2>
        {upcomingTasks.map((task: string, index: number) => (
          <p key={index}>- {task}</p>
        ))}
      </Card>

      {/* Weather and Soil Cards */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 bg-blue-400 text-center">
          <h2 className="text-lg font-bold ">Weather Forecast</h2>
          <p>
            {weather.forecast}, {weather.temperature}
          </p>
          <p>Humidity: {weather.humidity}</p>
        </Card>
        <Card className="p-6 bg-yellow-600 text-center">
          <h2 className="text-lg font-bold">Soil Health</h2>
          <p>pH Level: {soil.pH}</p>
          <p>Moisture: {soil.moisture}</p>
        </Card>
      </div>
      {/* Chart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">
            RH Value Trends
          </h2>
          <LineChart width={300} height={200} data={charts.rh}>
            <XAxis dataKey="day" />
            <YAxis domain={[50, 70]} />
            <Tooltip />
            <CartesianGrid stroke="#ccc" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#008000"
              strokeWidth={2}
            />
          </LineChart>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Temperature Variations
          </h2>
          <LineChart width={300} height={200} data={charts.temp}>
            <XAxis dataKey="time" />
            <YAxis domain={[0, 50]} />
            <Tooltip />
            <CartesianGrid stroke="#ccc" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#008000"
              strokeWidth={2}
            />
          </LineChart>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Rainfall Probability
          </h2>
          <LineChart width={300} height={200} data={charts.rainfall}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 50]} />
            <Tooltip />
            <CartesianGrid stroke="#ccc" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#008000"
              strokeWidth={2}
            />
          </LineChart>
        </Card>
      </div>

      {/* Farm Info */}
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-center">
          Farm Notice Board
        </h2>
        <Image
          src={farmImage}
          alt="Farm"
          width={500}
          height={300}
          className="w-full md:w-1/3 h-auto rounded-lg shadow-md"
        />
        <div className="w-full md:w-1/3">
          <table className="table-auto min-w-full border text-sm md:text-base">
            <tbody>
              <tr className="border">
                <td className="font-semibold py-2 pr-4">Farm size:</td>
                <td className="py-2">{farmSize} acres</td>
              </tr>
              <tr className="border">
                <td className="font-semibold py-2 pr-4">Crop name:</td>
                <td className="py-2">{cropName}</td>
              </tr>
              <tr className="border">
                <td className="font-semibold py-2 pr-4">Sowing date:</td>
                <td className="py-2">
                  {sowingDate
                    ? new Date(sowingDate).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
              <tr className="border">
                <td className="font-semibold py-2 pr-4">Current Stage:</td>
                <td className="py-2">{stage || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
