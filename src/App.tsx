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
import { PortalBasketPage } from './pages/portal/PortalBasketPage'
import { PortalForSchoolsPage } from './pages/portal/PortalForSchoolsPage'
import { PortalSummerCampsPage } from './pages/portal/PortalSummerCampsPage'
import { PortalMyChildrenPage } from './pages/portal/PortalMyChildrenPage'
import { BasketProvider } from './contexts/BasketContext'
import { ClubTermsAdminPage } from './pages/admin/ClubTermsAdminPage'
import { BookingsAdminPage } from './pages/admin/BookingsAdminPage'
import { DiscountCodesAdminPage } from './pages/admin/DiscountCodesAdminPage'
import { DataExportsPage } from './pages/admin/DataExportsPage'
import { SchoolRosterPage } from './pages/school/SchoolRosterPage'

import { LoginPage } from './pages/auth/LoginPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
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
import { MyTimesheetPage } from './pages/clockin/MyTimesheetPage'
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
import { PortalCommunityPage } from './pages/portal/PortalCommunityPage'
import { PortalContactPage } from './pages/portal/PortalContactPage'
import { PortalCareersPage } from './pages/portal/PortalCareersPage'
import { PortalCareerDetailPage } from './pages/portal/PortalCareerDetailPage'
import { PortalCareerApplyPage } from './pages/portal/PortalCareerApplyPage'
import { PortalCoachPoolJoinPage } from './pages/portal/PortalCoachPoolJoinPage'
import { JobAdvertsAdminPage } from './pages/admin/JobAdvertsAdminPage'
import { JobApplicationsAdminPage } from './pages/admin/JobApplicationsAdminPage'
import { HolidayCampsAdminPage } from './pages/admin/HolidayCampsAdminPage'

// Intercepts Supabase auth tokens that land on the root URL (e.g. recovery emails
// sent before /reset-password was added to the allowed redirect list).
function RootRedirect() {
  const hash = window.location.hash
  if (hash.includes('type=recovery') || (hash.includes('access_token') && hash.includes('recovery'))) {
    return <Navigate to={'/reset-password' + hash} replace />
  }
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BasketProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* Root: intercept Supabase recovery tokens before redirecting */}
          <Route path="/" element={<RootRedirect />} />

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
          <Route path="/my-timesheet" element={
            <ProtectedRoute><MyTimesheetPage /></ProtectedRoute>
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
            <ProtectedRoute allowedRoles={['director', 'area_lead', 'lead_coach']}>
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
          <Route path="/admin/discount-codes" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <DiscountCodesAdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/data-exports" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <DataExportsPage />
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
          <Route path="/portal/for-schools" element={<PortalForSchoolsPage />} />
          <Route path="/portal/summer-camps" element={<PortalSummerCampsPage />} />
          <Route path="/portal/login" element={<PortalLoginPage />} />
          <Route path="/portal/register" element={<PortalRegisterPage />} />
          <Route path="/portal/terms" element={<PortalTermsPage />} />

          {/* Parent portal — protected (parent login required) */}
          <Route path="/portal/my-bookings" element={
            <ParentProtectedRoute><PortalDashboardPage /></ParentProtectedRoute>
          } />
          <Route path="/portal/book/:termId" element={<PortalBookingPage />} />
          <Route path="/portal/basket" element={<PortalBasketPage />} />
          <Route path="/portal/booking-confirmed" element={<PortalBookingConfirmedPage />} />
          <Route path="/portal/my-children" element={
            <ParentProtectedRoute><PortalMyChildrenPage /></ParentProtectedRoute>
          } />

          {/* School portal — class roster */}
          <Route path="/school-portal/roster" element={
            <ProtectedRoute><SchoolRosterPage /></ProtectedRoute>
          } />

          {/* Community + recruitment — public */}
          <Route path="/portal/community" element={<PortalCommunityPage />} />
          <Route path="/portal/contact" element={<PortalContactPage />} />
          <Route path="/portal/careers" element={<PortalCareersPage />} />
          <Route path="/portal/careers/:id" element={<PortalCareerDetailPage />} />
          <Route path="/portal/careers/:id/apply" element={<PortalCareerApplyPage />} />
          <Route path="/portal/coach-pool" element={<PortalCoachPoolJoinPage />} />

          {/* Recruitment — admin */}
          <Route path="/admin/job-adverts" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <JobAdvertsAdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/job-applications" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <JobApplicationsAdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/holiday-camps" element={
            <ProtectedRoute allowedRoles={['director', 'area_lead']}>
              <HolidayCampsAdminPage />
            </ProtectedRoute>
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
        </BasketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
