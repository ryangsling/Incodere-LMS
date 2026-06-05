import { validationResult } from 'express-validator'

export function handleValidation(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg).join(', ')
    return res.status(400).json({ success: false, error: messages })
  }
  next()
}
