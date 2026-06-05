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

const titles = {
  '/admin': 'Learners',
  '/admin/enrolments': 'Enrolments',
  '/admin/certificates': 'Certificates',
  '/admin/reports': 'Compliance Reports',
}

export default function CompanyAdminLayout() {
  const location = useLocation()
  const title = titles[location.pathname] || 'Admin'

  return (
    <AdminShell
      navItems={navItems}
      headerTitle={title}
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
