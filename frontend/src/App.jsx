import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ToastProvider, Skeleton } from './components/ui'
import Landing from './pages/Landing'
import Login from './pages/Login'
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
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
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
    </ToastProvider>
  )
}

export default App
