import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { ParentProtectedRoute } from './components/auth/ParentProtectedRoute'
import { PortalHomePage } from './pages/portal/PortalHomePage'
import { PortalClubsPage } from './pages/portal/PortalClubsPage'
import { PortalClubDetailPage } from './pages/portal/PortalClubDetailPage'
import { PortalSportsPage } from './pages/portal/PortalSportsPage'
import { PortalAffiliationsPage } from './pages/portal/PortalAffiliationsPage'
import { PortalAboutPage } from './pages/portal/PortalAboutPage'
import { PortalLoginPage } from './pages/portal/PortalLoginPage'
import { PortalRegisterPage } from './pages/portal/PortalRegisterPage'
import { PortalDashboardPage } from './pages/portal/PortalDashboardPage'
import { PortalTermsPage } from './pages/portal/PortalTermsPage'
import { PortalBookingPage } from './pages/portal/PortalBookingPage'
import { PortalBookingConfirmedPage } from './pages/portal/PortalBookingConfirmedPage'
import { ClubTermsAdminPage } from './pages/admin/ClubTermsAdminPage'
import { BookingsAdminPage } from './pages/admin/BookingsAdminPage'
import { SchoolRosterPage } from './pages/school/SchoolRosterPage'

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
import { AnnouncementsPage } from './pages/announcements/AnnouncementsPage'
import { GuidePage } from './pages/help/GuidePage'
import { HandbookPage } from './pages/handbook/HandbookPage'
import { CrmPage } from './pages/crm/CrmPage'
import { CrmContactPage } from './pages/crm/CrmContactPage'
import { ExpensesPage } from './pages/expenses/ExpensesPage'
import { ExpensesAdminPage } from './pages/expenses/ExpensesAdminPage'
import { CoachPoolPage } from './pages/coachpool/CoachPoolPage'
import { SessionsPage } from './pages/sessions/SessionsPage'
import { AbsencesPage } from './pages/absences/AbsencesPage'
import { MyAreaPage } from './pages/myarea/MyAreaPage'
import { SchoolPortalPage } from './pages/school/SchoolPortalPage'
import { SchoolRegisterPage } from './pages/school/SchoolRegisterPage'
import { SchoolClubInfoPage } from './pages/school/SchoolClubInfoPage'
import { SchoolSafeguardingPage } from './pages/school/SchoolSafeguardingPage'
import { SchoolImpactReportsPage } from './pages/school/SchoolImpactReportsPage'
import { SchoolFacilityPage } from './pages/school/SchoolFacilityPage'
import { SchoolDocumentsPage } from './pages/school/SchoolDocumentsPage'
import { SchoolInfoFormPage } from './pages/school/SchoolInfoFormPage'
import { SchoolPoliciesPage } from './pages/school/SchoolPoliciesPage'
import { SchoolPortalAdminPage } from './pages/admin/SchoolPortalAdminPage'
import { PupilImportPage } from './pages/admin/PupilImportPage'
import { IncidentReportFormPage } from './pages/incidents/IncidentReportFormPage'
import { IncidentReportsPage } from './pages/incidents/IncidentReportsPage'
import { IncidentReportDetailPage } from './pages/incidents/IncidentReportDetailPage'

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
          <Route path="/my-area" element={
            <ProtectedRoute><MyAreaPage /></ProtectedRoute>
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
          <Route path="/sessions" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'lead_coach']}>
              <SessionsPage />
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

          {/* Director + Area Lead */}
          <Route path="/admin/schools" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
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
          <Route path="/announcements" element={
            <ProtectedRoute><AnnouncementsPage /></ProtectedRoute>
          } />
          <Route path="/guide" element={
            <ProtectedRoute><GuidePage /></ProtectedRoute>
          } />
          <Route path="/handbook" element={
            <ProtectedRoute><HandbookPage /></ProtectedRoute>
          } />
          <Route path="/crm" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'outreach_worker']}>
              <CrmPage />
            </ProtectedRoute>
          } />
          <Route path="/crm/:id" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'outreach_worker']}>
              <CrmContactPage />
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute><DocumentsPage /></ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute><ExpensesPage /></ProtectedRoute>
          } />
          <Route path="/expenses/admin" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <ExpensesAdminPage />
            </ProtectedRoute>
          } />

          <Route path="/coach-pool" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'outreach_worker']}>
              <CoachPoolPage />
            </ProtectedRoute>
          } />
          <Route path="/absences" element={
            <ProtectedRoute><AbsencesPage /></ProtectedRoute>
          } />

          {/* School portal — school role only (enforced in ProtectedRoute) */}
          <Route path="/school-portal" element={
            <ProtectedRoute><SchoolPortalPage /></ProtectedRoute>
          } />
          <Route path="/school-portal/register" element={
            <ProtectedRoute><SchoolRegisterPage /></ProtectedRoute>
          } />
          <Route path="/school-portal/club" element={
            <ProtectedRoute><SchoolClubInfoPage /></ProtectedRoute>
          } />
          <Route path="/school-portal/safeguarding" element={
            <ProtectedRoute><SchoolSafeguardingPage /></ProtectedRoute>
          } />
          <Route path="/school-portal/reports" element={
            <ProtectedRoute><SchoolImpactReportsPage /></ProtectedRoute>
          } />
          <Route path="/school-portal/facility" element={
            <ProtectedRoute><SchoolFacilityPage /></ProtectedRoute>
          } />
          <Route path="/school-portal/documents" element={
            <ProtectedRoute><SchoolDocumentsPage /></ProtectedRoute>
          } />
          <Route path="/school-portal/info" element={
            <ProtectedRoute><SchoolInfoFormPage /></ProtectedRoute>
          } />
          <Route path="/school-portal/policies" element={
            <ProtectedRoute><SchoolPoliciesPage /></ProtectedRoute>
          } />

          {/* Admin: school portal view */}
          <Route path="/admin/import-pupils" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <PupilImportPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/school-portal/:id" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <SchoolPortalAdminPage />
            </ProtectedRoute>
          } />

          {/* Incident reports — lead coaches create, area leads/directors review */}
          <Route path="/incidents" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'lead_coach']}>
              <IncidentReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/incidents/new" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'lead_coach']}>
              <IncidentReportFormPage />
            </ProtectedRoute>
          } />
          <Route path="/incidents/:id" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'lead_coach']}>
              <IncidentReportDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/incidents/:id/edit" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'lead_coach']}>
              <IncidentReportFormPage />
            </ProtectedRoute>
          } />

          {/* Parent portal — public */}
          <Route path="/portal" element={<PortalHomePage />} />
          <Route path="/portal/clubs" element={<PortalClubsPage />} />
          <Route path="/portal/clubs/:id" element={<PortalClubDetailPage />} />
          <Route path="/portal/sports" element={<PortalSportsPage />} />
          <Route path="/portal/affiliations" element={<PortalAffiliationsPage />} />
          <Route path="/portal/about" element={<PortalAboutPage />} />
          <Route path="/portal/login" element={<PortalLoginPage />} />
          <Route path="/portal/register" element={<PortalRegisterPage />} />
          <Route path="/portal/terms" element={<PortalTermsPage />} />

          {/* Parent portal — protected (parent login required) */}
          <Route path="/portal/my-bookings" element={
            <ParentProtectedRoute><PortalDashboardPage /></ParentProtectedRoute>
          } />
          <Route path="/portal/book/:termId" element={<PortalBookingPage />} />
          <Route path="/portal/booking-confirmed" element={<PortalBookingConfirmedPage />} />

          {/* School portal — class roster */}
          <Route path="/school-portal/roster" element={
            <ProtectedRoute><SchoolRosterPage /></ProtectedRoute>
          } />

          {/* Admin — bookings & club terms */}
          <Route path="/admin/club-terms" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <ClubTermsAdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <BookingsAdminPage />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
