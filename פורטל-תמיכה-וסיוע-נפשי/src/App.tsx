import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { UsersTable } from './pages/admin/Users';
import { CrisisLog } from './pages/admin/CrisisLog';
import { OwnerSettings } from './pages/admin/OwnerSettings';
import { Tickets } from './pages/admin/Tickets';
import { AppProvider } from './components/AppProvider';
import { GlobalAlerts } from './components/GlobalAlerts';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <GlobalAlerts />
        <Routes>
          {/* Client Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
          </Route>

          {/* Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersTable />} />
            <Route path="crisis" element={<CrisisLog />} />
            <Route path="settings" element={<OwnerSettings />} />
            <Route path="tickets" element={<Tickets />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

