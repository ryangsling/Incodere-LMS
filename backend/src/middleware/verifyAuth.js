import supabase from '../db/supabase.js'

export const verifyAuth = async (req, res, next) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid authorization header' })
  }

  const token = header.split(' ')[1]

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, error: 'User not found or deactivated' })
  }

  req.user = user
  next()
}
