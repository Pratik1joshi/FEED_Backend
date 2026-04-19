const express = require('express');
const News = require('../models/News');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/news - Get all news/blog posts
router.get('/', async (req, res) => {
  try {
    const {
      category,
      featured,
      is_published = 'true',
      limit = 20,
      offset = 0,
      sortBy = 'publication_date',
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

    const news = await News.findAll(options);
    const total = await News.getCount(options);

    res.json({
      success: true,
      data: news,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching news', 
      error: error.message 
    });
  }
});

// GET /api/news/featured - Get featured news
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const news = await News.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching featured news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured news', 
      error: error.message 
    });
  }
});

// GET /api/news/recent - Get recent news
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const news = await News.findRecent(parseInt(limit));

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching recent news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recent news', 
      error: error.message 
    });
  }
});

// GET /api/news/popular - Get popular news
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const news = await News.findPopular(parseInt(limit));

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching popular news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching popular news', 
      error: error.message 
    });
  }
});

// GET /api/news/search - Search news
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const news = await News.search(q, {
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching news', 
      error: error.message 
    });
  }
});

// GET /api/news/category/:category - Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const news = await News.findByCategory(category, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await News.getCount({ category, is_published: true });

    res.json({
      success: true,
      data: news,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching news by category', 
      error: error.message 
    });
  }
});

// GET /api/news/:id - Get news by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let article = await News.findById(id);
    if (!article) {
      article = await News.findBySlug(id);
    }
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if article is published or user is admin
    if (!article.is_published && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching article', 
      error: error.message 
    });
  }
});

// POST /api/news - Create new article (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const articleData = req.body;
    
    if (!articleData.slug) {
      articleData.slug = articleData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const article = await News.create(articleData);

    res.status(201).json({
      success: true,
      data: article,
      message: 'Article created successfully'
    });
  } catch (error) {
    console.error('Error creating article:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Article with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error creating article', 
      error: error.message 
    });
  }
});

// PUT /api/news/:id - Update article (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const articleData = req.body;

    const existingArticle = await News.findById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const updatedArticle = await News.update(id, articleData);

    res.json({
      success: true,
      data: updatedArticle,
      message: 'Article updated successfully'
    });
  } catch (error) {
    console.error('Error updating article:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Article with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error updating article', 
      error: error.message 
    });
  }
});

// DELETE /api/news/:id - Delete article (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedArticle = await News.delete(id);
    
    if (!deletedArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: deletedArticle,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting article', 
      error: error.message 
    });
  }
});

module.exports = router;
