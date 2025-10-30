import { Resend } from 'resend'
import nodemailer from 'nodemailer'

const from = process.env.SMTP_FROM || 'WESR Triquest <no-reply@example.org>'
const resendKey = process.env.RESEND_API_KEY

let transporter: nodemailer.Transporter | null = null
if (!resendKey) {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT||587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  }
}

export async function sendMail(to: string, subject: string, html: string) {
  if (resendKey) {
    const resend = new Resend(resendKey)
    await resend.emails.send({ from, to, subject, html })
    return
  }
  if (!transporter) throw new Error('No email provider configured')
  await transporter.sendMail({ from, to, subject, html })
}
