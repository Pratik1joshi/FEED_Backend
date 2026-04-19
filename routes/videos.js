const express = require('express');
const Videos = require('../models/Videos');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/videos - Get all videos
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

    const videos = await Videos.findAll(options);
    const total = await Videos.getCount(options);

    res.json({
      success: true,
      data: videos,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching videos', 
      error: error.message 
    });
  }
});

// GET /api/videos/featured - Get featured videos
router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const videos = await Videos.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured videos', 
      error: error.message 
    });
  }
});

// GET /api/videos/popular - Get popular videos
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const videos = await Videos.findPopular(parseInt(limit));

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching popular videos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching popular videos', 
      error: error.message 
    });
  }
});

// GET /api/videos/recent - Get recent videos
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const videos = await Videos.findRecent(parseInt(limit));

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching recent videos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recent videos', 
      error: error.message 
    });
  }
});

// GET /api/videos/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Videos.getCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching video categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching video categories', 
      error: error.message 
    });
  }
});

// GET /api/videos/category/:category - Get videos by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const videos = await Videos.findByCategory(category, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Videos.getCount({ category, is_published: true });

    res.json({
      success: true,
      data: videos,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching videos by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching videos by category', 
      error: error.message 
    });
  }
});

// GET /api/videos/search - Search videos
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const videos = await Videos.search(q, {
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching videos', 
      error: error.message 
    });
  }
});

// GET /api/videos/:id - Get video by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let video = await Videos.findById(id);
    if (!video) {
      video = await Videos.findBySlug(id);
    }
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if video is published or user is admin
    if (!video.is_published && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching video', 
      error: error.message 
    });
  }
});

// POST /api/videos/:id/view - Increment video views
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Videos.incrementViews(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: { views: video.views },
      message: 'View count updated'
    });
  } catch (error) {
    console.error('Error updating video views:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating video views', 
      error: error.message 
    });
  }
});

// POST /api/videos - Create new video (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const videoData = req.body;
    
    if (!videoData.slug) {
      videoData.slug = videoData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const video = await Videos.create(videoData);

    res.status(201).json({
      success: true,
      data: video,
      message: 'Video created successfully'
    });
  } catch (error) {
    console.error('Error creating video:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Video with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error creating video', 
      error: error.message 
    });
  }
});

// PUT /api/videos/:id - Update video (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const videoData = req.body;

    const existingVideo = await Videos.findById(id);
    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const updatedVideo = await Videos.update(id, videoData);

    res.json({
      success: true,
      data: updatedVideo,
      message: 'Video updated successfully'
    });
  } catch (error) {
    console.error('Error updating video:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Video with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error updating video', 
      error: error.message 
    });
  }
});

// DELETE /api/videos/:id - Delete video (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVideo = await Videos.delete(id);
    
    if (!deletedVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: deletedVideo,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting video', 
      error: error.message 
    });
  }
});

module.exports = router;
