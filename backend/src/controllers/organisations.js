import supabase from '../db/supabase.js'
import { sendWelcomeEmail, sendInviteEmail } from '../services/email.js'
import { buildAuthLink } from '../utils/authLinks.js'
import { parsePagination } from '../utils/listQuery.js'

export async function listOrganisations(req, res) {
  const { q } = req.query
  const { page, pageSize } = parsePagination(req.query)

  let query = supabase
    .from('organisations')
    .select('*', { count: 'exact' })
  if (q) query = query.or(`name.ilike.%${q}%,contact_email.ilike.%${q}%`)

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({
    success: true,
    data: { rows: data || [], total: data ? data.length : 0, page, pageSize },
  })
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

  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
  const { error: emailErr } = await sendWelcomeEmail({
    to: email,
    firstName: first_name,
    loginUrl,
  })
  if (emailErr) console.error('Failed to send welcome email:', emailErr)

  res.status(201).json({ success: true, data: user })
}

export async function listUsersByOrganisation(req, res) {
  const orgId = req.user.role === 'super_admin'
    ? req.params.orgId
    : req.user.organisation_id
  const { q, role } = req.query
  const { page, pageSize } = parsePagination(req.query)

  if (req.user.role === 'company_admin') {
    const { data: org } = await supabase
      .from('organisations')
      .select('id')
      .eq('id', req.user.organisation_id)
      .single()
    if (!org) return res.status(403).json({ success: false, error: 'Forbidden' })
  }

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .eq('organisation_id', orgId)
  if (role) query = query.eq('role', role)
  if (q) query = query.or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({
    success: true,
    data: { rows: data || [], total: data ? data.length : 0, page, pageSize },
  })
}

export async function createLearner(req, res) {
  const { email, first_name, last_name } = req.body
  const organisation_id = req.user.organisation_id

  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: false,
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

  const { data: orgData, error: orgErr } = await supabase
    .from('organisations')
    .select('name')
    .eq('id', organisation_id)
    .single()
  const orgName = (!orgErr && orgData?.name) ? orgData.name : 'your company'

  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email,
  })
  if (linkErr || !linkData?.properties?.action_link) {
    console.error('createLearner: generateLink failed', linkErr)
    return res.status(500).json({ success: false, error: 'Failed to generate invite link' })
  }

  const inviteLink = buildAuthLink({ actionLink: linkData.properties.action_link, redirectTo: '/accept-invite' })
  const { error: emailErr } = await sendInviteEmail({
    to: email,
    firstName: first_name,
    inviteLink,
    companyName: orgName,
  })
  if (emailErr) console.error('Failed to send invite email:', emailErr)

  res.status(201).json({ success: true, data: user })
}

async function assertSameOrg(req, userId) {
  if (req.user.role !== 'company_admin') return null
  const { data: target } = await supabase
    .from('users')
    .select('organisation_id')
    .eq('id', userId)
    .single()
  if (!target || target.organisation_id !== req.user.organisation_id) {
    return res.status(403).json({ success: false, error: 'Forbidden' })
  }
  return null
}

export async function deactivateUser(req, res) {
  const userId = req.params.id
  const denial = await assertSameOrg(req, userId)
  if (denial) return denial

  const { data, error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', userId)
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function activateUser(req, res) {
  const userId = req.params.id
  const denial = await assertSameOrg(req, userId)
  if (denial) return denial

  const { data, error } = await supabase
    .from('users')
    .update({ is_active: true })
    .eq('id', userId)
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function deleteUser(req, res) {
  const userId = req.params.id
  const denial = await assertSameOrg(req, userId)
  if (denial) return denial

  if (userId === req.user.id) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own account' })
  }

  const { error: authErr } = await supabase.auth.admin.deleteUser(userId)
  if (authErr) console.error('deleteUser: auth.admin.deleteUser failed', authErr)

  const { error: dbErr } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
  if (dbErr) return res.status(400).json({ success: false, error: dbErr.message })

  res.json({ success: true })
}

export async function resendInvite(req, res) {
  const userId = req.params.id
  const denial = await assertSameOrg(req, userId)
  if (denial) return denial

  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('email, first_name')
    .eq('id', userId)
    .single()
  if (userErr || !user) return res.status(404).json({ success: false, error: 'User not found' })

  const { data: org } = await supabase
    .from('organisations')
    .select('name')
    .eq('id', req.user.organisation_id)
    .single()
  const orgName = org?.name || 'your company'

  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email: user.email,
  })
  if (linkErr || !linkData?.properties?.action_link) {
    console.error('resendInvite: generateLink failed', linkErr)
    return res.status(500).json({ success: false, error: 'Failed to generate invite link' })
  }

  const inviteLink = buildAuthLink({ actionLink: linkData.properties.action_link, redirectTo: '/accept-invite' })
  const { error: emailErr } = await sendInviteEmail({
    to: user.email,
    firstName: user.first_name || 'there',
    inviteLink,
    companyName: orgName,
  })
  if (emailErr) console.error('resendInvite: email send failed', emailErr)

  res.json({ success: true })
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pw = ''
  for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length))
  return pw + '!'
}
