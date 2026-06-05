export default function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-r from-typography to-canvas">
      {/* Marketing side (Left) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5">
            <div className="w-full h-full bg-white rounded-sm" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ILMS</span>
        </div>

        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-96 h-96 border border-white/5 rounded-[3rem] flex items-center justify-center">
              <div className="w-64 h-64 border border-white/5 rounded-[2rem]" />
            </div>
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4 tracking-tight leading-tight">
            Corporate learning,<br />made simple.
          </h2>
          <p className="text-lg text-white/60 max-w-sm">
            Manage your organisation's training, track progress, and issue certificates.
          </p>
        </div>

        <div className="text-white/40 text-xs tracking-wider uppercase font-semibold">
          © 2026 INCODET LMS PLATFORM
        </div>
      </div>

      {/* Form side (Right) */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-4 py-12 sm:px-6 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden mb-12">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5">
                <div className="w-full h-full bg-white rounded-sm" />
              </div>
              <span className="text-typography font-bold text-xl tracking-tight">ILMS</span>
            </div>
          </div>

          {title && (
            <h2 className="text-3xl font-display font-bold tracking-tight text-typography">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-typography/60 mb-8">{subtitle}</p>
          )}
          {!subtitle && title && <div className="mb-8" />}

          {children}
        </div>
      </div>
    </div>
  )
}
