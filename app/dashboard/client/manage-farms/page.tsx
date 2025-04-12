"use client";

import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Farm {
  _id: string;
  name: string;
  location: string;
  size: number;
  crops: Crop[];
  showAddCrop?: boolean; // 👈 Add this
}

export default function ManageFarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [tempCropData, setTempCropData] = useState<{
    [farmId: string]: Partial<Crop>;
  }>({});
  const [editingCropId, setEditingCropId] = useState<string | null>(null);
  const [editedCrop, setEditedCrop] = useState({});
  const { data: session } = useSession();

  const updateTempCrop = (
    farmId: string,
    field: string,
    // field: keyof Crop,
    value: string | number
  ) => {
    setTempCropData((prev) => ({
      ...prev,
      [farmId]: {
        ...prev[farmId],
        [field]: value,
      },
    }));
  };

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState<number>(0);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      const token = session?.user?.token;

      if (!token) throw new Error("No token found in session");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clientFarms?page=${currentPage}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch farms");

      const data = await res.json();
      // setFarms(data.data);
      setFarms(
        data.data.map((farm: Farm) => ({ ...farm, showAddCrop: false }))
      );

      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch farms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleDeleteFarm = async (farmId: string) => {
    const token = session?.user?.token;

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clientFarms/${farmId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setFarms((prev) => prev.filter((farm) => farm._id !== farmId));
      } else {
        console.error("Failed to delete farm");
      }
    } catch (err) {
      console.error("Error deleting farm:", err);
    }
  };

  // Function to handle changes to the crop being edited
  const handleEditCropChange = (field: string, value: any) => {
    setEditedCrop((prev) => ({ ...prev, [field]: value }));
  };

  // Function to save crop updates
  const handleSaveCropEdit = async (farmId: string, cropId: string) => {
    const token = session?.user?.token;

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clientCrops/${cropId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editedCrop),
        }
      );

      if (response.ok) {
        const updatedCrop = await response.json();
        setFarms((prev) =>
          prev.map((farm) =>
            farm._id === farmId
              ? {
                  ...farm,
                  crops: farm.crops.map((crop) =>
                    crop._id === cropId ? updatedCrop : crop
                  ),
                }
              : farm
          )
        );
        setEditingCropId(null);
        setEditedCrop({});
      }
    } catch (error) {
      console.error("Error updating crop:", error);
    }
  };

  const handleCancelCropEdit = () => {
    setEditingCropId(null);
    setEditedCrop({});
  };

  const handleDeleteCrop = async (farmId: string, cropId: string) => {
    try {
      const session = await getSession();
      const token = session?.user?.token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clientCrops/${farmId}/crops/${cropId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete crop");

      toast.success("Crop deleted");

      // Remove crop from local state
      setFarms((prev) =>
        prev.map((farm) =>
          farm._id === farmId
            ? {
                ...farm,
                crops: farm.crops.filter((crop) => crop._id !== cropId),
              }
            : farm
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete crop");
    }
  };

  const handleCreateFarm = async () => {
    try {
      const session = await getSession();
      const token = session?.user?.token;

      if (!token) throw new Error("No token found in session");

      const res = await fetch(`${process.env.MONGODB_URI}/api/clientFarms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, location, size }),
      });

      if (!res.ok) throw new Error("Failed to create farm");

      toast.success("Farm created successfully");
      setCreating(false);
      setName("");
      setLocation("");
      setSize(0);

      // 👇 reset to page 1 to fetch newly added farm
      setCurrentPage(1);
      // 👇 wait until currentPage updates, then fetch
      setTimeout(fetchFarms, 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create farm");
    }
  };

  const handleAddCrop = async (farmId: string) => {
    const crop = tempCropData[farmId];
    if (
      !crop?.name ||
      !crop.area ||
      !crop.yield ||
      !crop.plantingDate ||
      !crop.harvestDate
    ) {
      toast.error("Please fill all crop fields");
      return;
    }

    try {
      const session = await getSession();
      const token = session?.user?.token;

      const res = await fetch(
        `${process.env.MONGODB_URI}/api/clientCrops/${farmId}/crops`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(crop),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend error:", errorData);

        throw new Error(errorData.message || "Failed to add crop");
      }

      const newCrop = await res.json();

      toast.success("Crop added successfully");

      // Update the farm's crop list in-place
      setFarms((prev) =>
        prev.map((farm) =>
          farm._id === farmId
            ? {
                ...farm,
                crops: [...farm.crops, newCrop],
                showAddCrop: false,
              }
            : farm
        )
      );

      // Clear temp crop data
      setTempCropData((prev) => ({ ...prev, [farmId]: {} }));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add crop");
    }
  };

  const handleUpdateFarm = async (farmId: string) => {
    try {
      const session = await getSession();
      const token = session?.user?.token;

      const res = await fetch(
        `${process.env.MONGODB_URI}/api/clientFarms/${farmId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, location, size }),
        }
      );

      if (!res.ok) throw new Error("Failed to update farm");

      toast.success("Farm updated successfully");
      setEditingFarmId(null);
      setName("");
      setLocation("");
      setSize(0);
      fetchFarms();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update farm");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl text-center font-semibold text-gray-800">
        Manage Farms
      </h1>

      <div className="flex justify-between items-center pt-4">
        <Button onClick={handlePrev} disabled={currentPage === 1 || loading}>
          Previous
        </Button>
        <p className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </p>
        <Button
          onClick={handleNext}
          disabled={currentPage === totalPages || loading}
        >
          Next
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading farms...</span>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setCreating(true)}>+ Add New Farm</Button>
          </div>

          {creating && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Create a New Farm
              </h2>
              <div className="grid gap-4">
                <div>
                  <Label>Farm Name</Label>
                  <Input
                    placeholder="Enter farm name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Size (acres)</Label>
                  <Input
                    type="number"
                    placeholder="Enter size"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <Button onClick={handleCreateFarm}>Create</Button>
                  <Button variant="ghost" onClick={() => setCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {farms.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">No farms found.</p>
          ) : (
            farms.map((farm) => (
              <Card key={farm._id} className="p-6 mt-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold mb-4">Farm Details</h2>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingFarmId(farm._id);
                      setName(farm.name);
                      setLocation(farm.location);
                      setSize(farm.size);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </div>
                <div className="grid gap-4">
                  {editingFarmId === farm._id ? (
                    <>
                      <div>
                        <Label>Farm Name</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Size (acres)</Label>
                        <Input
                          type="number"
                          value={size}
                          onChange={(e) => setSize(Number(e.target.value))}
                        />
                      </div>
                      <div className="flex gap-4 mt-2">
                        <Button onClick={() => handleUpdateFarm(farm._id)}>
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingFarmId(null);
                            setName("");
                            setLocation("");
                            setSize(0);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteFarm(farm._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Farm Name</Label>
                        <Input value={farm.name} readOnly />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input value={farm.location} readOnly />
                      </div>
                      <div>
                        <Label>Size (acres)</Label>
                        <Input value={farm.size.toString()} readOnly />
                      </div>
                    </>
                  )}

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Crops</h3>
                    {farm.crops.map((crop, index) => (
                      <div
                        key={crop._id || index}
                        className="border p-4 rounded-lg mb-4 bg-gray-50"
                      >
                        {editingCropId === crop._id ? (
                          <div className="grid gap-2">
                            <div>
                              <Label>Crop Name</Label>
                              <Input
                                value={editedCrop.name || ""}
                                onChange={(e) =>
                                  handleEditCropChange("name", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label>Area (acres)</Label>
                              <Input
                                type="number"
                                value={editedCrop.area || ""}
                                onChange={(e) =>
                                  handleEditCropChange(
                                    "area",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Yield</Label>
                              <Input
                                type="number"
                                value={editedCrop.yield || ""}
                                onChange={(e) =>
                                  handleEditCropChange(
                                    "yield",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Planting Date</Label>
                              <Input
                                type="date"
                                value={
                                  editedCrop.plantingDate
                                    ? new Date(editedCrop.plantingDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  handleEditCropChange(
                                    "plantingDate",
                                    new Date(e.target.value).toISOString()
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Harvest Date</Label>
                              <Input
                                type="date"
                                value={
                                  editedCrop.harvestDate
                                    ? new Date(editedCrop.harvestDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  handleEditCropChange(
                                    "harvestDate",
                                    new Date(e.target.value).toISOString()
                                  )
                                }
                              />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                onClick={() =>
                                  handleSaveCropEdit(farm._id, crop._id)
                                }
                              >
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={handleCancelCropEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            <div className="flex justify-between items-start">
                              <div className="font-semibold">Crop Details</div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingCropId(crop._id);
                                    setEditedCrop(crop);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDeleteCrop(farm._id, crop._id)
                                  }
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label>Crop Name</Label>
                              <Input value={crop.name} readOnly />
                            </div>
                            <div>
                              <Label>Area (acres)</Label>
                              <Input value={crop.area.toString()} readOnly />
                            </div>
                            <div>
                              <Label>Yield</Label>
                              <Input value={crop.yield.toString()} readOnly />
                            </div>
                            <div>
                              <Label>Planting Date</Label>
                              <Input
                                value={new Date(
                                  crop.plantingDate
                                ).toLocaleDateString()}
                                readOnly
                              />
                            </div>
                            <div>
                              <Label>Harvest Date</Label>
                              <Input
                                value={new Date(
                                  crop.harvestDate
                                ).toLocaleDateString()}
                                readOnly
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setFarms((prev) =>
                            prev.map((f) =>
                              f._id === farm._id
                                ? { ...f, showAddCrop: !f.showAddCrop }
                                : f
                            )
                          )
                        }
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Crop
                      </Button>

                      {farm.showAddCrop && (
                        <div className="mt-4 grid gap-3 border p-4 rounded-lg bg-gray-50">
                          <h4 className="font-semibold text-md">
                            New Crop Details
                          </h4>
                          <div>
                            <Label>Crop Name</Label>
                            <Input
                              placeholder="Crop name"
                              onChange={(e) =>
                                updateTempCrop(farm._id, "name", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label>Area (acres)</Label>
                            <Input
                              type="number"
                              placeholder="Area"
                              onChange={(e) =>
                                updateTempCrop(
                                  farm._id,
                                  "area",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Yield</Label>
                            <Input
                              type="number"
                              placeholder="Yield"
                              onChange={(e) =>
                                updateTempCrop(
                                  farm._id,
                                  "yield",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Planting Date</Label>
                            <Input
                              type="date"
                              onChange={(e) =>
                                updateTempCrop(
                                  farm._id,
                                  "plantingDate",
                                  new Date(e.target.value).toISOString()
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Harvest Date</Label>
                            <Input
                              type="date"
                              onChange={(e) =>
                                updateTempCrop(
                                  farm._id,
                                  "harvestDate",
                                  new Date(e.target.value).toISOString()
                                )
                              }
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              type="button"
                              onClick={() => handleAddCrop(farm._id)}
                            >
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setFarms((prev) =>
                                  prev.map((f) =>
                                    f._id === farm._id
                                      ? { ...f, showAddCrop: false }
                                      : f
                                  )
                                )
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </>
      )}
    </div>
  );
}
