import { useAuth } from '../context/AuthContext'

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <header className="bg-[#01696f] text-white px-6 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg">ILMS Super Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.first_name} {user?.last_name}</span>
          <button
            onClick={logout}
            className="text-sm bg-white text-[#01696f] px-3 py-1 rounded hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold text-[#032147] mb-4">Platform Management</h2>
        <p className="text-[#888888] text-sm">Manage organisations, courses, and users.</p>
      </main>
    </div>
  )
}
