const express = require('express');
const Events = require('../models/Events');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      featured,
      upcoming,
      limit = 20,
      offset = 0,
      sortBy = 'event_date',
      sortOrder = 'ASC'
    } = req.query;

    const options = {
      category,
      status,
      featured: featured ? featured === 'true' : undefined,
      upcoming: upcoming === 'true',
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    };

    const events = await Events.findAll(options);
    const total = await Events.getCount(options);

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching events', 
      error: error.message 
    });
  }
});

// GET /api/events/upcoming - Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const { category, limit = 10, offset = 0 } = req.query;

    const events = await Events.findUpcoming({
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching upcoming events', 
      error: error.message 
    });
  }
});

// GET /api/events/past - Get past events
router.get('/past', async (req, res) => {
  try {
    const { category, limit = 10, offset = 0 } = req.query;

    const events = await Events.findPast({
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching past events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching past events', 
      error: error.message 
    });
  }
});

// GET /api/events/featured - Get featured events
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const events = await Events.findAll({
      featured: true,
      limit: parseInt(limit),
      sortBy: 'event_date',
      sortOrder: 'ASC'
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured events', 
      error: error.message 
    });
  }
});

// GET /api/events/stats - Get event statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Events.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching event statistics', 
      error: error.message 
    });
  }
});

// GET /api/events/search - Search events
router.get('/search', async (req, res) => {
  try {
    const { q, category, status, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const events = await Events.search(q, {
      category,
      status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching events', 
      error: error.message 
    });
  }
});

// GET /api/events/date-range/:start/:end - Get events in date range
router.get('/date-range/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const events = await Events.findByDateRange(start, end, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching events by date range', 
      error: error.message 
    });
  }
});

// POST /api/events/:id/register - Register for an event
router.post('/:id/register', async (req, res) => {
  try {
    const { id } = req.params;

    let event = null;

    // Try to find by ID first if it's numeric
    if (!isNaN(id)) {
      event = await Events.findById(parseInt(id));
    }

    // If not found by ID or if it's a string, try by slug
    if (!event) {
      event = await Events.findBySlug(id);
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const updatedEvent = await Events.registerAttendee(event.id);

    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: 'Event is full or not found'
      });
    }

    res.json({
      success: true,
      data: updatedEvent,
      message: 'Successfully registered for event'
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error registering for event', 
      error: error.message 
    });
  }
});

// GET /api/events/:id - Get event by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let event = null;

    // Try to find by ID first if it's numeric
    if (!isNaN(id)) {
      event = await Events.findById(parseInt(id));
    }

    // If not found by ID or if it's a string, try by slug
    if (!event) {
      event = await Events.findBySlug(id);
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
});

// POST /api/events - Create new event (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const eventData = req.body;
    
    if (!eventData.slug) {
      eventData.slug = eventData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const event = await Events.create(eventData);

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Event with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error creating event', 
      error: error.message 
    });
  }
});

// PUT /api/events/:id - Update event (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    let existingEvent = null;

    // Try to find by ID first if it's numeric
    if (!isNaN(id)) {
      existingEvent = await Events.findById(parseInt(id));
    }

    // If not found by ID or if it's a string, try by slug
    if (!existingEvent) {
      existingEvent = await Events.findBySlug(id);
    }

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const updatedEvent = await Events.update(existingEvent.id, eventData);

    res.json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Event with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
});

// DELETE /api/events/:id - Delete event (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    let existingEvent = null;

    // Try to find by ID first if it's numeric
    if (!isNaN(id)) {
      existingEvent = await Events.findById(parseInt(id));
    }

    // If not found by ID or if it's a string, try by slug
    if (!existingEvent) {
      existingEvent = await Events.findBySlug(id);
    }

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const deletedEvent = await Events.delete(existingEvent.id);

    res.json({
      success: true,
      data: deletedEvent,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting event', 
      error: error.message 
    });
  }
});

module.exports = router;
