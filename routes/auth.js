const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');
const { sendMailToAdmin } = require('../utils/mailer');
const router = express.Router();

const getJwtSecret = () => process.env.JWT_SECRET;
const getFrontendUrl = () => `${process.env.FRONTEND_URL || 'http://localhost:3000'}`.replace(/\/+$/, '');
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const buildResetUrl = (token) => `${getFrontendUrl()}/admin/reset-password?token=${encodeURIComponent(token)}`;

const escapeHtml = (value = '') => {
  return `${value || ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const isSuperAdmin = (req) => req.adminRole === 'super_admin';

const ensureSuperAdmin = (req, res) => {
  if (!isSuperAdmin(req)) {
    res.status(403).json({
      success: false,
      message: 'Super admin access is required for this action',
    });
    return false;
  }

  return true;
};

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const createAdminValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'super_admin'])
    .withMessage('Role must be admin or super_admin'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('token').isLength({ min: 16 }).withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

// POST /api/auth/login - Admin login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find admin by email (including password for comparison)
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await Admin.comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await Admin.updateLastLogin(admin.id);

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Server authentication configuration is incomplete',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id,
        email: admin.email,
        role: admin.role
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...adminData } = admin;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: adminData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/forgot-password - Send password reset link to admin email
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;
    const admin = await Admin.findByEmail(email);

    if (admin) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      const resetUrl = buildResetUrl(rawToken);

      await Admin.createPasswordResetToken(admin.id, tokenHash, expiresAt);

      await sendMailToAdmin({
        to: admin.email,
        subject: 'Reset your FEED admin password',
        text: [
          'You requested a password reset for your FEED admin account.',
          `Reset link: ${resetUrl}`,
          'This link will expire in 30 minutes.',
          'If you did not request this, you can safely ignore this email.',
        ].join('\n'),
        html: `
          <h2>Reset your FEED admin password</h2>
          <p>You requested a password reset for your FEED admin account.</p>
          <p>
            <a href="${escapeHtml(resetUrl)}" target="_blank" rel="noopener noreferrer">
              Click here to reset your password
            </a>
          </p>
          <p>This link expires in <strong>30 minutes</strong>.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `,
      });
    }

    res.json({
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'MAIL_CONFIG_ERROR'
        ? error.message
        : 'Unable to process password reset request at the moment',
    });
  }
});

// POST /api/auth/reset-password - Reset password using emailed token
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { token, newPassword } = req.body;
    const tokenHash = hashResetToken(token);
    const tokenRow = await Admin.consumePasswordResetToken(tokenHash);

    if (!tokenRow) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired',
      });
    }

    const admin = await Admin.findByIdWithPassword(tokenRow.admin_id);
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired',
      });
    }

    await Admin.updatePassword(admin.id, newPassword);
    await Admin.invalidatePasswordResetTokens(admin.id);

    res.json({
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
});

// GET /api/auth/profile - Get admin profile (protected)
router.get('/profile', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// POST /api/auth/verify-token - Verify JWT token (protected)
router.post('/verify-token', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      adminId: req.adminId,
      email: req.adminEmail,
      role: req.adminRole
    }
  });
});

// GET /api/auth/admins - List active admins (super admin only)
router.get('/admins', auth, async (req, res) => {
  if (!ensureSuperAdmin(req, res)) {
    return;
  }

  try {
    const admins = await Admin.findAll();
    res.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error('Admin list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users',
    });
  }
});

// POST /api/auth/admins - Create admin user (super admin only)
router.post('/admins', auth, createAdminValidation, async (req, res) => {
  if (!ensureSuperAdmin(req, res)) {
    return;
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, email, password, role = 'admin' } = req.body;

    const exists = await Admin.emailExists(email);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'An admin with this email already exists',
      });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role,
      is_active: true,
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: admin,
    });
  } catch (error) {
    console.error('Admin create error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
    });
  }
});

// DELETE /api/auth/admins/:id - Deactivate admin (super admin only)
router.delete('/admins/:id', auth, async (req, res) => {
  if (!ensureSuperAdmin(req, res)) {
    return;
  }

  try {
    const adminId = parseInt(req.params.id, 10);
    if (!Number.isFinite(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin id',
      });
    }

    if (adminId === req.adminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    const targetAdmin = await Admin.findById(adminId);
    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found',
      });
    }

    if (targetAdmin.role === 'super_admin') {
      const admins = await Admin.findAll();
      const superAdmins = admins.filter((admin) => admin.role === 'super_admin');
      if (superAdmins.length <= 1) {
        return res.status(400).json({
          success: false,
          message: 'At least one active super admin is required',
        });
      }
    }

    await Admin.deactivate(adminId);

    res.json({
      success: true,
      message: 'Admin user deactivated successfully',
    });
  } catch (error) {
    console.error('Admin deactivate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate admin user',
    });
  }
});

// POST /api/auth/logout - Logout (just client-side token removal)
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// PUT /api/auth/change-password - Change password (protected)
router.put('/change-password', auth, [
  body('currentPassword').isLength({ min: 8 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from the current password',
      });
    }

    const admin = await Admin.findByIdWithPassword(req.adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await Admin.comparePassword(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await Admin.updatePassword(req.adminId, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

module.exports = router;
