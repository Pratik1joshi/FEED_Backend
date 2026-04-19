const nodemailer = require('nodemailer')
const SiteSettings = require('../models/SiteSettings')

const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value
  }

  const normalized = `${value || ''}`.trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

const parsePort = (value, fallback = 587) => {
  const parsed = parseInt(`${value || ''}`, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const resolveMailConfig = (settings) => {
  return {
    host: `${settings.smtp_host || process.env.SMTP_HOST || ''}`.trim(),
    port: parsePort(settings.smtp_port || process.env.SMTP_PORT, 587),
    secure: parseBoolean(settings.smtp_secure ?? process.env.SMTP_SECURE),
    user: `${settings.smtp_user || process.env.SMTP_USER || ''}`.trim(),
    pass: `${settings.smtp_password || process.env.SMTP_PASS || ''}`.trim(),
    fromName: `${settings.mail_from_name || process.env.MAIL_FROM_NAME || 'FEED Website'}`.trim(),
    fromEmail: `${settings.mail_from_email || process.env.MAIL_FROM_EMAIL || ''}`.trim(),
  }
}

const createConfigError = (message) => {
  const error = new Error(message)
  error.code = 'MAIL_CONFIG_ERROR'
  return error
}

const assertMailConfig = (config) => {
  if (!config.host || !config.user || !config.pass || !config.fromEmail) {
    throw createConfigError(
      'Mail service is not fully configured. Please set SMTP host, user, password, and sender email in Admin Settings.'
    )
  }
}

const createFromHeader = (fromName, fromEmail) => {
  if (!fromName) {
    return fromEmail
  }

  return `${fromName} <${fromEmail}>`
}

const sendMailToAdmin = async ({ to, subject, text, html, replyTo }) => {
  const settings = await SiteSettings.getSettings()
  const config = resolveMailConfig(settings)

  assertMailConfig(config)

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  const info = await transporter.sendMail({
    from: createFromHeader(config.fromName, config.fromEmail),
    to,
    subject,
    text,
    html,
    replyTo,
  })

  return {
    messageId: info.messageId,
    accepted: info.accepted,
  }
}

module.exports = {
  sendMailToAdmin,
  createConfigError,
}
