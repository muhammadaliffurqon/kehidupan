"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function AppShell({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}