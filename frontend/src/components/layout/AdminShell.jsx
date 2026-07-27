import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems, TransitionChild } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { classNames } from '../../utils/classNames'

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline">
      <img src="/logo-mark.svg" alt="" width="28" height="28" className="shrink-0" />
      <span className="text-lg font-semibold tracking-tight text-ink">ILMS</span>
    </Link>
  )
}

export default function AdminShell({ navItems, brand, headerTitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const sidebarNav = (
    <ul role="list" className="flex flex-1 flex-col gap-y-1">
      {navItems.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              classNames(
                'group flex items-center gap-x-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-white'
                  : 'text-body hover:bg-structural hover:text-ink',
              )
            }
          >
            {item.icon && <item.icon aria-hidden="true" className="size-5 shrink-0" />}
            <span className="truncate">{item.label}</span>
          </NavLink>
        </li>
      ))}
      <li className="mt-auto pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-x-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-body transition-colors hover:bg-structural hover:text-ink"
        >
          <ArrowRightOnRectangleIcon aria-hidden="true" className="size-5 shrink-0" />
          <span className="truncate">Sign out</span>
        </button>
      </li>
    </ul>
  )

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Mobile drawer */}
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-ink/40 transition-opacity duration-200 data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-200 ease-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute top-0 left-full flex w-16 justify-center pt-5 transition duration-200 data-closed:opacity-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5 text-white"
                  aria-label="Close navigation"
                >
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
              </div>
            </TransitionChild>
            <div className="relative flex grow flex-col gap-y-6 overflow-y-auto border-r border-border bg-surface px-4 pb-4">
              <div className="flex h-16 shrink-0 items-center">{brand || <Wordmark />}</div>
              <nav aria-label="Main" className="flex flex-1 flex-col" onClick={() => setSidebarOpen(false)}>
                {sidebarNav}
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Desktop sidebar. w-64 resolves to 16rem again now that the colliding
          --spacing-64 token is gone; it previously rendered at 4rem and clipped
          every nav label. */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-border bg-surface px-4 pb-4">
          <div className="flex h-16 shrink-0 items-center">{brand || <Wordmark />}</div>
          <nav aria-label="Main" className="flex flex-1 flex-col">
            {sidebarNav}
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-border bg-canvas/90 px-4 backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-ink lg:hidden"
            aria-label="Open navigation"
          >
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div aria-hidden="true" className="h-6 w-px bg-border lg:hidden" />

          <div className="flex flex-1 items-center justify-between gap-x-4">
            {/* Plain label, not an h1. The page's PageHeader owns the h1, and
                printing the same text as a second h1 here broke the outline on
                every screen. */}
            <p className="truncate text-sm font-medium text-muted">{headerTitle}</p>

            <Menu as="div" className="relative">
              <MenuButton className="flex items-center gap-x-2 rounded-[var(--radius-pill)] p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                <span className="sr-only">Open user menu</span>
                <span
                  aria-hidden="true"
                  className="flex size-8 items-center justify-center rounded-[var(--radius-pill)] bg-accent text-xs font-semibold text-white"
                >
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </span>
                <span className="hidden items-center sm:flex">
                  <span className="text-sm font-medium text-ink">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <ChevronDownIcon aria-hidden="true" className="ml-1 size-4 text-muted" />
                </span>
              </MenuButton>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-[var(--radius-control)] border border-border bg-surface py-1 shadow-lg transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75"
              >
                <div className="border-b border-border px-3 py-2">
                  <p className="text-xs text-muted">Signed in as</p>
                  <p className="truncate text-sm font-medium text-ink">{user?.email}</p>
                </div>
                <MenuItem>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-3 py-2 text-left text-sm text-ink transition-colors data-focus:bg-structural data-focus:outline-hidden"
                  >
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </header>

        <main className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
