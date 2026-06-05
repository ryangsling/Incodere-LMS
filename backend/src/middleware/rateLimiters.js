import rateLimit from 'express-rate-limit'

// General bucket: all endpoints (applied at app level in index.js)
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please slow down' },
})

// Write bucket: any POST/PUT/PATCH/DELETE
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many write requests, please slow down' },
})

// Expensive bucket: certificate generation, report exports
export const expensiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Rate limit exceeded for this action' },
})

// Auth-public bucket: password reset endpoint (prevent abuse)
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many password-reset requests, please try again in 15 minutes' },
})
