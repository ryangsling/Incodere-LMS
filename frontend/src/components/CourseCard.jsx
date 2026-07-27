import Button from './ui/Button'

export default function CourseCard({
  course,
  progress,
  completedLessons,
  totalLessons,
  onContinue,
}) {
  const percentage = progress || 0
  const isComplete = percentage === 100
  const notStarted = percentage === 0

  return (
    // Hover is CSS (`card-interactive`). This previously mutated
    // element.style on mouseenter/mouseleave, and one handler used e.target
    // rather than e.currentTarget, so hovering a child restyled the wrong node.
    <article className="card card-interactive flex flex-col p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <p
          className={
            isComplete
              ? 'badge border-accent-200 bg-accent-soft text-accent-on-soft'
              : 'badge border-border bg-structural text-body'
          }
        >
          {isComplete ? 'Completed' : notStarted ? 'Not started' : 'In progress'}
        </p>
        <p data-numeric className="text-sm text-muted">
          {completedLessons || 0}/{totalLessons || 0}
        </p>
      </div>

      <h3 className="text-lg leading-snug">{course?.title || 'Untitled course'}</h3>
      {course?.description && (
        <p className="mt-2 line-clamp-2 text-sm text-body">{course.description}</p>
      )}

      <div className="mt-auto pt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs text-muted">Progress</span>
          <span data-numeric className="text-sm font-semibold text-ink">
            {percentage}%
          </span>
        </div>
        <div
          className="mb-5 h-1.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-structural"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${course?.title || 'Course'} progress`}
        >
          <div
            className="h-full rounded-[var(--radius-pill)] bg-accent transition-[width] duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <Button
          variant={isComplete ? 'secondary' : 'primary'}
          fullWidth
          onClick={onContinue}
        >
          {notStarted ? 'Start course' : isComplete ? 'Review course' : 'Continue'}
        </Button>
      </div>
    </article>
  )
}
