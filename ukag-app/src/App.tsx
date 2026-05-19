import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ClubsPage } from './pages/clubs/ClubsPage'
import { ClubDetailPage } from './pages/clubs/ClubDetailPage'
import { CoachesPage } from './pages/coaches/CoachesPage'
import { CoachDetailPage } from './pages/coaches/CoachDetailPage'
import { CoursesPage } from './pages/courses/CoursesPage'
import { CourseDetailPage } from './pages/courses/CourseDetailPage'
import { AwardsPage } from './pages/awards/AwardsPage'
import { ProfilePage } from './pages/profile/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/clubs" element={<ProtectedRoute><ClubsPage /></ProtectedRoute>} />
          <Route path="/clubs/:id" element={<ProtectedRoute><ClubDetailPage /></ProtectedRoute>} />
          <Route path="/coaches" element={<ProtectedRoute allowedRoles={['admin']}><CoachesPage /></ProtectedRoute>} />
          <Route path="/coaches/:id" element={<ProtectedRoute allowedRoles={['admin']}><CoachDetailPage /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />
          <Route path="/awards" element={<ProtectedRoute><AwardsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
