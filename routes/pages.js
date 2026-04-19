const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const auth = require('../middleware/auth');

// Get all pages
router.get('/', async (req, res) => {
  try {
    const pages = await Page.findAll();
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single page by slug
router.get('/:slug', async (req, res) => {
  try {
    const page = await Page.findBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update page
router.put('/:slug', auth, async (req, res) => {
  try {
    const page = await Page.update(req.params.slug, req.body);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
