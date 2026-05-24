import { Routes, Route, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CompanyAdminLearners from './CompanyAdminLearners'
import CompanyAdminEnrolments from './CompanyAdminEnrolments'

const links = [
  { to: '/admin/learners', label: 'Learners' },
  { to: '/admin/enrolments', label: 'Enrolments' },
]

export default function CompanyAdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex">
      <aside className="w-56 bg-[#032147] text-white min-h-screen p-4 flex flex-col">
        <h2 className="font-bold text-sm mb-6 px-3">Admin</h2>
        <nav className="flex flex-col gap-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm ${isActive ? 'bg-[#01696f]' : 'hover:bg-white/10'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <h1 className="font-bold text-[#032147] text-lg">ILMS Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#888888]">{user?.first_name} {user?.last_name}</span>
            <button onClick={logout} className="text-sm text-[#01696f] hover:underline">Sign Out</button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Routes>
            <Route index element={<CompanyAdminLearners />} />
            <Route path="learners" element={<CompanyAdminLearners />} />
            <Route path="enrolments" element={<CompanyAdminEnrolments />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
