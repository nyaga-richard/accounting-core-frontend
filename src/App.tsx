// src/App.tsx

import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import  Dashboard  from '@/app/Dashboard/page';
//import { Policies } from '@/pages/Policies';
import { PolicyEditor } from './pages/PolicyEditor';
import { Toaster } from './components/ui/sonner';
import "./styles/globals.css";
//import { Accounts } from '@/pages/Accounts';
//import { AccountStructure } from '@/pages/AccountStructure';
//import { Sandbox } from '@/pages/Sandbox';
//import { Reports } from '@/pages/Reports';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* <Route path="/policies" element={<Policies />} /> */}
            <Route path="/policies/new" element={<PolicyEditor />} />
            <Route path="/policies/:id" element={<PolicyEditor />} />
            {/* <Route path="/accounts" element={<Accounts />} />
            <Route path="/account-structure" element={<AccountStructure />} />
            <Route path="/sandbox" element={<Sandbox />} /> */}
            {/* <Route path="/reports" element={<Reports />} /> */}
          </Routes>
        </DashboardLayout>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;