import { Routes, Route, useLocation } from 'react-router-dom'
import { UsersIcon, AcademicCapIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import AdminShell from '../components/layout/AdminShell'
import CompanyAdminLearners from './CompanyAdminLearners'
import CompanyAdminEnrolments from './CompanyAdminEnrolments'
import CompanyAdminCertificates from './CompanyAdminCertificates'
import CompanyAdminReports from './CompanyAdminReports'

const navItems = [
  { to: '/admin', end: true, label: 'Learners', icon: UsersIcon },
  { to: '/admin/enrolments', label: 'Enrolments', icon: AcademicCapIcon },
  { to: '/admin/certificates', label: 'Certificates', icon: DocumentTextIcon },
  { to: '/admin/reports', label: 'Reports', icon: ChartBarIcon },
]

// The shell label names the current *section* and is derived from navItems, so
// it can never drift from the sidebar the way the old hardcoded map did.
function sectionLabel(pathname) {
  const match = [...navItems]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)))
  return match?.label ?? 'Admin'
}

export default function CompanyAdminLayout() {
  const location = useLocation()

  return (
    <AdminShell
      navItems={navItems}
      headerTitle={sectionLabel(location.pathname)}
    >
      <Routes>
        <Route index element={<CompanyAdminLearners />} />
        <Route path="learners" element={<CompanyAdminLearners />} />
        <Route path="enrolments" element={<CompanyAdminEnrolments />} />
        <Route path="certificates" element={<CompanyAdminCertificates />} />
        <Route path="reports" element={<CompanyAdminReports />} />
      </Routes>
    </AdminShell>
  )
}
