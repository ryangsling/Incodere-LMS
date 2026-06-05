import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('resend', () => {
  const send = vi.fn().mockResolvedValue({ data: { id: 'email_123' }, error: null })
  return {
    Resend: vi.fn().mockImplementation(function () { return { emails: { send } } }),
    __sendMock: send,
  }
})

import { sendEmail, sendInviteEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../src/services/email.js'
import { Resend } from 'resend'

const getSendMock = () => Resend.mock.results[0].value.emails.send

describe('email service', () => {
  beforeEach(() => {
    getSendMock().mockClear()
  })

  it('sendEmail calls Resend with the expected fields', async () => {
    await sendEmail({ to: 'a@b.com', subject: 'Hi', html: '<p>x</p>' })

    expect(getSendMock()).toHaveBeenCalledTimes(1)
    const call = getSendMock().mock.calls[0][0]
    expect(call.to).toBe('a@b.com')
    expect(call.subject).toBe('Hi')
    expect(call.html).toBe('<p>x</p>')
    expect(call.from).toContain('ILMS')
  })

  it('sendInviteEmail renders the invite template', async () => {
    await sendInviteEmail({
      to: 'learner@example.com',
      firstName: 'Sam',
      inviteLink: 'https://app.test/accept-invite#access_token=abc',
      companyName: 'Acme',
    })

    const call = getSendMock().mock.calls[0][0]
    expect(call.to).toBe('learner@example.com')
    expect(call.subject).toContain('Acme')
    expect(call.subject).toContain('ILMS')
    expect(call.html).toContain('Sam')
    expect(call.html).toContain('https://app.test/accept-invite#access_token=abc')
  })

  it('sendPasswordResetEmail renders the reset template', async () => {
    await sendPasswordResetEmail({
      to: 'learner@example.com',
      firstName: 'Sam',
      resetLink: 'https://app.test/reset-password#access_token=xyz',
    })

    const call = getSendMock().mock.calls[0][0]
    expect(call.subject).toContain('Reset')
    expect(call.html).toContain('Sam')
    expect(call.html).toContain('https://app.test/reset-password#access_token=xyz')
  })

  it('sendWelcomeEmail renders the welcome template with login URL', async () => {
    await sendWelcomeEmail({
      to: 'admin@example.com',
      firstName: 'Alex',
      loginUrl: 'https://app.test/login',
    })

    const call = getSendMock().mock.calls[0][0]
    expect(call.subject).toContain('Welcome')
    expect(call.html).toContain('Alex')
    expect(call.html).toContain('https://app.test/login')
  })

  it('returns error if Resend reports one', async () => {
    getSendMock().mockResolvedValueOnce({ data: null, error: { message: 'rate limit' } })
    const result = await sendEmail({ to: 'a@b.com', subject: 'Hi', html: '<p>x</p>' })
    expect(result.error).toEqual({ message: 'rate limit' })
  })
})
