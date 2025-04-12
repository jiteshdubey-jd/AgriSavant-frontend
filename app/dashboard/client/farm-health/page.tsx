"use client";

import { useEffect, useRef, useState } from "react";
import { getSession } from "next-auth/react";
import Chart from "chart.js/auto";

export default function FarmHealth() {
  const pestChartRef = useRef(null);
  const nutriChartRef = useRef(null);
  const diseaseChartRef = useRef(null);
  const nutriBarChartRef = useRef(null);
  const pestBarChartRef = useRef(null);
  const chartInstances = useRef({});
  const [healthData, setHealthData] = useState(null);
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ loading state

  const needlePlugin = {
    id: "needle",
    afterDatasetDraw(chart, args, options) {
      const {
        ctx,
        chartArea: { width, height },
      } = chart;
      const value = options.value ?? 0;
      const angle = Math.PI + (value / 100) * Math.PI;
      const cx = chart.getDatasetMeta(0).data[0].x;
      const cy = chart.getDatasetMeta(0).data[0].y;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(height / 2.5, 0);
      ctx.lineTo(0, 5);
      ctx.fillStyle = options.color || "black";
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = options.color || "black";
      ctx.fill();
    },
  };

  const fetchUserFarms = async () => {
    setLoading(true); // ✅ Start loading
    const session = await getSession();
    const token = session?.user?.token;
    if (!token) {
      console.error("No token found in session.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/farmhealth/my-farms`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setFarms(data || []);
      if (data?.length > 0) {
        setSelectedFarmId(data[0].farmId);
      }
    } catch (error) {
      console.error("Failed to fetch farms", error);
    } finally {
      setLoading(false); // ✅ Done loading
    }
  };

  const fetchHealthData = async () => {
    if (!selectedFarmId) return;
    const selected = farms.find((farm) => farm.farmId === selectedFarmId);
    if (selected) {
      setHealthData(selected.health);
    }
  };

  const renderGaugeChart = (ref, id, needleValue) => {
    if (!ref.current) return;

    const existingChart = chartInstances.current[id];
    if (existingChart?.destroy) {
      existingChart.destroy();
    }

    chartInstances.current[id] = new Chart(ref.current, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [33.3, 33.3, 33.3],
            backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"],
            borderWidth: 0,
          },
        ],
        labels: ["Low", "Medium", "High"],
      },
      options: {
        rotation: -90,
        circumference: 180,
        cutout: "50%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          needle: {
            value: needleValue,
            color: "black",
          },
        },
        animation: { duration: 1000 },
      },
      plugins: [needlePlugin],
    });
  };

  const renderBarChart = (ref, id, labels, data, label, colors) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;

    const existingChart = chartInstances.current[id];
    if (existingChart?.destroy) {
      existingChart.destroy();
    }

    chartInstances.current[id] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: colors,
            borderRadius: 5,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        scales: {
          x: { min: 0, max: 100, ticks: { callback: (val) => `${val}%` } },
        },
      },
    });
  };

  useEffect(() => {
    return () => {
      Object.values(chartInstances.current).forEach((chart) => {
        if (chart?.destroy) chart.destroy();
      });
    };
  }, []);

  useEffect(() => {
    fetchUserFarms();
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      fetchHealthData();
    }
  }, [selectedFarmId]);

  useEffect(() => {
    if (!healthData) return;

    const { pestPressure, nutrientStatus, diseaseRisk } = healthData;

    renderGaugeChart(pestChartRef, "pestGauge", pestPressure.needleValue);
    renderGaugeChart(nutriChartRef, "nutriGauge", nutrientStatus.needleValue);
    renderGaugeChart(
      diseaseChartRef,
      "diseaseGauge",
      diseaseRisk.needleValue ?? 50
    );

    renderBarChart(
      pestBarChartRef,
      "pestBarChart",
      pestPressure.pests.map((p) => p.name),
      pestPressure.pests.map((p) => p.level),
      "Pest Pressure",
      ["#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#2ecc71"]
    );

    renderBarChart(
      nutriBarChartRef,
      "nutriBarChart",
      nutrientStatus.nutrients.map((n) => n.name),
      nutrientStatus.nutrients.map((n) => n.level),
      "Nutri Status",
      ["#3498db", "#9b59b6", "#e67e22", "#f1c40f", "#e74c3c", "#2ecc71"]
    );

    return () => {
      Object.values(chartInstances.current).forEach((chart) => {
        if (chart?.destroy) chart.destroy();
      });
    };
  }, [healthData]);

  // ✅ LOADING UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-medium">
            Loading farm Health Data...
          </p>
        </div>
      </div>
    );
  }

  if (!loading && farms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            No Farms Found
          </h2>
          <p className="text-gray-600 mb-4">
            You haven’t added any farms yet. Add a farm to start monitoring
            health data.
          </p>
          <a
            href="/dashboard/client/farms"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Your First Farm
          </a>
        </div>
      </div>
    );
  }

  // ✅ Normal UI
  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-6">
        <h1 className="text-3xl text-center font-semibold text-gray-800">
          Farm Health Overview
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Monitor soil conditions, crop health, and environmental factors here.
        </p>

        <div className="mt-6 flex justify-center">
          <select
            className="p-2 border rounded-md"
            value={selectedFarmId || ""}
            onChange={(e) => setSelectedFarmId(e.target.value)}
          >
            {farms.map((farm) => (
              <option key={farm.farmId} value={farm.farmId}>
                {farm.farmName} ({farm.location})
              </option>
            ))}
          </select>
        </div>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h2 className="text-xl text-center font-semibold text-gray-700">
              Pest Pressure
            </h2>
            <canvas ref={pestChartRef} className="mt-3"></canvas>
            <canvas ref={pestBarChartRef} className="mt-3"></canvas>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md">
            <h2 className="text-xl text-center font-semibold text-gray-700">
              Nutri Status
            </h2>
            <canvas ref={nutriChartRef} className="mt-3"></canvas>
            <canvas ref={nutriBarChartRef} className="mt-3"></canvas>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-center text-gray-700">
              Disease Risk
            </h2>
            <canvas ref={diseaseChartRef} className="mt-3"></canvas>
            {healthData && (
              <table className="mt-4 w-full border border-gray-500 text-sm text-gray-700">
                <tbody>
                  <tr className="border-b border-gray-500">
                    <td className="font-bold border-r border-gray-400 px-3 py-2 w-1/2">
                      Current Risk Level
                    </td>
                    <td className="px-3 py-2">
                      {healthData.diseaseRisk.riskLevel}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-500">
                    <td className="font-bold border-r border-gray-400 px-3 py-2">
                      Potential Diseases
                    </td>
                    <td className="px-3 py-2">
                      {healthData.diseaseRisk.potentialDiseases.join(", ")}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold border-r border-gray-400 px-3 py-2">
                      Suggested Actions
                    </td>
                    <td className="px-3 py-2">
                      {healthData.diseaseRisk.suggestions}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
