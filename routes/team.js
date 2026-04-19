const express = require('express');
const TeamMembers = require('../models/TeamMembers');
const auth = require('../middleware/auth');

const router = express.Router();

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
