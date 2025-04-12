import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tractor, Sprout, BarChart3, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative px-6 lg:px-8">
          <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Smart Farm Management Portal
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-200">
                Manage your farm efficiently with our comprehensive farm
                management system. Track crops, monitor yields, and make
                data-driven decisions.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/login">
                  <Button className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your farm
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform provides comprehensive tools for modern farming
              management
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6 transition-all hover:shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <Tractor className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    Farm Management
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Track and manage your farm operations efficiently
                  </p>
                </div>
              </Card>

              <Card className="p-6 transition-all hover:shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Sprout className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Crop Tracking</h3>
                  <p className="mt-2 text-gray-600">
                    Monitor crop growth and harvest schedules
                  </p>
                </div>
              </Card>

              <Card className="p-6 transition-all hover:shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-yellow-100 p-3">
                    <BarChart3 className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    Yield Analytics
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Analyze and optimize your farm's performance
                  </p>
                </div>
              </Card>

              <Card className="p-6 transition-all hover:shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-purple-100 p-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    Multi-User Access
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Collaborate with team members and stakeholders
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to get started?
            <br />
            Join our platform today.
          </h2>
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link href="/login">
              <Button className="bg-gray-100 text-green-600 hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
