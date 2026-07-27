export default function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-canvas)' }}>
      {/* Marketing side (Left) */}
      <div
        className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: 'var(--color-deep-ink)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <div className="w-3.5 h-3.5 bg-white rounded-sm" />
          </div>
          <span className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-sans)' }}>
            ILMS
          </span>
        </div>

        <div className="relative flex flex-col items-start justify-center">
          <h2
            className="text-4xl mb-4 tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 400 }}
          >
            Corporate learning,<br />made simple.
          </h2>
          <p className="text-base max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Manage your organisation's training, track progress, and issue certificates.
          </p>

          {/* Product mock */}
          <div
            className="mt-10 w-full max-w-sm rounded-xl p-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-2.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)', width: '60%' }} />
                <div className="h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)', width: '20%' }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-2.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: '45%' }} />
                <div className="h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)', width: '15%' }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-2.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: '70%' }} />
                <div className="h-2.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: '18%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs tracking-wider uppercase font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
          &copy; {new Date().getFullYear()} incodet
        </div>
      </div>

      {/* Form side (Right) */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-4 py-12 sm:px-6 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden mb-12">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <div className="w-3.5 h-3.5 bg-white rounded-sm" />
              </div>
              <span
                className="text-lg font-semibold"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-deep-ink)' }}
              >
                ILMS
              </span>
            </div>
          </div>

          {title && (
            <h2
              className="text-2xl mb-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-deep-ink)', fontWeight: 400 }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm mb-8" style={{ color: 'var(--color-stone)' }}>{subtitle}</p>
          )}
          {!subtitle && title && <div className="mb-8" />}

          {children}
        </div>
      </div>
    </div>
  )
}
