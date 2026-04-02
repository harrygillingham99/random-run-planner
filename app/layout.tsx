import type { Metadata } from "next";
import "./globals.scss";
import "./styles/Header.scss";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Run Route Planner",
  description: "Plan your running routes with ease using OpenStreetMap and OSRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
