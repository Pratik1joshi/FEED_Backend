const express = require('express');
const Awards = require('../models/Awards');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/awards - Get all awards
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      featured,
      year,
      limit = 50,
      offset = 0,
      sortBy = 'sort_order',
      sortOrder = 'ASC'
    } = req.query;

    const options = {
      category,
      status,
      featured: featured ? featured === 'true' : undefined,
      year,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    };

    const awards = await Awards.findAll(options);
    const total = await Awards.getCount(options);

    res.json({
      success: true,
      data: awards,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching awards:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching awards', 
      error: error.message 
    });
  }
});

// GET /api/awards/featured - Get featured awards
router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const awards = await Awards.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: awards
    });
  } catch (error) {
    console.error('Error fetching featured awards:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured awards', 
      error: error.message 
    });
  }
});

// GET /api/awards/category/:category - Get awards by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const awards = await Awards.findByCategory(category, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Awards.getCount({ category });

    res.json({
      success: true,
      data: awards,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching awards by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching awards by category', 
      error: error.message 
    });
  }
});

// GET /api/awards/search - Search awards
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const awards = await Awards.search(q, {
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: awards
    });
  } catch (error) {
    console.error('Error searching awards:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching awards', 
      error: error.message 
    });
  }
});

// GET /api/awards/:id - Get award by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const award = await Awards.findById(id);
    
    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      data: award
    });
  } catch (error) {
    console.error('Error fetching award:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching award', 
      error: error.message 
    });
  }
});

// POST /api/awards - Create new award (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const awardData = req.body;
    
    const award = await Awards.create(awardData);

    res.status(201).json({
      success: true,
      data: award,
      message: 'Award created successfully'
    });
  } catch (error) {
    console.error('Error creating award:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating award', 
      error: error.message 
    });
  }
});

// PUT /api/awards/:id - Update award (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const awardData = req.body;

    const existingAward = await Awards.findById(id);
    if (!existingAward) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    const updatedAward = await Awards.update(id, awardData);

    res.json({
      success: true,
      data: updatedAward,
      message: 'Award updated successfully'
    });
  } catch (error) {
    console.error('Error updating award:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating award', 
      error: error.message 
    });
  }
});

// DELETE /api/awards/:id - Delete award (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAward = await Awards.delete(id);
    
    if (!deletedAward) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      data: deletedAward,
      message: 'Award deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting award:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting award', 
      error: error.message 
    });
  }
});

module.exports = router;
