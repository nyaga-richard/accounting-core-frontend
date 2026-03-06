"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden">

      <Sidebar open={sidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">

        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  )
}