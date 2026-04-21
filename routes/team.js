const express = require('express');
const TeamMembers = require('../models/TeamMembers');
const TeamSettings = require('../models/TeamSettings');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

const isClientError = (message = '') =>
  /required|invalid|already exists|cannot delete|not allowed|assigned/i.test(message);

// GET /api/team - Get all team members
router.get('/', async (req, res) => {
  try {
    const {
      department,
      is_active = 'true',
      limit = 50,
      offset = 0,
      sortBy = 'sort_order',
      sortOrder = 'ASC'
    } = req.query;

    const options = {
      department,
      is_active: is_active === 'true',
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    };

    const team = await TeamMembers.findAll(options);
    const total = await TeamMembers.getCount(options);

    res.json({
      success: true,
      data: team,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching team members', 
      error: error.message 
    });
  }
});

// GET /api/team/department/:department - Get team members by department
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const team = await TeamMembers.findByDepartment(department, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await TeamMembers.getCount({ department, is_active: true });

    res.json({
      success: true,
      data: team,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching team by department:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching team by department', 
      error: error.message 
    });
  }
});

// GET /api/team/search - Search team members
router.get('/search', async (req, res) => {
  try {
    const { q, department, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const team = await TeamMembers.search(q, {
      department,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error searching team members:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching team members', 
      error: error.message 
    });
  }
});

/* ==================================================
   DYNAMIC DEPARTMENTS & ROLES API (NEW)
================================================== */

// --- DEPARTMENTS ---
// GET /api/team/departments
router.get('/departments', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM departments ORDER BY name ASC');
    res.json({ success: true, data: rows || [] });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/team/departments
router.post('/departments', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    
    const dbResult = await db.query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    const newId = dbResult.insertId;
    
    // Attempt to refetch safely
    let fetched = null;
    if (newId) {
       const { rows: newRow } = await db.query('SELECT * FROM departments WHERE id = ?', [newId]);
       fetched = newRow[0];
    }
    
    res.status(201).json({ success: true, data: fetched || { id: newId, name, description } });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// PUT /api/team/departments/:id
router.put('/departments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    
    await db.query(
      'UPDATE departments SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    const { rows: updated } = await db.query('SELECT * FROM departments WHERE id = ?', [id]);
    
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// DELETE /api/team/departments/:id
router.delete('/departments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// --- ROLES ---
// GET /api/team/roles
router.get('/roles', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM team_roles ORDER BY name ASC');
    res.json({ success: true, data: rows || [] });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/team/roles
router.post('/roles', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    
    const dbResult = await db.query(
      'INSERT INTO team_roles (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    const newId = dbResult.insertId;
    
    let fetched = null;
    if (newId) {
      const { rows: newRow } = await db.query('SELECT * FROM team_roles WHERE id = ?', [newId]);
      fetched = newRow[0];
    }
    
    res.status(201).json({ success: true, data: fetched || { id: newId, name, description } });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// PUT /api/team/roles/:id
router.put('/roles/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    
    await db.query(
      'UPDATE team_roles SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    const { rows: updated } = await db.query('SELECT * FROM team_roles WHERE id = ?', [id]);
    
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// DELETE /api/team/roles/:id
router.delete('/roles/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM team_roles WHERE id = ?', [id]);
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/team/settings - Get role and department settings
router.get('/settings', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const settings = await TeamSettings.getGroupedOptions({ includeInactive });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching team settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team settings',
      error: error.message
    });
  }
});

// GET /api/team/settings/:type - Get settings by type (role or department)
router.get('/settings/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const includeInactive = req.query.includeInactive === 'true';
    const options = await TeamSettings.getOptionsByType(type, { includeInactive });

    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error fetching team setting options:', error);
    const statusCode = isClientError(error.message) ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: 'Error fetching team setting options',
      error: error.message
    });
  }
});

// POST /api/team/settings - Create role/department setting (Admin only)
router.post('/settings', auth, async (req, res) => {
  try {
    const createdOption = await TeamSettings.createOption(req.body);

    res.status(201).json({
      success: true,
      data: createdOption,
      message: 'Team setting created successfully'
    });
  } catch (error) {
    console.error('Error creating team setting option:', error);
    const statusCode = isClientError(error.message) ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: 'Error creating team setting option',
      error: error.message
    });
  }
});

// PUT /api/team/settings/:id - Update role/department setting (Admin only)
router.put('/settings/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOption = await TeamSettings.updateOption(id, req.body);

    if (!updatedOption) {
      return res.status(404).json({
        success: false,
        message: 'Team setting option not found'
      });
    }

    res.json({
      success: true,
      data: updatedOption,
      message: 'Team setting updated successfully'
    });
  } catch (error) {
    console.error('Error updating team setting option:', error);
    const statusCode = isClientError(error.message) ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: 'Error updating team setting option',
      error: error.message
    });
  }
});

// DELETE /api/team/settings/:id - Delete role/department setting (Admin only)
router.delete('/settings/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOption = await TeamSettings.deleteOption(id);

    if (!deletedOption) {
      return res.status(404).json({
        success: false,
        message: 'Team setting option not found'
      });
    }

    res.json({
      success: true,
      data: deletedOption,
      message: 'Team setting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team setting option:', error);
    const statusCode = isClientError(error.message) ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: 'Error deleting team setting option',
      error: error.message
    });
  }
});

// GET /api/team/slug/:slug - Get team member by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const member = await TeamMembers.findBySlug(slug);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error fetching team member by slug:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching team member', 
      error: error.message 
    });
  }
});

// GET /api/team/:id - Get team member by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const member = await TeamMembers.findById(id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching team member', 
      error: error.message 
    });
  }
});

// POST /api/team - Create new team member (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const memberData = req.body;
    
    const member = await TeamMembers.create(memberData);

    res.status(201).json({
      success: true,
      data: member,
      message: 'Team member created successfully'
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating team member', 
      error: error.message 
    });
  }
});

// PUT /api/team/:id - Update team member (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const memberData = req.body;

    const existingMember = await TeamMembers.findById(id);
    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    const updatedMember = await TeamMembers.update(id, memberData);

    res.json({
      success: true,
      data: updatedMember,
      message: 'Team member updated successfully'
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating team member', 
      error: error.message 
    });
  }
});

// DELETE /api/team/:id - Delete team member (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMember = await TeamMembers.delete(id);
    
    if (!deletedMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      data: deletedMember,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting team member', 
      error: error.message 
    });
  }
});

module.exports = router;
