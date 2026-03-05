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

const navigation = [
  { name: "Dashboard", href: "/Dashboard", icon: Home },
  { name: "Policies", href: "/policies", icon: ScrollText },
  { name: "Policy Builder", href: "/policies/new", icon: FileText },
  { name: "Accounts", href: "/accounts", icon: BookOpen },
  { name: "Account Structure", href: "/account-structure", icon: Settings },
  { name: "Sandbox", href: "/sandbox", icon: TestTube },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}