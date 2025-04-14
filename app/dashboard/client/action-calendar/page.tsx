"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Droplets,
  Plane as Plant,
  Sun,
  Tractor,
  CalendarDays,
} from "lucide-react";

interface Events {
  date: string;
  description: string;
  title: string;
  type: string;
}

export default function ActionCalendar() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [events, setEvents] = useState<Events[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "custom",
  });

  useEffect(() => {
    setDate(new Date());
    if (userEmail) fetchEvents();
  }, [userEmail]);

  const fetchEvents = async () => {
    try {
      const token = session?.user?.token;
      if (!token) throw new Error("No token found in session.");

      console.log("🔹 Fetching Events...");
      console.log("🔹 Token Sent to API:", token);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // ✅ Function to get icon based on event type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "watering":
        return <Droplets className="text-blue-500 w-5 h-5" />;
      case "planting":
        return <Plant className="text-green-500 w-5 h-5" />;
      case "harvesting":
        return <Tractor className="text-orange-500 w-5 h-5" />;
      case "sunlight":
        return <Sun className="text-yellow-500 w-5 h-5" />;
      default:
        return <CalendarDays className="text-gray-400 w-5 h-5" />; // Default icon for custom events
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !date) {
      alert("Enter event details");
      return;
    }

    const eventToAdd = {
      date: date.toISOString(),
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type, // Allow user to set type
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.token}`,
          },
          body: JSON.stringify(eventToAdd),
        }
      );

      if (!response.ok) throw new Error("Failed to add event");

      fetchEvents();
      setNewEvent({ title: "", description: "", type: "custom" });
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Action Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-6 lg:col-span-2">
          {date && (
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full h-[600px] p-6 border rounded-md"
              modifiers={{ highlighted: events.map((e) => new Date(e.date)) }}
            />
          )}
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {date
              ? date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Loading..."}
          </h2>

          {events.filter(
            (e) => new Date(e.date).toDateString() === date?.toDateString()
          ).length > 0 ? (
            events
              .filter(
                (e) => new Date(e.date).toDateString() === date?.toDateString()
              )
              .map((event, index) => (
                <Card key={index} className="p-4 flex items-center space-x-3">
                  {getEventIcon(event.type)}
                  <div>
                    <h3 className="text-lg font-medium">{event.title}</h3>
                    <p className="text-gray-500">{event.description}</p>
                  </div>
                </Card>
              ))
          ) : (
            <Card className="p-4">
              <p className="text-gray-500 text-center">No events scheduled</p>
            </Card>
          )}

          {/* Add New Event */}
          <Card className="p-4 space-y-4">
            <Input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
            />
            {/* Dropdown for Event Type */}
            <select
              className="w-full p-2 border rounded-md"
              value={newEvent.type}
              onChange={(e) =>
                setNewEvent({ ...newEvent, type: e.target.value })
              }
            >
              <option value="custom">Custom</option>
              <option value="watering">Watering</option>
              <option value="planting">Planting</option>
              <option value="harvesting">Harvesting</option>
              <option value="sunlight">Sunlight</option>
            </select>

            <Button onClick={handleAddEvent}>Add Event</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
