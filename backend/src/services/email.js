import { Resend } from 'resend'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'emails')

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf8')
}

const LAYOUT = readTemplate('_layout.html')
const TEMPLATES = {
  invite: readTemplate('invite.html'),
  'password-reset': readTemplate('password-reset.html'),
  welcome: readTemplate('welcome.html'),
}

const FROM_NAME = process.env.RESEND_FROM_NAME || 'ILMS'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`

const resend = new Resend(process.env.RESEND_API_KEY)

function render(layout, body) {
  return layout
    .replace('{{TITLE}}', '')
    .replace('{{CONTENT}}', body)
}

function replaceVars(html, vars) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v ?? ''), html)
}

export async function sendEmail({ to, subject, html }) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: render(LAYOUT, html),
  })
  return { data, error }
}

export async function sendInviteEmail({ to, firstName, inviteLink, companyName }) {
  const subject = `You're invited to join ${companyName} on ILMS`
  const body = replaceVars(TEMPLATES.invite, { firstName, inviteLink, companyName })
  return sendEmail({ to, subject, html: body })
}

export async function sendPasswordResetEmail({ to, firstName, resetLink }) {
  const subject = 'Reset your ILMS password'
  const body = replaceVars(TEMPLATES['password-reset'], { firstName, resetLink })
  return sendEmail({ to, subject, html: body })
}

export async function sendWelcomeEmail({ to, firstName, loginUrl }) {
  const subject = 'Welcome to ILMS'
  const body = replaceVars(TEMPLATES.welcome, { firstName, loginUrl })
  return sendEmail({ to, subject, html: body })
}
