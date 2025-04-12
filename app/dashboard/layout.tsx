"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (status === "loading" || initialized) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (
      session.user.role === "admin" &&
      !pathname.startsWith("/dashboard/admin")
    ) {
      router.replace("/dashboard/admin");
    } else if (
      session.user.role !== "admin" &&
      !pathname.startsWith("/dashboard/client")
    ) {
      router.replace("/dashboard/client");
    }

    setInitialized(true);
  }, [session, status, pathname, router, initialized]);

  return <>{children}</>;
}
