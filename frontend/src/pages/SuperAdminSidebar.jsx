import { NavLink } from 'react-router-dom'

const links = [
  { to: '/super-admin/courses', label: 'Courses' },
  { to: '/super-admin/organisations', label: 'Organisations' },
  { to: '/super-admin/stats', label: 'Stats' },
]

export default function SuperAdminSidebar() {
  return (
    <aside className="w-56 bg-[#032147] text-white min-h-screen p-4 flex flex-col">
      <h2 className="font-bold text-sm mb-6 px-3">Super Admin</h2>
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
  )
}
