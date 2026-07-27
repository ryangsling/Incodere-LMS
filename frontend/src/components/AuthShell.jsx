import { Link } from 'react-router-dom'

export default function AuthShell({ children, title, subtitle }) {
  return (
    <div className="flex min-h-dvh bg-canvas">
      {/* Marketing panel. The previous version rendered a fake product
          dashboard out of six styled div bars; a plain statement of what the
          product does is more honest and reads better than a pretend UI. */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-ink p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src="/logo-mark-white.svg" alt="" width="28" height="28" />
          <span className="text-lg font-semibold tracking-tight text-white">ILMS</span>
        </Link>

        <div className="max-w-md">
          <p className="text-3xl leading-tight font-semibold tracking-[-0.02em] text-white">
            Corporate learning,
            <br />
            made simple.
          </p>
          <p className="mt-5 leading-relaxed text-white/65">
            Assign courses, track progress across your organisation, and issue
            certificates automatically when people finish.
          </p>
        </div>

        <p className="text-sm text-white/40">
          &copy; {new Date().getFullYear()} incodet
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-5 py-12 sm:px-8 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-12 flex items-center gap-2.5 no-underline lg:hidden">
            <img src="/logo-mark.svg" alt="" width="28" height="28" />
            <span className="text-lg font-semibold tracking-tight text-ink">ILMS</span>
          </Link>

          {title && <h1 className="text-2xl">{title}</h1>}
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className={title ? 'mt-8' : ''}>{children}</div>
        </div>
      </div>
    </div>
  )
}
