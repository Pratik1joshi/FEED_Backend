const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const auth = require('../middleware/auth');

let ensureBlogTablePromise = null;

const ensureBlogTableExists = async () => {
  if (!ensureBlogTablePromise) {
    ensureBlogTablePromise = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          slug VARCHAR(500) UNIQUE NOT NULL,
          excerpt TEXT,
          content TEXT NOT NULL,
          image VARCHAR(1000),
          publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          author_name VARCHAR(200),
          author_title VARCHAR(200),
          author_avatar VARCHAR(1000),
          category VARCHAR(100),
          tags TEXT,
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
          featured BOOLEAN DEFAULT false,
          read_time VARCHAR(20),
          views INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
        CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
        CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
        CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date ON blog_posts(publish_date);
        CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
      `);
    })().catch((error) => {
      ensureBlogTablePromise = null;
      throw error;
    });
  }

  return ensureBlogTablePromise;
};

router.use(async (req, res, next) => {
  try {
    await ensureBlogTableExists();
    next();
  } catch (error) {
    console.error('Error ensuring blog table exists:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing blog storage',
      error: error.message
    });
  }
});

const parseTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const serializeTags = (tags) => {
  const normalizedTags = parseTags(tags);
  return normalizedTags.length > 0 ? normalizedTags.join(',') : null;
};

const formatBlogPost = (row) => ({
  ...row,
  tags: parseTags(row.tags),
  publishDate: row.publish_date,
  readTime: row.read_time,
  author: {
    name: row.author_name || '',
    title: row.author_title || '',
    avatar: row.author_avatar || ''
  }
});

const buildSlug = (title) => title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/(^-|-$)/g, '');

const clearOtherFeaturedPosts = async (client, currentId = null) => {
  if (currentId) {
    await client.query('UPDATE blog_posts SET featured = false WHERE featured = true AND id <> $1', [currentId]);
    return;
  }

  await client.query('UPDATE blog_posts SET featured = false WHERE featured = true');
};

// GET /api/blog - Get all blog posts
router.get('/', async (req, res) => {
  try {
    const { status, category, featured, limit, offset } = req.query;

    let sql = `
      SELECT
        id,
        title,
        slug,
        excerpt,
        content,
        image,
        publish_date,
        author_name,
        author_title,
        author_avatar,
        category,
        tags,
        status,
        featured,
        read_time,
        views,
        created_at,
        updated_at
      FROM blog_posts
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'all') {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (category && category !== 'all') {
      sql += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (featured && featured !== 'all') {
      sql += ` AND featured = $${params.length + 1}`;
      params.push(featured === 'true');
    }

    sql += ' ORDER BY featured DESC, publish_date DESC, created_at DESC';

    if (limit) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limit, 10));
    }

    if (offset) {
      sql += ` OFFSET $${params.length + 1}`;
      params.push(parseInt(offset, 10));
    }

    const result = await query(sql, params);
    const blogPosts = result.rows.map(formatBlogPost);

    res.json({
      success: true,
      data: blogPosts,
      count: blogPosts.length
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog posts',
      error: error.message
    });
  }
});

// GET /api/blog/slug/:slug - Get a blog post by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await query(
      `SELECT
        id,
        title,
        slug,
        excerpt,
        content,
        image,
        publish_date,
        author_name,
        author_title,
        author_avatar,
        category,
        tags,
        status,
        featured,
        read_time,
        views,
        created_at,
        updated_at
      FROM blog_posts
      WHERE slug = $1
      LIMIT 1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: formatBlogPost(result.rows[0])
    });
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post',
      error: error.message
    });
  }
});

// GET /api/blog/:id - Get a specific blog post
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        id,
        title,
        slug,
        excerpt,
        content,
        image,
        publish_date,
        author_name,
        author_title,
        author_avatar,
        category,
        tags,
        status,
        featured,
        read_time,
        views,
        created_at,
        updated_at
      FROM blog_posts
      WHERE id = $1
      LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: formatBlogPost(result.rows[0])
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post',
      error: error.message
    });
  }
});

// POST /api/blog - Create a new blog post
router.post('/', auth, async (req, res) => {
  const client = await getClient();

  try {
    const {
      title,
      slug,
      excerpt,
      content,
      image,
      publish_date,
      author,
      category,
      tags,
      status = 'draft',
      featured = false,
      read_time
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const finalSlug = slug || buildSlug(title);
    await client.query('BEGIN');

    if (featured) {
      await clearOtherFeaturedPosts(client);
    }

    const result = await client.query(
      `INSERT INTO blog_posts (
        title, slug, excerpt, content, image, publish_date,
        author_name, author_title, author_avatar,
        category, tags, status, featured, read_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        title,
        finalSlug,
        excerpt || '',
        content,
        image || '',
        publish_date || new Date(),
        author?.name || '',
        author?.title || '',
        author?.avatar || '',
        category || '',
        serializeTags(tags),
        status,
        Boolean(featured),
        read_time || ''
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: formatBlogPost(result.rows[0])
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blog post',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// PUT /api/blog/:id - Update a blog post
router.put('/:id', auth, async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      image,
      publish_date,
      author,
      category,
      tags,
      status,
      featured,
      read_time
    } = req.body;

    await client.query('BEGIN');

    if (featured) {
      await clearOtherFeaturedPosts(client, id);
    }

    const result = await client.query(
      `UPDATE blog_posts SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        excerpt = COALESCE($3, excerpt),
        content = COALESCE($4, content),
        image = COALESCE($5, image),
        publish_date = COALESCE($6, publish_date),
        author_name = COALESCE($7, author_name),
        author_title = COALESCE($8, author_title),
        author_avatar = COALESCE($9, author_avatar),
        category = COALESCE($10, category),
        tags = COALESCE($11, tags),
        status = COALESCE($12, status),
        featured = COALESCE($13, featured),
        read_time = COALESCE($14, read_time),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *`,
      [
        title || null,
        slug || null,
        excerpt || null,
        content || null,
        image || null,
        publish_date || null,
        author?.name || null,
        author?.title || null,
        author?.avatar || null,
        category || null,
        serializeTags(tags),
        status || null,
        typeof featured === 'boolean' ? featured : null,
        read_time || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: formatBlogPost(result.rows[0])
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog post',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// DELETE /api/blog/:id - Delete a blog post
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog post',
      error: error.message
    });
  }
});

// POST /api/blog/:id/toggle-featured - Toggle featured status
router.post('/:id/toggle-featured', auth, async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const currentResult = await client.query(
      'SELECT featured FROM blog_posts WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (currentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const nextFeatured = !currentResult.rows[0].featured;

    if (nextFeatured) {
      await clearOtherFeaturedPosts(client, id);
    }

    const result = await client.query(
      `UPDATE blog_posts
       SET featured = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING featured`,
      [id, nextFeatured]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Featured status updated successfully',
      featured: result.rows[0].featured
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating featured status',
      error: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
