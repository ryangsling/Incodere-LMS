import { createContext, useCallback, useContext, useState } from 'react'
import { Transition } from '@headlessui/react'
import { classNames } from '../../utils/classNames'

// Adapted from twp-components/Application UI/Overlays/Notifications/Simple/v4
const ToastContext = createContext(null)

let idCounter = 0

const variantClasses = {
  success: 'bg-emerald-800 text-white ring-1 ring-emerald-900',
  error: 'bg-red-800 text-white ring-1 ring-red-900',
  info: 'bg-[#032147] text-white ring-1 ring-black/30',
  warning: 'bg-amber-800 text-white ring-1 ring-amber-900',
}

const variantIcons = {
  success: (
    <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message, { variant = 'info', duration = 8000, action } = {}) => {
      const id = ++idCounter
      setToasts((prev) => [...prev, { id, message, variant, action }])
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
      return id
    },
    [removeToast],
  )

  const value = {
    success: (message, opts) => show(message, { ...opts, variant: 'success' }),
    error: (message, opts) => show(message, { ...opts, variant: 'error' }),
    info: (message, opts) => show(message, { ...opts, variant: 'info' }),
    warning: (message, opts) => show(message, { ...opts, variant: 'warning' }),
    show,
    remove: removeToast,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <Transition
            key={t.id}
            appear
            show
            enter="transform transition duration-300 ease-out"
            enterFrom="-translate-y-8 opacity-0 scale-95"
            enterTo="translate-y-0 opacity-100 scale-100"
            leave="transform transition duration-200 ease-in"
            leaveFrom="translate-y-0 opacity-100 scale-100"
            leaveTo="-translate-y-4 opacity-0 scale-95"
          >
            <div
              className={classNames(
                'pointer-events-auto min-w-[360px] max-w-lg rounded-xl shadow-2xl px-5 py-4 flex items-start gap-x-3',
                variantClasses[t.variant],
              )}
              role="alert"
            >
              <div className="shrink-0 mt-0.5">{variantIcons[t.variant]}</div>
              <div className="flex-1 min-w-0 text-base font-semibold leading-snug">{t.message}</div>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action.onClick?.()
                    removeToast(t.id)
                  }}
                  className="shrink-0 -m-1.5 p-1.5 rounded-md hover:bg-white/20 font-semibold text-sm"
                >
                  {t.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 -m-1.5 p-1.5 rounded-md hover:bg-white/20"
                aria-label="Dismiss"
              >
                <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </Transition>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
