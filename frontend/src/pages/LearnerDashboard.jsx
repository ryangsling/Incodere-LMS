import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Proximity } from 'z-proximity-engine'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import CourseCard from '../components/CourseCard'

import { Skeleton, SkeletonGrid } from '../components/ui/Skeleton'

export default function LearnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [enrolments, setEnrolments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const container = useRef(null)
  const [isFinePointer, setIsFinePointer] = useState(() => window.matchMedia('(pointer: fine)').matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)')
    const handler = (e) => setIsFinePointer(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const [upcomingModules, setUpcomingModules] = useState([])

  useEffect(() => {
    api.enrolments.myEnrolments()
      .then(async (rows) => {
        const enrolmentsData = Array.isArray(rows) ? rows : rows.rows || []
        setEnrolments(enrolmentsData)

        // Find primary course
        const active = enrolmentsData.find(e => e.progress > 0 && e.progress < 100) || enrolmentsData[0]
        
        if (active?.course_id) {
          try {
            const courseData = await api.enrolments.getEnrolledCourse(active.course_id)
            const progressData = await api.progress.getCourseProgress(active.course_id)
            
            const progressMap = {}
            progressData.forEach(p => { progressMap[p.lesson_id] = p })

            const allLessons = courseData.sections?.flatMap(s => s.lessons || []) || []
            const incomplete = allLessons.filter(l => !progressMap[l.id]?.completed)
            
            setUpcomingModules(incomplete.slice(0, 3))
          } catch (e) {
            console.error("Failed to load upcoming modules", e)
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useGSAP(() => {
    if (loading) return

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const targets = gsap.utils.toArray('.display-title, .body-copy, .bento-card', container.current)
    if (!targets.length) return

    if (isReduced) {
      gsap.set(targets, { opacity: 0 })
      gsap.to(targets, {
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'none'
      })
      return
    }

    const tl = gsap.timeline({
      defaults: {
        ease: 'expo.out',
        duration: 1.2
      }
    })

    tl.set(targets, {
      autoAlpha: 0,
      clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
      y: 40
    })

    tl.to(targets, {
      autoAlpha: 1,
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      y: 0,
      stagger: 0.08,
      clearProps: 'clipPath,y'
    })
  }, { scope: container, dependencies: [loading] })

  // Identify primary course (in progress, highest progress, or first)
  const activeCourse = enrolments.find(e => e.progress > 0 && e.progress < 100) || enrolments[0]

  const resumeCta = (
    <button
      onClick={() => navigate(`/dashboard/courses/${activeCourse?.course_id}`)}
      className="w-full sm:w-auto px-10 py-4 bg-typography text-canvas font-bold rounded-xl hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      Resume Learning
    </button>
  )

  return (
    <div className="min-h-screen bg-structural">
      {/* Structural Header */}
      <header className="bg-canvas border-b border-border-hairline px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5">
            <div className="w-full h-full bg-white rounded-sm"></div>
          </div>
          <span className="text-typography font-bold text-xl tracking-tight">ILMS</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-typography opacity-80 hidden sm:block">
            {user?.first_name} {user?.last_name}
          </span>
          <button
            onClick={logout}
            className="text-sm font-semibold text-typography opacity-60 hover:opacity-100 hover:text-accent transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main ref={container} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

        {/* Page Title */}
        <div className="mb-12">
          <h2 className="display-title mb-4">Welcome back, {user?.first_name || 'Learner'}.</h2>
          <p className="body-copy opacity-60 max-w-2xl">
            Pick up where you left off or explore new modules. Consistency is the foundation of mastery.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bento-card rounded-xl border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {/* Bento Grid Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Main Hero Card: Course Progress */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="space-y-4">
                <Skeleton variant="block" className="h-[480px] rounded-3xl" />
              </div>
            ) : activeCourse ? (
              <motion.div
                layoutId={`course-card-${activeCourse.course_id}`}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bento-card rounded-3xl p-8 sm:p-12 min-h-[480px] flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Decorative element - subtle, structural, no slop */}
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                   <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                     <circle cx="12" cy="12" r="10" />
                     <path d="M12 2a10 10 0 0 1 10 10" />
                   </svg>
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-typography text-canvas rounded-full text-xs font-bold uppercase tracking-widest">
                    <span>Active Focus</span>
                  </div>
                  <motion.h3
                    layoutId={`course-title-${activeCourse.course_id}`}
                    className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-typography leading-[1.05] tracking-tight mb-6 max-w-2xl"
                  >
                    {activeCourse.course?.title || 'Untitled Course'}
                  </motion.h3>
                  <p className="body-copy opacity-70 max-w-xl text-lg">
                    {activeCourse.course?.description || 'Your next module is ready. Continue building your expertise.'}
                  </p>
                </div>

                <div className="relative z-10 mt-12 sm:mt-0">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <span className="block text-sm font-bold opacity-50 mb-1 uppercase tracking-wider">Progress</span>
                      <span className="font-display text-3xl font-bold">{activeCourse.progress || 0}%</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-bold opacity-50 mb-1 uppercase tracking-wider">Modules</span>
                      <span className="text-xl font-bold">{activeCourse.completed_lessons || 0} / {activeCourse.total_lessons || 0}</span>
                    </div>
                  </div>

                  <div className="w-full bg-border-hairline h-2 rounded-full overflow-hidden mb-8">
                    <div
                      className="bg-accent h-full rounded-full transition-all duration-1000"
                      style={{ width: `${activeCourse.progress || 0}%`, transitionTimingFunction: 'var(--ease-expo)' }}
                    />
                  </div>

                  {isFinePointer ? (
                    <Proximity magnetic={0.2} tilt={0.1} distance={50}>
                      {resumeCta}
                    </Proximity>
                  ) : resumeCta}
                </div>
              </motion.div>
            ) : (
              <div className="bento-card rounded-3xl p-8 sm:p-12 min-h-[400px] flex flex-col items-center justify-center text-center">
                <h3 className="font-display text-2xl font-bold mb-3">No Active Courses</h3>
                <p className="body-copy opacity-60">Your company admin hasn't assigned you any courses yet.</p>
              </div>
            )}
          </div>

          {/* Sidebar / Stacked Bento Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">

            {/* Upcoming Modules / Tasks */}
            <div className="bento-card rounded-3xl p-8 flex-1 flex flex-col">
              <h4 className="font-display text-xl font-bold mb-6 tracking-tight">Upcoming Modules</h4>
              <div className="flex-1 flex flex-col gap-4">
                {upcomingModules.length > 0 ? (
                  upcomingModules.map((module, idx) => (
                    <div 
                      key={module.id} 
                      onClick={() => navigate(`/dashboard/courses/${activeCourse?.course_id}`)}
                      className="group flex gap-4 items-start p-3 -mx-3 rounded-xl hover:bg-structural transition-colors duration-300 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-canvas border border-border-hairline flex items-center justify-center flex-shrink-0 group-hover:border-accent transition-colors duration-300">
                        <span className="text-sm font-bold opacity-50">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-sm tracking-tight mb-1 group-hover:text-accent transition-colors duration-300 truncate">{module.title}</h5>
                        <span className="text-xs font-medium opacity-50 uppercase tracking-wider">{module.type}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-typography opacity-50 text-sm font-medium">
                    No upcoming modules.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Chat / Recent Activity */}
            <div className="bento-card rounded-3xl p-8 flex-1 bg-typography text-canvas flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
               <div>
                 <h4 className="font-display text-xl font-bold mb-2 tracking-tight">Community</h4>
                 <p className="text-sm opacity-70 mb-6 line-clamp-2">Connect with peers or ask your instructor a question.</p>
               </div>
               <button className="w-full py-3 bg-canvas text-typography text-sm font-bold rounded-xl hover:bg-structural transition-colors duration-300">
                 Open Chat
               </button>
            </div>

          </div>
        </div>

        {/* Library Grid */}
        <div className="mt-20">
          <div className="flex items-end justify-between mb-8">
            <h3 className="font-display text-2xl font-bold tracking-tight">Your Library</h3>
          </div>
          {loading ? (
            <SkeletonGrid count={3} />
          ) : enrolments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolments.map(enrolment => (
                <CourseCard
                  key={enrolment.id || enrolment.course_id}
                  course={enrolment.course}
                  progress={enrolment.progress}
                  completedLessons={enrolment.completed_lessons}
                  totalLessons={enrolment.total_lessons}
                  onContinue={() => navigate(`/dashboard/courses/${enrolment.course_id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bento-card rounded-3xl p-8 text-center text-typography opacity-60">
              No courses found in your library.
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
