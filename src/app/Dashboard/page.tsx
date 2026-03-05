"use client"

// src/pages/Dashboard.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // <-- Next.js router
import { 
  FileText, 
  BookOpen, 
  Activity, 
  AlertCircle,
  TrendingUp,
  Badge
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter(); // <-- useRouter replaces useNavigate

  const stats = [
    { title: 'Active Policies', value: '24', icon: FileText, change: '+3', color: 'blue' },
    { title: 'Total Accounts', value: '156', icon: BookOpen, change: '+12', color: 'green' },
    { title: 'Events Today', value: '1,234', icon: Activity, change: '+15%', color: 'purple' },
    { title: 'Pending Tests', value: '3', icon: AlertCircle, change: '-2', color: 'yellow' },
  ];

  const quickActions = [
    { title: 'New Policy', path: '/policies/new', icon: FileText },
    { title: 'Manage Accounts', path: '/accounts', icon: BookOpen },
    { title: 'Test Sandbox', path: '/sandbox', icon: Activity },
    { title: 'View Reports', path: '/reports', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your accounting policy engine</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from yesterday
                  </p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push(action.path)} // <-- router.push instead of navigate
              >
                <Icon className="h-6 w-6" />
                <span>{action.title}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recent Policies</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Revenue Recognition Policy</p>
                  <p className="text-sm text-gray-500">Updated 2 hours ago</p>
                </div>
                <Badge>Active</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recent Events</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div>
                  <p className="font-medium">invoice.created</p>
                  <p className="text-sm text-gray-500">5 minutes ago</p>
                </div>
                <Badge>Processed</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}