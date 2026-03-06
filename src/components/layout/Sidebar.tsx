// src/components/layout/Sidebar.tsx
"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Home,
  FileText,
  Settings,
  BookOpen,
  TestTube,
  ScrollText,
  BarChart3
} from "lucide-react"

import { cn } from "@/lib/utils"

interface SidebarProps {
  open: boolean
}

const navigation = [
  {
    group: "General",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
    ],
  },
  {
    group: "Policies",
    items: [
      { name: "Policies", href: "/policies", icon: ScrollText },
      { name: "Policy Builder", href: "/policies/new", icon: FileText },
    ],
  },
  {
    group: "Accounting",
    items: [
      { name: "Accounts", href: "/accounts", icon: BookOpen },
      { name: "Account Structure", href: "/account-structure", icon: Settings },
    ],
  },
  {
    group: "Tools",
    items: [
      { name: "Sandbox", href: "/sandbox", icon: TestTube },
      { name: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
]

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "bg-white border-r h-screen sticky top-0 transition-all duration-300",
        open ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center border-b font-semibold text-gray-800 px-4">
        {open ? "Accounting" : "A"}
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-6 overflow-y-auto">

        {navigation.map((section) => (
          <div key={section.group}>

            {open && (
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {section.group}
              </h3>
            )}

            <div className="space-y-1">

              {section.items.map((item) => {
                const isActive = pathname?.startsWith(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md transition-colors",
                      open ? "px-3 py-2 text-sm" : "justify-center py-3",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />

                    {open && (
                      <span className="ml-3">
                        {item.name}
                      </span>
                    )}
                  </Link>
                )
              })}

            </div>
          </div>
        ))}

      </nav>
    </aside>
  )
}