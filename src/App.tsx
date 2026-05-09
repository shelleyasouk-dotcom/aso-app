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
import { ChildSkillsPage } from './pages/awards/ChildSkillsPage'
import { AdminPage } from './pages/admin/AdminPage'
import { SchoolsAdminPage } from './pages/admin/SchoolsAdminPage'
import { StaffAdminPage } from './pages/admin/StaffAdminPage'
import { ChildrenAdminPage } from './pages/admin/ChildrenAdminPage'
import { BulkImportPage } from './pages/admin/BulkImportPage'
import { AreaSchoolsPage } from './pages/admin/AreaSchoolsPage'
import { AnnouncementsAdminPage } from './pages/admin/AnnouncementsAdminPage'
import { ChangePasswordPage } from './pages/profile/ChangePasswordPage'
import { CoachProfilePage } from './pages/profile/CoachProfilePage'
import { DocumentsPage } from './pages/documents/DocumentsPage'

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
            <ProtectedRoute><ChildSkillsPage /></ProtectedRoute>
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
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/children" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <ChildrenAdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/bulk-import" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <BulkImportPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/area-schools" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <AreaSchoolsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/announcements" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <AnnouncementsAdminPage />
            </ProtectedRoute>
          } />

          {/* Director only */}
          <Route path="/admin/schools" element={
            <ProtectedRoute allowedRoles={['director']}>
              <SchoolsAdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/staff" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <StaffAdminPage />
            </ProtectedRoute>
          } />

          {/* Change password — all staff */}
          <Route path="/change-password" element={
            <ProtectedRoute><ChangePasswordPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><CoachProfilePage /></ProtectedRoute>
          } />
          <Route path="/profile/:id" element={
            <ProtectedRoute><CoachProfilePage /></ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute><DocumentsPage /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
