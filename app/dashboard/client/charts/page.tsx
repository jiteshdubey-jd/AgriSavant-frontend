'use client';

import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ChartsAndGraphs() {
  const yieldData = [
    { month: 'Jan', wheat: 4200, corn: 3800 },
    { month: 'Feb', wheat: 4500, corn: 4100 },
    { month: 'Mar', wheat: 4800, corn: 4300 },
    { month: 'Apr', wheat: 4300, corn: 4600 },
    { month: 'May', wheat: 4100, corn: 4800 },
    { month: 'Jun', wheat: 4600, corn: 5100 }
  ];

  const moistureData = [
    { time: '6:00', level: 45 },
    { time: '9:00', level: 55 },
    { time: '12:00', level: 65 },
    { time: '15:00', level: 60 },
    { time: '18:00', level: 50 },
    { time: '21:00', level: 45 }
  ];

  const cropDistribution = [
    { name: 'Wheat', value: 45 },
    { name: 'Corn', value: 30 },
    { name: 'Soybeans', value: 15 },
    { name: 'Other', value: 10 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Charts and Graphs</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Yield Comparison */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Crop Yield Comparison</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="wheat" fill="#0088FE" name="Wheat (kg)" />
                <Bar dataKey="corn" fill="#00C49F" name="Corn (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Soil Moisture Levels */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Soil Moisture Levels</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moistureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="level" 
                  stroke="#8884d8" 
                  name="Moisture (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Crop Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Crop Distribution</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cropDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weather Impact */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Weather Impact on Crops</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="wheat" 
                  stroke="#0088FE" 
                  name="Wheat Yield"
                />
                <Line 
                  type="monotone" 
                  dataKey="corn" 
                  stroke="#00C49F" 
                  name="Corn Yield"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}