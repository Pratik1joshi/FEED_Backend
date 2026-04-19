const express = require('express')
const SiteSettings = require('../models/SiteSettings')
const auth = require('../middleware/auth')

const router = express.Router()

const PRIVATE_SETTINGS_FIELDS = new Set([
  'mail_from_name',
  'mail_from_email',
  'smtp_host',
  'smtp_port',
  'smtp_secure',
  'smtp_user',
  'smtp_password',
  'contact_form_recipient_email',
  'newsletter_recipient_email',
])

const sanitizePublicSettings = (settings = {}) => {
  const safeSettings = { ...settings }
  PRIVATE_SETTINGS_FIELDS.forEach((field) => {
    delete safeSettings[field]
  })
  return safeSettings
}

router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings()
    res.json({
      success: true,
      data: sanitizePublicSettings(settings),
    })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching site settings',
      error: error.message,
    })
  }
})

router.get('/admin', auth, async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings()
    res.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error('Error fetching admin site settings:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching admin site settings',
      error: error.message,
    })
  }
})

router.put('/', auth, async (req, res) => {
  try {
    const settings = await SiteSettings.updateSettings(req.body)
    res.json({
      success: true,
      data: settings,
      message: 'Site settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating site settings:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating site settings',
      error: error.message,
    })
  }
})

module.exports = router
