import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems, TransitionChild } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { classNames } from '../../utils/classNames'

// Adapted from twp-components/Application UI/Application Shells/Sidebar Layouts/With constrained content area/v4
export default function AdminShell({ navItems, brand, headerTitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div className="flex h-16 shrink-0 items-center px-6">
        {brand || <Link to="/"><div className="flex items-center gap-2"><div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5"><div className="w-full h-full bg-white rounded-sm"></div></div><span className="text-typography font-bold text-xl tracking-tight">ILMS</span></div></Link>}
      </div>
      <nav className="flex flex-1 flex-col px-3 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={() => mobile && setSidebarOpen(false)}
                className={({ isActive }) =>
                  classNames(
                    'group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-typography/80 hover:bg-black/5 hover:text-typography',
                  )
                }
              >
                {item.icon && (
                  <item.icon
                    aria-hidden="true"
                    className="size-5 shrink-0"
                  />
                )}
                {item.label}
              </NavLink>
            </li>
          ))}
          <li className="mt-auto">
            <button
              type="button"
              onClick={handleLogout}
              className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold text-typography/80 hover:bg-black/5 hover:text-typography"
            >
              <ArrowRightOnRectangleIcon aria-hidden="true" className="size-5 shrink-0" />
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </>
  )

  return (
    <div className="min-h-screen bg-canvas">
      {/* Mobile drawer */}
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/60 transition-opacity duration-300 data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute top-0 left-full flex w-16 justify-center pt-5 transition duration-300 ease-in-out data-closed:opacity-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5"
                  aria-label="Close sidebar"
                >
                  <XMarkIcon aria-hidden="true" className="size-6 text-typography" />
                </button>
              </div>
            </TransitionChild>
            <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-structural border-r border-border-hairline text-typography">
              <SidebarContent mobile />
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Static desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-structural border-r border-border-hairline text-typography">
          <SidebarContent />
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-canvas px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-navy-700 hover:text-primary-600 lg:hidden"
            aria-label="Open sidebar"
          >
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div aria-hidden="true" className="h-6 w-px bg-gray-200 lg:hidden" />
          <div className="flex flex-1 items-center justify-between gap-x-4">
            <h1 className="text-base font-semibold text-navy-700 truncate">{headerTitle}</h1>
            <Menu as="div" className="relative">
              <MenuButton className="relative flex items-center gap-x-2 rounded-full bg-canvas p-1.5 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                <span className="sr-only">Open user menu</span>
                <div className="size-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <span className="hidden sm:flex sm:items-center">
                  <span aria-hidden="true" className="text-sm font-semibold text-navy-700">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <ChevronDownIcon aria-hidden="true" className="ml-1 size-4 text-muted" />
                </span>
              </MenuButton>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-canvas py-2 shadow-lg outline-1 outline-gray-900/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75"
              >
                <div className="px-3 py-2 border-b border-gray-200">
                  <p className="text-xs text-muted">Signed in as</p>
                  <p className="text-sm font-medium text-navy-700 truncate">{user?.email}</p>
                </div>
                <MenuItem>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-1.5 text-sm text-navy-700 data-focus:bg-canvas data-focus:outline-hidden"
                  >
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
