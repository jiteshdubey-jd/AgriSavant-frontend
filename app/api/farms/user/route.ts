import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Farm from "@/models/Farm";
import User from "@/models/User"; // Make sure you have a User model
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session user:", session.user.id);

    // Fetch user details
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch farms owned by the user
    const farms = await Farm.find({ ownerId: session.user.id }).select(
      "name location size"
    );

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "N/A",
      address: user.address || "N/A",
      farms,
    });
  } catch (error) {
    console.error("Error fetching farmer data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
