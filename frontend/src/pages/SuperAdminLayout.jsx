import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SuperAdminSidebar from './SuperAdminSidebar'
import CourseList from './CourseList'
import CourseForm from './CourseForm'
import CourseDetail from './CourseDetail'

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <h1 className="font-bold text-[#032147] text-lg">ILMS Super Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#888888]">{user?.first_name} {user?.last_name}</span>
            <button onClick={logout} className="text-sm text-[#01696f] hover:underline">Sign Out</button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Routes>
            <Route index element={<CourseList />} />
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/new" element={<CourseForm />} />
            <Route path="courses/:id/edit" element={<CourseForm />} />
            <Route path="courses/:id" element={<CourseDetail />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
