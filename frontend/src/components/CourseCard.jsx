import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Proximity } from 'z-proximity-engine'

export default function CourseCard({ course, progress, completedLessons, totalLessons, onContinue }) {
  const percentage = progress || 0;
  const courseId = course?.id || course?.course_id;
  const [isFinePointer, setIsFinePointer] = useState(() => window.matchMedia('(pointer: fine)').matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)')
    const handler = (e) => setIsFinePointer(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const cta = (
    <button
      onClick={onContinue}
      className="w-full mt-8 py-3.5 bg-typography text-canvas text-sm font-bold tracking-wide rounded-xl hover:bg-accent transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {percentage === 0 ? 'Start Course' : percentage === 100 ? 'Review Course' : 'Continue Learning'}
    </button>
  )

  return (
    <motion.div
      layoutId={`course-card-${courseId}`}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bento-card rounded-2xl p-6 md:p-8 flex flex-col justify-between group relative"
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <span className="inline-flex items-center justify-center px-3 py-1 bg-structural text-typography text-xs font-semibold uppercase tracking-wider rounded-full border border-border-hairline">
            {percentage === 100 ? 'Completed' : 'Active'}
          </span>
          <span className="text-sm font-medium text-typography opacity-60">
            {completedLessons || 0}/{totalLessons || 0} Modules
          </span>
        </div>
        <motion.h3
          layoutId={`course-title-${courseId}`}
          className="font-display text-2xl sm:text-3xl font-bold text-typography leading-none mb-3 tracking-tight group-hover:text-accent transition-colors duration-300"
        >
          {course?.title || 'Untitled Course'}
        </motion.h3>
        <p className="body-copy opacity-70 mb-8 line-clamp-2">
          {course?.description || 'Continue your learning journey with this module.'}
        </p>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-typography tracking-tight">{percentage}% Completed</span>
        </div>
        <div className="w-full bg-structural h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-accent h-full rounded-full transition-all duration-1000"
            style={{ width: `${percentage}%`, transitionTimingFunction: 'var(--ease-expo)' }}
          />
        </div>

        {isFinePointer ? (
          <Proximity magnetic={0.2} tilt={0.1} distance={50}>
            {cta}
          </Proximity>
        ) : cta}
      </div>
    </motion.div>
  )
}
