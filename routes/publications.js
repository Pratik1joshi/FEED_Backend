const express = require('express');
const Publications = require('../models/Publications');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/publications - Get all publications
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category,
      featured,
      is_public = 'true',
      limit = 20,
      offset = 0,
      sortBy = 'publication_date',
      sortOrder = 'DESC'
    } = req.query;

    const options = {
      type,
      category,
      featured: featured ? featured === 'true' : undefined,
      is_public: is_public === 'true',
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    };

    const publications = await Publications.findAll(options);
    const total = await Publications.getCount(options);

    res.json({
      success: true,
      data: publications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching publications', 
      error: error.message 
    });
  }
});

// GET /api/publications/featured - Get featured publications
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const publications = await Publications.findAll({
      featured: true,
      is_public: true,
      limit: parseInt(limit),
      sortBy: 'publication_date',
      sortOrder: 'DESC'
    });

    res.json({
      success: true,
      data: publications
    });
  } catch (error) {
    console.error('Error fetching featured publications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured publications', 
      error: error.message 
    });
  }
});

// GET /api/publications/popular - Get popular publications
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const publications = await Publications.getPopular(parseInt(limit));

    res.json({
      success: true,
      data: publications
    });
  } catch (error) {
    console.error('Error fetching popular publications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching popular publications', 
      error: error.message 
    });
  }
});

// GET /api/publications/recent - Get recent publications
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const publications = await Publications.getRecent(parseInt(limit));

    res.json({
      success: true,
      data: publications
    });
  } catch (error) {
    console.error('Error fetching recent publications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recent publications', 
      error: error.message 
    });
  }
});

// GET /api/publications/stats - Get publication statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Publications.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching publication stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching publication statistics', 
      error: error.message 
    });
  }
});

// GET /api/publications/search - Search publications
router.get('/search', async (req, res) => {
  try {
    const { q, type, category, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const publications = await Publications.search(q, {
      type,
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: publications
    });
  } catch (error) {
    console.error('Error searching publications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching publications', 
      error: error.message 
    });
  }
});

// GET /api/publications/type/:type - Get publications by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const publications = await Publications.findByType(type, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Publications.getCount({ type, is_public: true });

    res.json({
      success: true,
      data: publications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching publications by type:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching publications by type', 
      error: error.message 
    });
  }
});

// GET /api/publications/category/:category - Get publications by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const publications = await Publications.findByCategory(category, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Publications.getCount({ category, is_public: true });

    res.json({
      success: true,
      data: publications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching publications by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching publications by category', 
      error: error.message 
    });
  }
});

// GET /api/publications/author/:author - Get publications by author
router.get('/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const publications = await Publications.findByAuthor(author, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: publications
    });
  } catch (error) {
    console.error('Error fetching publications by author:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching publications by author', 
      error: error.message 
    });
  }
});

// POST /api/publications/:id/download - Track publication download
router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const publication = await Publications.incrementDownload(id);
    
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    res.json({
      success: true,
      data: publication,
      message: 'Download tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error tracking download', 
      error: error.message 
    });
  }
});

// GET /api/publications/:id - Get publication by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let publication = await Publications.findById(id);
    if (!publication) {
      publication = await Publications.findBySlug(id);
    }
    
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    // Check if publication is public or user is admin
    if (!publication.is_public && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: publication
    });
  } catch (error) {
    console.error('Error fetching publication:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching publication', 
      error: error.message 
    });
  }
});

// POST /api/publications - Create new publication (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const publicationData = req.body;
    
    if (!publicationData.slug) {
      publicationData.slug = publicationData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const publication = await Publications.create(publicationData);

    res.status(201).json({
      success: true,
      data: publication,
      message: 'Publication created successfully'
    });
  } catch (error) {
    console.error('Error creating publication:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Publication with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error creating publication', 
      error: error.message 
    });
  }
});

// PUT /api/publications/:id - Update publication (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const publicationData = req.body;

    const existingPublication = await Publications.findById(id);
    if (!existingPublication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    const updatedPublication = await Publications.update(id, publicationData);

    res.json({
      success: true,
      data: updatedPublication,
      message: 'Publication updated successfully'
    });
  } catch (error) {
    console.error('Error updating publication:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Publication with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error updating publication', 
      error: error.message 
    });
  }
});

// DELETE /api/publications/:id - Delete publication (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPublication = await Publications.delete(id);
    
    if (!deletedPublication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    res.json({
      success: true,
      data: deletedPublication,
      message: 'Publication deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting publication:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting publication', 
      error: error.message 
    });
  }
});

module.exports = router;
