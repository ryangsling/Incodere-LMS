import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ToastProvider, Skeleton } from './components/ui'

// Landing and Login are the entry points, so they stay in the main chunk.
import Landing from './pages/Landing'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Everything else is split out. The marketing page previously downloaded and
// parsed the entire authenticated app, including the Supabase client and every
// admin screen, before it could paint.
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const AcceptInvite = lazy(() => import('./pages/AcceptInvite'))
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'))
const LearnerDashboard = lazy(() => import('./pages/LearnerDashboard'))
const LearnerCoursePlayer = lazy(() => import('./pages/LearnerCoursePlayer'))
const LearnerCertificates = lazy(() => import('./pages/LearnerCertificates'))
const CompanyAdminLayout = lazy(() => import('./pages/CompanyAdminLayout'))
const SuperAdminLayout = lazy(() => import('./pages/SuperAdminLayout'))

function RouteFallback() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-canvas"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-64 space-y-3">
        <Skeleton variant="block" />
        <Skeleton variant="text" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <RouteFallback />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />

  return children
}

function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) return <RouteFallback />
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
  return (
    <ToastProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
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
            path="/dashboard/certificates"
            element={
              <ProtectedRoute roles={['learner']}>
                <LearnerCertificates />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  )
}

export default App
