"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>AgriSavant</title>
        <meta
          name="description"
          content="Farm Management System - Manage your farm efficiently"
        />
        <link
          rel="icon"
          // href="https://res.cloudinary.com/dyo0qri4q/image/upload/v1746357665/Agri-logo_oixcus.ico"
          href="https://res.cloudinary.com/dyo0qri4q/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1746358347/Agri-logo-icon_recdog.jpg"
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>{" "}
      </body>
    </html>
  );
}
