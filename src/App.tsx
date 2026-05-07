import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ClockInPage } from './pages/clockin/ClockInPage'
import { TimesheetsPage } from './pages/clockin/TimesheetsPage'
import { RegistersPage } from './pages/registers/RegistersPage'
import { NewRegisterPage } from './pages/registers/NewRegisterPage'
import { ViewRegisterPage } from './pages/registers/ViewRegisterPage'
import { AwardsPage } from './pages/awards/AwardsPage'
import { ChildProfilePage } from './pages/awards/ChildProfilePage'
import { AdminPage } from './pages/admin/AdminPage'
import { SchoolsAdminPage } from './pages/admin/SchoolsAdminPage'
import { StaffAdminPage } from './pages/admin/StaffAdminPage'
import { ChildrenAdminPage } from './pages/admin/ChildrenAdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* All authenticated staff */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/clock-in" element={
            <ProtectedRoute><ClockInPage /></ProtectedRoute>
          } />
          <Route path="/awards" element={
            <ProtectedRoute><AwardsPage /></ProtectedRoute>
          } />
          <Route path="/awards/:id" element={
            <ProtectedRoute><ChildProfilePage /></ProtectedRoute>
          } />

          {/* Coaches and above */}
          <Route path="/registers" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'lead_coach', 'assistant_coach']}>
              <RegistersPage />
            </ProtectedRoute>
          } />
          <Route path="/registers/new" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'lead_coach', 'assistant_coach']}>
              <NewRegisterPage />
            </ProtectedRoute>
          } />
          <Route path="/registers/:id" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'lead_coach', 'assistant_coach']}>
              <ViewRegisterPage />
            </ProtectedRoute>
          } />

          {/* Director & Area Lead */}
          <Route path="/timesheets" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <TimesheetsPage />
            </ProtectedRoute>
          } />

          {/* Director only */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['director']}>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/schools" element={
            <ProtectedRoute allowedRoles={['director']}>
              <SchoolsAdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/staff" element={
            <ProtectedRoute allowedRoles={['director']}>
              <StaffAdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/children" element={
            <ProtectedRoute allowedRoles={['director']}>
              <ChildrenAdminPage />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
