import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { useAuth } from './context/AuthContext'
import { ToastProvider, Skeleton } from './components/ui'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AcceptInvite from './pages/AcceptInvite'
import VerifyCertificate from './pages/VerifyCertificate'
import LearnerDashboard from './pages/LearnerDashboard'
import LearnerCoursePlayer from './pages/LearnerCoursePlayer'
import CompanyAdminLayout from './pages/CompanyAdminLayout'
import SuperAdminLayout from './pages/SuperAdminLayout'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton variant="block" />
          <Skeleton variant="text" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />

  return children
}

function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton variant="block" />
          <Skeleton variant="text" />
        </div>
      </div>
    )
  }

  if (!user) return <Landing />

  switch (user.role) {
    case 'super_admin':
      return <Navigate to="/super-admin" replace />
    case 'company_admin':
      return <Navigate to="/admin" replace />
    case 'learner':
      return <Navigate to="/dashboard" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

function App() {
  const location = useLocation()

  return (
    <ToastProvider>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['learner']}>
                <LearnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/courses/:courseId"
            element={
              <ProtectedRoute roles={['learner']}>
                <LearnerCoursePlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['company_admin']}>
                <CompanyAdminLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/*"
            element={
              <ProtectedRoute roles={['super_admin']}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </ToastProvider>
  )
}

export default App
