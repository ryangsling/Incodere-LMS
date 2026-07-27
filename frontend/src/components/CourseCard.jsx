export default function CourseCard({ course, progress, completedLessons, totalLessons, onContinue }) {
  const percentage = progress || 0

  return (
    <div
      className="rounded-2xl p-6 flex flex-col justify-between transition-all duration-200"
      style={{
        backgroundColor: 'var(--color-pure-white)',
        border: '1px solid var(--color-border-hairline)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(13, 148, 136, 0.3)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-border-hairline)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: percentage === 100 ? 'var(--color-accent-soft)' : 'var(--color-structural)',
              color: percentage === 100 ? 'var(--color-accent)' : 'var(--color-stone)',
            }}
          >
            {percentage === 100 ? 'Completed' : 'In Progress'}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--color-stone)' }}>
            {completedLessons || 0}/{totalLessons || 0}
          </span>
        </div>

        <h3
          className="text-lg mb-2 leading-snug"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-deep-ink)' }}
        >
          {course?.title || 'Untitled Course'}
        </h3>
        <p className="text-sm line-clamp-2 mb-6" style={{ color: 'var(--color-stone)' }}>
          {course?.description || 'Continue your learning journey.'}
        </p>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--color-deep-ink)' }}>
            {percentage}% complete
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden mb-5" style={{ backgroundColor: 'var(--color-structural)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${percentage}%`, backgroundColor: 'var(--color-accent)' }}
          />
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-deep-ink)',
            color: 'white',
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = 'var(--color-accent)'
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = 'var(--color-deep-ink)'
          }}
        >
          {percentage === 0 ? 'Start Course' : percentage === 100 ? 'Review Course' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
