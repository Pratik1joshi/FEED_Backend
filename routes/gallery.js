const express = require('express');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/gallery - Get all gallery items
router.get('/', async (req, res) => {
  try {
    const {
      category,
      featured,
      photographer,
      limit = 50,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const options = {
      category,
      featured: featured ? featured === 'true' : undefined,
      photographer,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    };

    const gallery = await Gallery.findAll(options);
    const total = await Gallery.getCount(options);

    res.json({
      success: true,
      data: gallery,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching gallery', 
      error: error.message 
    });
  }
});

// GET /api/gallery/featured - Get featured gallery items
router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const gallery = await Gallery.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Error fetching featured gallery:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured gallery', 
      error: error.message 
    });
  }
});

// GET /api/gallery/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Gallery.getCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching gallery categories', 
      error: error.message 
    });
  }
});

// GET /api/gallery/category/:category - Get gallery items by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const gallery = await Gallery.findByCategory(category, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Gallery.getCount({ category });

    res.json({
      success: true,
      data: gallery,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching gallery by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching gallery by category', 
      error: error.message 
    });
  }
});

// GET /api/gallery/search - Search gallery
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const gallery = await Gallery.search(q, {
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Error searching gallery:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching gallery', 
      error: error.message 
    });
  }
});

// GET /api/gallery/:id - Get gallery item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Gallery.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching gallery item', 
      error: error.message 
    });
  }
});

// POST /api/gallery - Create new gallery item (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const galleryData = req.body;
    
    const item = await Gallery.create(galleryData);

    res.status(201).json({
      success: true,
      data: item,
      message: 'Gallery item created successfully'
    });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating gallery item', 
      error: error.message 
    });
  }
});

// PUT /api/gallery/:id - Update gallery item (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const galleryData = req.body;

    const existingItem = await Gallery.findById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const updatedItem = await Gallery.update(id, galleryData);

    res.json({
      success: true,
      data: updatedItem,
      message: 'Gallery item updated successfully'
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating gallery item', 
      error: error.message 
    });
  }
});

// DELETE /api/gallery/:id - Delete gallery item (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await Gallery.delete(id);
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.json({
      success: true,
      data: deletedItem,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting gallery item', 
      error: error.message 
    });
  }
});

module.exports = router;
