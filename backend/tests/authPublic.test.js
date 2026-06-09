import { describe, it, expect, vi, beforeEach } from 'vitest'

const { generateLink, getUser, updateUserById, fromSelect, fromUpdate, sendPasswordResetEmail } = vi.hoisted(() => ({
  generateLink: vi.fn(),
  getUser: vi.fn(),
  updateUserById: vi.fn(),
  fromSelect: vi.fn(),
  fromUpdate: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}))

vi.mock('../src/db/supabase.js', () => ({
  default: {
    auth: {
      admin: { generateLink, updateUserById },
      getUser,
    },
    from: () => ({
      select: fromSelect,
      update: fromUpdate,
    }),
  },
}))

vi.mock('../src/services/email.js', () => ({
  sendPasswordResetEmail,
  sendInviteEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  sendEmail: vi.fn(),
}))

import {
  forgotPassword,
  resetPassword,
  acceptInvite,
  acceptInviteInfo,
} from '../src/controllers/authPublic.js'

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('forgotPassword', () => {
  it('always returns success even when the email does not exist', async () => {
    generateLink.mockRejectedValue(new Error('User not found'))
    const req = { body: { email: 'nobody@example.com' } }
    const res = mockRes()
    await forgotPassword(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('sends a reset email when the user exists', async () => {
    generateLink.mockResolvedValue({
      data: { properties: { action_link: 'https://abc.supabase.co/auth/v1/verify?token=x&type=recovery#access_token=AT&refresh_token=RT' } },
      error: null,
    })
    sendPasswordResetEmail.mockResolvedValue({ data: { id: 'e1' }, error: null })
    const req = { body: { email: 'user@example.com' } }
    const res = mockRes()
    await forgotPassword(req, res)
    expect(generateLink).toHaveBeenCalledWith({
      type: 'recovery',
      email: 'user@example.com',
      options: { redirectTo: expect.stringContaining('/reset-password') },
    })
    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1)
    const sent = sendPasswordResetEmail.mock.calls[0][0]
    expect(sent.to).toBe('user@example.com')
    expect(res.status).toHaveBeenCalledWith(200)
  })
})

describe('resetPassword', () => {
  it('rejects when password is shorter than 8 characters', async () => {
    const req = { body: { access_token: 'AT', refresh_token: 'RT', password: 'short' } }
    const res = mockRes()
    await resetPassword(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json.mock.calls[0][0].error).toMatch(/at least 8/i)
    expect(getUser).not.toHaveBeenCalled()
  })

  it('updates the user password when tokens are valid', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    updateUserById.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    const req = { body: { access_token: 'AT', refresh_token: 'RT', password: 'longenough123' } }
    const res = mockRes()
    await resetPassword(req, res)
    expect(getUser).toHaveBeenCalledWith('AT')
    expect(updateUserById).toHaveBeenCalledWith('u1', { password: 'longenough123' })
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('returns 401 when getUser fails', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { message: 'bad token' } })
    const req = { body: { access_token: 'AT', refresh_token: 'RT', password: 'longenough123' } }
    const res = mockRes()
    await resetPassword(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })
})

describe('acceptInviteInfo', () => {
  it('returns user email and name from auth metadata + public.users', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } }, error: null })
    fromSelect.mockReturnValue({
      eq: () => ({
        single: () => Promise.resolve({ data: { first_name: 'Sam', last_name: 'Jones', is_active: true }, error: null }),
      }),
    })
    const req = { body: { access_token: 'AT', refresh_token: 'RT' } }
    const res = mockRes()
    await acceptInviteInfo(req, res)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { email: 'a@b.com', first_name: 'Sam', last_name: 'Jones', is_active: true },
    })
  })

  it('returns 401 when token is invalid', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { message: 'bad' } })
    const req = { body: { access_token: 'AT', refresh_token: 'RT' } }
    const res = mockRes()
    await acceptInviteInfo(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })
})

describe('acceptInvite', () => {
  it('rejects when required fields are missing', async () => {
    const req = { body: { access_token: 'AT', refresh_token: 'RT' } }
    const res = mockRes()
    await acceptInvite(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('sets password and updates public.users row when input is valid', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    updateUserById.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    fromUpdate.mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    })
    const req = {
      body: {
        access_token: 'AT',
        refresh_token: 'RT',
        password: 'newpassword123',
        first_name: 'Sam',
        last_name: 'Jones',
      },
    }
    const res = mockRes()
    await acceptInvite(req, res)
    expect(getUser).toHaveBeenCalledWith('AT')
    expect(updateUserById).toHaveBeenCalledWith('u1', {
      password: 'newpassword123',
      email_confirm: true,
      user_metadata: { first_name: 'Sam', last_name: 'Jones' },
    })
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })
})
