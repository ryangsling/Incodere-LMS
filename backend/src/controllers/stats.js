import supabase from '../db/supabase.js'

export async function getPlatformStats(req, res) {
  const { count: orgCount } = await supabase
    .from('organisations')
    .select('*', { count: 'exact', head: true })

  const { count: learnerCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'learner')
    .eq('is_active', true)

  const { count: certCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })

  const { data: courses } = await supabase
    .from('courses')
    .select('id, status')

  const totalCourses = courses?.length || 0
  const publishedCourses = courses?.filter(c => c.status === 'published').length || 0

  res.json({
    success: true,
    data: {
      total_organisations: orgCount || 0,
      total_learners: learnerCount || 0,
      total_certificates: certCount || 0,
      total_courses,
      published_courses: publishedCourses,
    },
  })
}
