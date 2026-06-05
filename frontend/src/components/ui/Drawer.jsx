import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { classNames } from '../../utils/classNames'
import { useEffect } from 'react'

// Adapted from twp-components/Application UI/Overlays/Drawers/With branded header/v4
export default function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
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

  const sideClasses = {
    right: 'right-0 data-closed:translate-x-full',
    left: 'left-0 data-closed:-translate-x-full',
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-navy-900/40 transition-opacity data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className={classNames('pointer-events-none fixed inset-y-0 flex max-w-full', side === 'right' ? 'right-0' : 'left-0')}>
            <DialogPanel
              transition
              className={classNames(
                'pointer-events-auto relative w-screen max-w-md transform transition duration-300 ease-in-out',
                sideClasses[side],
                className,
              )}
            >
              <div className="flex h-full flex-col bg-surface shadow-xl">
                {(title || onClose) && (
                  <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between bg-primary-50">
                    <div>
                      {title && (
                        <DialogTitle as="h3" className="text-base font-semibold text-navy-700">
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
                        className="-m-1.5 p-1.5 rounded-md text-muted hover:bg-white/60"
                        aria-label="Close"
                      >
                        <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
                {footer && (
                  <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-end gap-x-2 bg-canvas">
                    {footer}
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
