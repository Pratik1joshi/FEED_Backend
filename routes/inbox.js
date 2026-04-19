const express = require('express')
const rateLimit = require('express-rate-limit')
const SiteSettings = require('../models/SiteSettings')
const { sendMailToAdmin } = require('../utils/mailer')

const router = express.Router()

const inboxLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: {
    success: false,
    message: 'Too many form submissions. Please wait and try again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const clean = (value) => `${value || ''}`.trim()

const escapeHtml = (value = '') => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const resolveRecipientEmail = (settings, recipientField) => {
  return clean(settings[recipientField] || settings.email_primary || process.env.ADMIN_EMAIL)
}

router.post('/contact', inboxLimiter, async (req, res) => {
  try {
    const name = clean(req.body.name)
    const email = clean(req.body.email)
    const subject = clean(req.body.subject)
    const message = clean(req.body.message)

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required.',
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    if (name.length > 120 || subject.length > 180 || message.length > 4000 || email.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'One or more fields exceed allowed length.',
      })
    }

    const settings = await SiteSettings.getSettings()
    const recipient = resolveRecipientEmail(settings, 'contact_form_recipient_email')

    if (!recipient) {
      return res.status(500).json({
        success: false,
        message: 'Contact recipient email is not configured in Admin Settings.',
      })
    }

    const sentAt = new Date().toISOString()

    await sendMailToAdmin({
      to: recipient,
      subject: `[Contact Form] ${subject}`,
      replyTo: email,
      text: [
        'New contact form submission',
        `Time: ${sentAt}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message,
      ].join('\n'),
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Time:</strong> ${escapeHtml(sentAt)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
      `,
    })

    return res.json({
      success: true,
      message: 'Thanks for reaching out. We received your message and will get back to you shortly.',
    })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return res.status(500).json({
      success: false,
      message:
        error.code === 'MAIL_CONFIG_ERROR'
          ? error.message
          : 'We could not send your message right now. Please try again in a few minutes.',
    })
  }
})

router.post('/newsletter', inboxLimiter, async (req, res) => {
  try {
    const email = clean(req.body.email)

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    if (email.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Email address is too long.',
      })
    }

    const settings = await SiteSettings.getSettings()
    const recipient = resolveRecipientEmail(settings, 'newsletter_recipient_email')

    if (!recipient) {
      return res.status(500).json({
        success: false,
        message: 'Newsletter recipient email is not configured in Admin Settings.',
      })
    }

    const sentAt = new Date().toISOString()

    await sendMailToAdmin({
      to: recipient,
      subject: `[Newsletter Subscription] ${email}`,
      replyTo: email,
      text: [
        'New newsletter subscription',
        `Time: ${sentAt}`,
        `Email: ${email}`,
      ].join('\n'),
      html: `
        <h2>New newsletter subscription</h2>
        <p><strong>Time:</strong> ${escapeHtml(sentAt)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      `,
    })

    return res.json({
      success: true,
      message: 'Thanks for subscribing. You are now on the newsletter list.',
    })
  } catch (error) {
    console.error('Error processing newsletter subscription:', error)
    return res.status(500).json({
      success: false,
      message:
        error.code === 'MAIL_CONFIG_ERROR'
          ? error.message
          : 'We could not complete your subscription right now. Please try again shortly.',
    })
  }
})

module.exports = router
