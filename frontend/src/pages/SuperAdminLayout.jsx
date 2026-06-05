import { Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { ChartBarSquareIcon, BuildingOfficeIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import AdminShell from '../components/layout/AdminShell'
import CourseList from './CourseList'
import CourseForm from './CourseForm'
import CourseDetail from './CourseDetail'
import OrganisationList from './OrganisationList'
import OrganisationDetail from './OrganisationDetail'
import PlatformStats from './PlatformStats'

const navItems = [
  { to: '/super-admin', end: true, label: 'Courses', icon: BookOpenIcon },
  { to: '/super-admin/organisations', label: 'Organisations', icon: BuildingOfficeIcon },
  { to: '/super-admin/stats', label: 'Platform Stats', icon: ChartBarSquareIcon },
]

export default function SuperAdminLayout() {
  const location = useLocation()
  const isCoursesRoute = location.pathname.startsWith('/super-admin') &&
    !location.pathname.startsWith('/super-admin/organisations') &&
    !location.pathname.startsWith('/super-admin/stats')

  return (
    <AdminShell
      navItems={navItems}
      headerTitle={isCoursesRoute ? 'Course Catalogue' : 'Platform'}
    >
      <Routes>
        <Route index element={<CourseList />} />
        <Route path="courses" element={<CourseList />} />
        <Route path="courses/new" element={<CourseForm />} />
        <Route path="courses/:id/edit" element={<CourseForm />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="organisations" element={<OrganisationList />} />
        <Route path="organisations/:orgId" element={<OrganisationDetail />} />
        <Route path="stats" element={<PlatformStats />} />
      </Routes>
    </AdminShell>
  )
}
