const express = require('express');
const { body, validationResult } = require('express-validator');
const Timeline = require('../models/Timeline');
const auth = require('../middleware/auth');
const router = express.Router();

// Validation rules
const timelineValidation = [
  body('year').notEmpty().withMessage('Year is required'),
  body('title').notEmpty().isLength({ max: 200 }).withMessage('Title is required and must be under 200 characters'),
  body('description').notEmpty().isLength({ max: 1000 }).withMessage('Description is required and must be under 1000 characters'),
  body('icon').isIn(['Flag', 'Award', 'Heart', 'FileText', 'Building', 'Globe', 'Users', 'Target', 'MapPin', 'TrendingUp', 'Star', 'Lightbulb', 'Zap', 'Leaf', 'BookOpen']).withMessage('Invalid icon'),
  body('category').isIn(['Milestone', 'Funding', 'Partnership', 'Policy', 'Infrastructure', 'Achievement', 'Research', 'Community', 'Technology', 'Award', 'Expansion', 'Innovation']).withMessage('Invalid category'),
  body('featured').optional().isBoolean().withMessage('Featured must be boolean')
];

// GET /api/timeline - Get all timeline items (public)
router.get('/', async (req, res) => {
  try {
    const { 
      featured, 
      category, 
      year, 
      page = 1, 
      limit = 50,
      sort = 'year'
    } = req.query;

    // Build filters
    const filters = {};
    
    if (featured !== undefined) {
      filters.featured = featured === 'true';
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (year) {
      filters.year = year;
    }

    // Pagination options
    const options = {
      sort,
      limit: parseInt(limit),
      offset: (page - 1) * parseInt(limit)
    };

    // Execute queries
    const [items, total] = await Promise.all([
      Timeline.find(filters, options),
      Timeline.count(filters)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        featured: featured,
        category: category,
        year: year
      }
    });
  } catch (error) {
    console.error('Timeline fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timeline items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/timeline/featured - Get featured items (public)
router.get('/featured', async (req, res) => {
  try {
    const items = await Timeline.getFeaturedItems();
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    console.error('Featured timeline fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured timeline items'
    });
  }
});

// GET /api/timeline/:id - Get single timeline item (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await Timeline.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Timeline item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Timeline item fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timeline item'
    });
  }
});

// POST /api/timeline - Create new timeline item (admin only)
router.post('/', auth, timelineValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const timeline = await Timeline.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Timeline item created successfully',
      data: timeline
    });
  } catch (error) {
    console.error('Timeline creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create timeline item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/timeline/:id - Update timeline item (admin only)
router.put('/:id', auth, timelineValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const timeline = await Timeline.updateById(req.params.id, req.body);
    
    if (!timeline) {
      return res.status(404).json({
        success: false,
        message: 'Timeline item not found'
      });
    }

    res.json({
      success: true,
      message: 'Timeline item updated successfully',
      data: timeline
    });
  } catch (error) {
    console.error('Timeline update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update timeline item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/timeline/:id - Delete timeline item (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const timeline = await Timeline.deleteById(req.params.id);
    
    if (!timeline) {
      return res.status(404).json({
        success: false,
        message: 'Timeline item not found'
      });
    }

    res.json({
      success: true,
      message: 'Timeline item deleted successfully'
    });
  } catch (error) {
    console.error('Timeline deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete timeline item'
    });
  }
});

// GET /api/timeline/categories/list - Get all categories (public)
router.get('/meta/categories', (req, res) => {
  const categories = [
    'Milestone', 'Funding', 'Partnership', 'Policy', 'Infrastructure',
    'Achievement', 'Research', 'Community', 'Technology', 'Award',
    'Expansion', 'Innovation'
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

// GET /api/timeline/meta/icons - Get all available icons (public)
router.get('/meta/icons', (req, res) => {
  const icons = [
    { name: "Flag", label: "Flag" },
    { name: "Award", label: "Award" },
    { name: "Heart", label: "Heart" },
    { name: "FileText", label: "Document" },
    { name: "Building", label: "Building" },
    { name: "Globe", label: "Globe" },
    { name: "Users", label: "Users" },
    { name: "Target", label: "Target" },
    { name: "MapPin", label: "Location" },
    { name: "TrendingUp", label: "Growth" },
    { name: "Star", label: "Star" },
    { name: "Lightbulb", label: "Innovation" },
    { name: "Zap", label: "Energy" },
    { name: "Leaf", label: "Environment" },
    { name: "BookOpen", label: "Education" }
  ];

  res.json({
    success: true,
    data: icons
  });
});

module.exports = router;
