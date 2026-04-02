import type { Metadata } from "next";
import "./globals.scss";
import DarkModeToggle from "./components/DarkModeToggle";

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
        <header>
          <div className="logo-mark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 4v4l3 3-3 3v4" />
              <path d="M6 8l3 4-3 4" />
            </svg>
          </div>
          <h1>Run Route Planner</h1>
          <span></span>
          <DarkModeToggle />
        </header>
        {children}
      </body>
    </html>
  );
}
