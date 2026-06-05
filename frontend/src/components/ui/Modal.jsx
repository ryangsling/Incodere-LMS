import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { classNames } from '../../utils/classNames'
import { useEffect } from 'react'

// Adapted from twp-components/Application UI/Overlays/Modal Dialogs/Simple with dismiss button/v4
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-navy-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className={classNames(
              'relative transform overflow-hidden rounded-lg bg-surface text-left shadow-xl transition-all',
              'data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150',
              'sm:my-8 sm:w-full',
              sizeClasses[size],
              className,
            )}
          >
            {(title || onClose) && (
              <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-gray-200">
                <div>
                  {title && (
                    <DialogTitle as="h3" className="text-lg font-semibold text-navy-700">
                      {title}
                    </DialogTitle>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-muted">{description}</p>
                  )}
                </div>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="-m-1.5 p-1.5 rounded-md text-muted hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    aria-label="Close"
                  >
                    <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div className="px-6 py-4">{children}</div>
            {footer && (
              <div className="bg-canvas px-6 py-3 border-t border-gray-200 flex items-center justify-end gap-x-2">
                {footer}
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
