import supabase from '../db/supabase.js'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function generateCertificate(req, res) {
  const userId = req.user.id
  const { course_id } = req.body

  const { data: enrolment } = await supabase
    .from('enrolments')
    .select('id, status')
    .eq('learner_id', userId)
    .eq('course_id', course_id)
    .single()

  if (!enrolment) return res.status(403).json({ success: false, error: 'Not enrolled in this course' })

  const { data: sections } = await supabase
    .from('sections')
    .select('id')
    .eq('course_id', course_id)

  const sectionIds = sections?.map(s => s.id) || []
  let totalLessons = 0
  let completedLessons = 0

  if (sectionIds.length > 0) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .in('section_id', sectionIds)

    const lessonIds = lessons?.map(l => l.id) || []
    totalLessons = lessonIds.length

    if (lessonIds.length > 0) {
      const { count } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('learner_id', userId)
        .eq('completed', true)
        .in('lesson_id', lessonIds)
      completedLessons = count || 0
    }
  }

  if (totalLessons === 0) return res.status(400).json({ success: false, error: 'Course has no lessons' })
  if (completedLessons < totalLessons) return res.status(400).json({ success: false, error: 'Course not yet completed' })

  const { data: existing } = await supabase
    .from('certificates')
    .select('id')
    .eq('learner_id', userId)
    .eq('course_id', course_id)
    .single()

  if (existing) return res.status(400).json({ success: false, error: 'Certificate already exists' })

  const { data: user } = await supabase
    .from('users')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .single()

  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('id', course_id)
    .single()

  const pdfBytes = await buildPdf(user.first_name, user.last_name, course.title)
  const fileName = `certificates/${userId}_${course_id}.pdf`

  const { error: uploadErr } = await supabase.storage
    .from('certificates')
    .upload(fileName, pdfBytes, { contentType: 'application/pdf', upsert: true })

  if (uploadErr) return res.status(500).json({ success: false, error: 'Failed to upload certificate' })

  const { error: dbErr } = await supabase
    .from('certificates')
    .insert({ learner_id: userId, course_id, file_path: fileName, issued_at: new Date().toISOString() })

  if (dbErr) return res.status(500).json({ success: false, error: dbErr.message })

  await supabase
    .from('enrolments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('learner_id', userId)
    .eq('course_id', course_id)

  const base64Pdf = Buffer.from(pdfBytes).toString('base64')

  const { error: emailErr } = await resend.emails.send({
    from: 'ILMS <onboarding@resend.dev>',
    to: user.email,
    subject: `Certificate of Completion - ${course.title}`,
    html: `<p>Congratulations ${user.first_name},</p><p>You have completed <strong>${course.title}</strong>.</p><p>Your certificate is attached.</p>`,
    attachments: [{ filename: `${course.title.replace(/\s+/g, '_')}_Certificate.pdf`, content: base64Pdf }],
  })

  if (emailErr) console.error('Failed to send certificate email:', emailErr)

  res.status(201).json({ success: true, data: { message: 'Certificate generated' } })
}

async function buildPdf(firstName, lastName, courseTitle) {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const page = pdfDoc.addPage([595, 420])
  const { width, height } = page.getSize()

  const teal = rgb(1 / 255, 105 / 255, 111 / 255)
  const navy = rgb(3 / 255, 33 / 255, 71 / 255)
  const gray = rgb(136 / 255, 136 / 255, 136 / 255)
  const white = rgb(1, 1, 1)

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(247 / 255, 246 / 255, 242 / 255) })
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: navy })
  page.drawRectangle({ x: 0, y: 0, width, height: 60, color: teal })

  page.drawText('Certificate of Completion', { x: 50, y: height - 50, size: 22, font: fontBold, color: white })

  const nameText = `${firstName} ${lastName}`
  const nameWidth = fontBold.widthOfTextAtSize(nameText, 28)
  page.drawText(nameText, { x: (width - nameWidth) / 2, y: 230, size: 28, font: fontBold, color: navy })

  const completedText = 'has successfully completed the course'
  const compWidth = font.widthOfTextAtSize(completedText, 12)
  page.drawText(completedText, { x: (width - compWidth) / 2, y: 200, size: 12, font, color: gray })

  const courseWidth = fontBold.widthOfTextAtSize(courseTitle, 18)
  page.drawText(courseTitle, { x: (width - courseWidth) / 2, y: 165, size: 18, font: fontBold, color: teal })

  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const dateWidth = font.widthOfTextAtSize(dateStr, 10)
  page.drawText(dateStr, { x: (width - dateWidth) / 2, y: 130, size: 10, font, color: gray })

  const issuedWidth = font.widthOfTextAtSize('Issued by Incodere', 9)
  page.drawText('Issued by Incodere', { x: (width - issuedWidth) / 2, y: 30, size: 9, font, color: white })

  return pdfDoc.save()
}

export async function listMyCertificates(req, res) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*, course:courses(title)')
    .eq('learner_id', req.user.id)
    .order('issued_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })

  const result = await Promise.all(data.map(async (cert) => {
    const { data: { signedURL } } = await supabase.storage
      .from('certificates')
      .createSignedUrl(cert.file_path, 3600)

    return { ...cert, download_url: signedURL }
  }))

  res.json({ success: true, data: result })
}

export async function listCertificates(req, res) {
  let query = supabase
    .from('certificates')
    .select('*, learner:users(first_name, last_name, email), course:courses(title)')
    .order('issued_at', { ascending: false })

  if (req.user.role === 'company_admin') {
    const { data: orgLearners } = await supabase
      .from('users')
      .select('id')
      .eq('organisation_id', req.user.organisation_id)
    const ids = orgLearners.map(l => l.id)
    query = query.in('learner_id', ids)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ success: false, error: error.message })

  const result = await Promise.all(data.map(async (cert) => {
    const { data: { signedURL } } = await supabase.storage
      .from('certificates')
      .createSignedUrl(cert.file_path, 3600)

    return { ...cert, download_url: signedURL }
  }))

  res.json({ success: true, data: result })
}
