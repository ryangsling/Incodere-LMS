import supabase from '../db/supabase.js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function listOrganisations(req, res) {
  const { data, error } = await supabase
    .from('organisations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function createOrganisation(req, res) {
  const { name, contact_email } = req.body
  const { data, error } = await supabase
    .from('organisations')
    .insert({ name, contact_email })
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.status(201).json({ success: true, data })
}

export async function createCompanyAdmin(req, res) {
  const { email, first_name, last_name, organisation_id } = req.body
  const password = generatePassword()

  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr) return res.status(400).json({ success: false, error: authErr.message })

  const { data: user, error: dbErr } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      email,
      role: 'company_admin',
      organisation_id,
      first_name,
      last_name,
    })
    .select()
    .single()

  if (dbErr) return res.status(400).json({ success: false, error: dbErr.message })

  const { error: emailErr } = await resend.emails.send({
    from: 'ILMS <onboarding@resend.dev>',
    to: email,
    subject: 'Welcome to ILMS - Your Admin Account',
    html: `<p>Hi ${first_name},</p><p>Your ILMS admin account has been created.</p><p>Sign in at <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">ILMS</a> with:</p><p>Email: ${email}<br/>Password: ${password}</p>`,
  })

  if (emailErr) console.error('Failed to send welcome email:', emailErr)

  res.status(201).json({ success: true, data: user })
}

export async function listUsersByOrganisation(req, res) {
  const orgId = req.user.role === 'super_admin'
    ? req.params.orgId
    : req.user.organisation_id

  const query = supabase
    .from('users')
    .select('*')
    .eq('organisation_id', orgId)
    .order('created_at', { ascending: false })

  if (req.user.role === 'company_admin') {
    const { data: org } = await supabase
      .from('organisations')
      .select('id')
      .eq('id', req.user.organisation_id)
      .single()
    if (!org) return res.status(403).json({ success: false, error: 'Forbidden' })
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function createLearner(req, res) {
  const { email, first_name, last_name } = req.body
  const organisation_id = req.user.organisation_id
  const password = generatePassword()

  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr) return res.status(400).json({ success: false, error: authErr.message })

  const { data: user, error: dbErr } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      email,
      role: 'learner',
      organisation_id,
      first_name,
      last_name,
    })
    .select()
    .single()

  if (dbErr) return res.status(400).json({ success: false, error: dbErr.message })

  const { error: emailErr } = await resend.emails.send({
    from: 'ILMS <onboarding@resend.dev>',
    to: email,
    subject: 'Welcome to ILMS - Your Account',
    html: `<p>Hi ${first_name},</p><p>Your ILMS learner account has been created by your organisation.</p><p>Sign in at <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">ILMS</a> with:</p><p>Email: ${email}<br/>Password: ${password}</p>`,
  })

  if (emailErr) console.error('Failed to send welcome email:', emailErr)

  res.status(201).json({ success: true, data: user })
}

export async function deactivateUser(req, res) {
  const userId = req.params.id

  if (req.user.role === 'company_admin') {
    const { data: target } = await supabase
      .from('users')
      .select('organisation_id')
      .eq('id', userId)
      .single()

    if (!target || target.organisation_id !== req.user.organisation_id) {
      return res.status(403).json({ success: false, error: 'Forbidden' })
    }
  }

  const { data, error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', userId)
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pw = ''
  for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length))
  return pw + '!'
}
