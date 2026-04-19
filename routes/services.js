const express = require('express');
const Services = require('../models/Services');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/services - Get all services
router.get('/', async (req, res) => {
  try {
    const {
      status,
      featured,
      limit = 50,
      offset = 0,
      sortBy = 'sort_order',
      sortOrder = 'ASC'
    } = req.query;

    const options = {
      status,
      featured: featured ? featured === 'true' : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    };

    const services = await Services.findAll(options);
    const total = await Services.getCount(options);

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching services', 
      error: error.message 
    });
  }
});

// GET /api/services/featured - Get featured services
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const services = await Services.findAll({
      featured: true,
      status: 'active',
      limit: parseInt(limit),
      sortBy: 'sort_order',
      sortOrder: 'ASC'
    });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching featured services:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured services', 
      error: error.message 
    });
  }
});

// GET /api/services/search - Search services
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const services = await Services.search(q, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching services', 
      error: error.message 
    });
  }
});

// GET /api/services/:id - Get service by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let service;
    
    // Check if id is numeric (ID) or string (slug)
    if (!isNaN(id)) {
      // It's a numeric ID
      service = await Services.findById(parseInt(id));
    } else {
      // It's a slug
      service = await Services.findBySlug(id);
    }
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching service', 
      error: error.message 
    });
  }
});

// POST /api/services - Create new service (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const serviceData = req.body;
    
    // Generate slug if not provided
    if (!serviceData.slug) {
      serviceData.slug = serviceData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const service = await Services.create(serviceData);

    res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully'
    });
  } catch (error) {
    console.error('Error creating service:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Service with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error creating service', 
      error: error.message 
    });
  }
});

// PUT /api/services/:id - Update service (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;

    const existingService = await Services.findById(id);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const updatedService = await Services.update(id, serviceData);

    res.json({
      success: true,
      data: updatedService,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Error updating service:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Service with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error updating service', 
      error: error.message 
    });
  }
});

// DELETE /api/services/:id - Delete service (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedService = await Services.delete(id);
    
    if (!deletedService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: deletedService,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting service', 
      error: error.message 
    });
  }
});

module.exports = router;
