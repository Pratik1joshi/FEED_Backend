const express = require('express');
const Press = require('../models/Press');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/press - Get all press releases
router.get('/', async (req, res) => {
  try {
    const {
      category,
      featured,
      is_published = 'true',
      limit = 50,
      offset = 0,
      sortBy = 'publish_date',
      sortOrder = 'DESC'
    } = req.query;

    const options = {
      category,
      featured: featured ? featured === 'true' : undefined,
      is_published: is_published === 'true',
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    };

    const press = await Press.findAll(options);
    const total = await Press.getCount(options);

    res.json({
      success: true,
      data: press,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching press releases:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching press releases', 
      error: error.message 
    });
  }
});

// GET /api/press/featured - Get featured press releases
router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const press = await Press.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: press
    });
  } catch (error) {
    console.error('Error fetching featured press releases:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured press releases', 
      error: error.message 
    });
  }
});

// GET /api/press/recent - Get recent press releases
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const press = await Press.findRecent(parseInt(limit));

    res.json({
      success: true,
      data: press
    });
  } catch (error) {
    console.error('Error fetching recent press releases:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recent press releases', 
      error: error.message 
    });
  }
});

// GET /api/press/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Press.getCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching press categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching press categories', 
      error: error.message 
    });
  }
});

// GET /api/press/category/:category - Get press releases by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const press = await Press.findByCategory(category, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Press.getCount({ category, is_published: true });

    res.json({
      success: true,
      data: press,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching press releases by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching press releases by category', 
      error: error.message 
    });
  }
});

// GET /api/press/search - Search press releases
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const press = await Press.search(q, {
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: press
    });
  } catch (error) {
    console.error('Error searching press releases:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching press releases', 
      error: error.message 
    });
  }
});

// GET /api/press/:id - Get press release by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let press = await Press.findById(id);
    if (!press) {
      press = await Press.findBySlug(id);
    }
    
    if (!press) {
      return res.status(404).json({
        success: false,
        message: 'Press release not found'
      });
    }

    // Check if press release is published or user is admin
    if (!press.is_published && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: press
    });
  } catch (error) {
    console.error('Error fetching press release:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching press release', 
      error: error.message 
    });
  }
});

// POST /api/press - Create new press release (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const pressData = req.body;
    
    if (!pressData.slug) {
      pressData.slug = pressData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const press = await Press.create(pressData);

    res.status(201).json({
      success: true,
      data: press,
      message: 'Press release created successfully'
    });
  } catch (error) {
    console.error('Error creating press release:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Press release with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error creating press release', 
      error: error.message 
    });
  }
});

// PUT /api/press/:id - Update press release (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const pressData = req.body;

    const existingPress = await Press.findById(id);
    if (!existingPress) {
      return res.status(404).json({
        success: false,
        message: 'Press release not found'
      });
    }

    const updatedPress = await Press.update(id, pressData);

    res.json({
      success: true,
      data: updatedPress,
      message: 'Press release updated successfully'
    });
  } catch (error) {
    console.error('Error updating press release:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Press release with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error updating press release', 
      error: error.message 
    });
  }
});

// DELETE /api/press/:id - Delete press release (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPress = await Press.delete(id);
    
    if (!deletedPress) {
      return res.status(404).json({
        success: false,
        message: 'Press release not found'
      });
    }

    res.json({
      success: true,
      data: deletedPress,
      message: 'Press release deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting press release:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting press release', 
      error: error.message 
    });
  }
});

module.exports = router;
