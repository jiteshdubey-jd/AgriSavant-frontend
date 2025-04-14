"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Leaf,
  Calendar,
  BarChart2,
  Menu,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Load sidebar state from localStorage

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  // ✅ Restore sidebar state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar");
    if (savedState !== null) {
      setIsSidebarOpen(savedState === "true");
    }
  }, []);

  // ✅ Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebar", isSidebarOpen.toString());
  }, [isSidebarOpen]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard/client/dashboard",
      icon: LayoutDashboard,
    },
    { name: "Manage Farm", href: "/dashboard/client/manage-farms", icon: Leaf },
    { name: "Farm Health", href: "/dashboard/client/farm-health", icon: Leaf },
    {
      name: "Action Calendar",
      href: "/dashboard/client/action-calendar",
      icon: Calendar,
    },
    {
      name: "Charts & Graphs",
      href: "/dashboard/client/charts",
      icon: BarChart2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
        >
          {isSidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 z-40 w-64 h-screen transition-transform
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r">
          <div className="flex items-center mb-8 px-2">
            <h1 className="text-xl font-bold text-green-600">Agrisavant</h1>
          </div>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-2 py-3 rounded-lg
                    ${
                      isActive
                        ? "bg-green-100 text-green-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full flex items-center justify-start text-red-600"
              onClick={() =>
                signOut({ redirect: false }).then(
                  () => (window.location.href = "/")
                )
              }
            >
              <LogOut className="h-5 w-5 mr-3" /> Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`
        p-4 lg:ml-64 transition-all duration-300
        ${isSidebarOpen ? "ml-64" : "ml-0"}
      `}
      >
        {children}
      </div>
    </div>
  );
}
