import supabase from '../db/supabase.js'
import { sendPasswordResetEmail, sendInviteEmail } from '../services/email.js'

const PASSWORD_MIN = 8
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export async function forgotPassword(req, res) {
  const { email } = req.body
  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${FRONTEND_URL}/reset-password` },
    })
    if (error || !data?.properties?.action_link) {
      return res.status(200).json({ success: true })
    }
    const resetLink = data.properties.action_link
    const { error: emailErr } = await sendPasswordResetEmail({ to: email, firstName: 'there', resetLink })
    if (emailErr) console.error('forgotPassword: email send failed', emailErr)
  } catch (err) {
    console.error('forgotPassword: generateLink failed', err.message)
  }
  return res.status(200).json({ success: true })
}

export async function resetPassword(req, res) {
  const { access_token, password } = req.body

  if (!password || password.length < PASSWORD_MIN) {
    return res.status(400).json({ success: false, error: `Password must be at least ${PASSWORD_MIN} characters` })
  }

  const { data, error } = await supabase.auth.getUser(access_token)
  if (error || !data?.user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired link' })
  }

  const { error: updateErr } = await supabase.auth.admin.updateUserById(data.user.id, { password })
  if (updateErr) {
    return res.status(400).json({ success: false, error: updateErr.message })
  }

  return res.json({ success: true })
}

export async function acceptInviteInfo(req, res) {
  const { access_token } = req.body

  const { data, error } = await supabase.auth.getUser(access_token)
  if (error || !data?.user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired link' })
  }
  const user = data.user

  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('first_name,last_name,is_active')
    .eq('id', user.id)
    .single()
  if (profileErr) {
    return res.status(500).json({ success: false, error: 'Failed to load profile' })
  }

  return res.json({
    success: true,
    data: {
      email: user.email,
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      is_active: profile?.is_active ?? false,
    },
  })
}

export async function acceptInvite(req, res) {
  const { access_token, password, first_name, last_name } = req.body

  if (!password || password.length < PASSWORD_MIN) {
    return res.status(400).json({ success: false, error: `Password must be at least ${PASSWORD_MIN} characters` })
  }
  if (!first_name || !last_name) {
    return res.status(400).json({ success: false, error: 'First and last name are required' })
  }

  const { data, error } = await supabase.auth.getUser(access_token)
  if (error || !data?.user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired link' })
  }
  const userId = data.user.id

  const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name },
  })
  if (updateErr) {
    return res.status(400).json({ success: false, error: updateErr.message })
  }

  const { error: dbErr } = await supabase
    .from('users')
    .update({ first_name, last_name, is_active: true })
    .eq('id', userId)
  if (dbErr) {
    return res.status(400).json({ success: false, error: dbErr.message })
  }

  return res.json({ success: true })
}
