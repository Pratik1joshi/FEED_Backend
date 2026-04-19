const express = require('express');
const Projects = require('../models/Projects');
const auth = require('../middleware/auth');

const router = express.Router();

// Transform database fields to frontend format
const transformProject = (project) => {
  if (!project) return null;
  
  const transformed = { ...project };
  
  // Convert snake_case to camelCase for frontend
  if (project.hasOwnProperty('full_description')) {
    transformed.fullDescription = project.full_description;
    delete transformed.full_description;
  }
  
  if (project.hasOwnProperty('start_date')) {
    transformed.startDate = project.start_date;
    delete transformed.start_date;
  }
  
  if (project.hasOwnProperty('completion_date')) {
    transformed.completionDate = project.completion_date;
    delete transformed.completion_date;
  }
  
  if (project.hasOwnProperty('team_size')) {
    transformed.teamSize = project.team_size;
    delete transformed.team_size;
  }
  
  if (project.hasOwnProperty('client')) {
    transformed.clientPartners = project.client;
    delete transformed.client;
  }
  
  if (project.hasOwnProperty('impact')) {
    transformed.impactMetrics = project.impact;
    
    // Extract partnerships and references from impact if they exist
    if (typeof project.impact === 'object' && project.impact !== null) {
      if (project.impact.partnerships) {
        transformed.partnerships = project.impact.partnerships;
      }
      if (project.impact.references) {
        transformed.references = project.impact.references;
      }
    }
    
    delete transformed.impact;
  }
  
  if (project.hasOwnProperty('outcomes')) {
    transformed.keyMetrics = project.outcomes;
    delete transformed.outcomes;
  }
  
  // Handle coordinates - PostgreSQL POINT format is (longitude, latitude)
  if (project.coordinates) {
    if (typeof project.coordinates === 'string') {
      // Parse PostgreSQL POINT format: (lng, lat)
      const match = project.coordinates.match(/\(([^,]+),\s*([^)]+)\)/);
      if (match) {
        transformed.coordinates = {
          lat: parseFloat(match[2]), // latitude
          lng: parseFloat(match[1])  // longitude
        };
      }
    } else if (typeof project.coordinates === 'object' && project.coordinates.x !== undefined && project.coordinates.y !== undefined) {
      // Handle x/y format if it exists
      transformed.coordinates = {
        lat: parseFloat(project.coordinates.y),
        lng: parseFloat(project.coordinates.x)
      };
    }
  }
  
  // Initialize frontend-only fields with defaults
  transformed.goals = transformed.objectives || [];
  transformed.timeline = [];
  transformed.relatedProjects = [];
  transformed.partners = [];
  transformed.partnerships = transformed.partnerships || [];
  transformed.references = transformed.references || [];
  transformed.innovations = [];
  transformed.sustainability = '';
  transformed.environmentalImpact = '';
  transformed.socialImpact = '';
  
  return transformed;
};

// Transform array of projects
const transformProjects = (projects) => {
  return projects.map(transformProject);
};

// Validate required fields
const validateProjectData = (data) => {
  const errors = [];
  const requiredFields = {
    title: 'Project Title',
    description: 'Description',
    category: 'Category',
    status: 'Status'
  };

  // Check required fields
  for (const [field, label] of Object.entries(requiredFields)) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${label} is required`);
    }
  }

  // Validate dates if provided
  const dateFields = ['startDate', 'completionDate', 'start_date', 'completion_date'];
  dateFields.forEach(field => {
    if (data[field] && data[field] !== '') {
      const date = new Date(data[field]);
      if (isNaN(date.getTime())) {
        errors.push(`${field} must be a valid date`);
      }
    }
  });

  return errors;
};

// Transform frontend fields to database format
const transformToDatabase = (data) => {
  const transformed = { ...data };
  
  // Convert camelCase to snake_case for database
  if (data.hasOwnProperty('fullDescription')) {
    transformed.full_description = data.fullDescription;
    delete transformed.fullDescription;
  }
  
  if (data.hasOwnProperty('startDate')) {
    transformed.start_date = data.startDate && data.startDate.trim() !== '' ? data.startDate : null;
    delete transformed.startDate;
  }
  
  if (data.hasOwnProperty('completionDate')) {
    transformed.completion_date = data.completionDate && data.completionDate.trim() !== '' ? data.completionDate : null;
    delete transformed.completionDate;
  }
  
  if (data.hasOwnProperty('teamSize')) {
    transformed.team_size = data.teamSize;
    delete transformed.teamSize;
  }
  
  if (data.hasOwnProperty('clientPartners')) {
    transformed.client = data.clientPartners;
    delete transformed.clientPartners;
  }
  
  if (data.hasOwnProperty('impactMetrics')) {
    transformed.impact = data.impactMetrics;
    delete transformed.impactMetrics;
  }
  
  // Handle partnerships and references by storing them in the impact field
  if (data.hasOwnProperty('partnerships') || data.hasOwnProperty('references')) {
    if (!transformed.impact) {
      transformed.impact = {};
    }
    if (typeof transformed.impact === 'string') {
      try {
        transformed.impact = JSON.parse(transformed.impact);
      } catch (e) {
        transformed.impact = {};
      }
    }
    
    if (data.hasOwnProperty('partnerships')) {
      transformed.impact.partnerships = data.partnerships;
      delete transformed.partnerships;
    }
    
    if (data.hasOwnProperty('references')) {
      transformed.impact.references = data.references;
      delete transformed.references;
    }
  }

  // Handle coordinates for PostgreSQL point type (lng, lat)
  if (transformed.hasOwnProperty('coordinates')) {
    let coords = transformed.coordinates;
    if (typeof coords === 'string') {
      try {
        coords = JSON.parse(coords);
      } catch (e) {
        // Not a JSON string
      }
    }
    
    if (coords && typeof coords === 'object') {
      const lat = parseFloat(coords.lat);
      const lng = parseFloat(coords.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        transformed.coordinates = `(${lng},${lat})`;
      } else {
        transformed.coordinates = null;
      }
    } else if (!coords) {
      transformed.coordinates = null;
    }
  }
  
  // Filter out fields that don't exist in the database
  const allowedFields = [
    'id', 'title', 'slug', 'description', 'excerpt', 'category', 'sector', 'type',
    'location', 'province', 'district', 'coordinates', 'status', 'duration',
    'completion_date', 'start_date', 'client', 'budget', 'team_size', 'capacity',
    'energy_generation', 'images', 'technologies', 'objectives', 'outcomes',
    'challenges', 'impact', 'featured', 'tags', 'full_description'
  ];
  
  const filtered = {};
  Object.keys(transformed).forEach(key => {
    if (allowedFields.includes(key)) {
      filtered[key] = transformed[key];
    }
  });
  
  return filtered;
};

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      province,
      type,
      featured,
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const options = {
      category,
      status,
      province,
      type,
      featured: featured ? featured === 'true' : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    };

    const projects = await Projects.findAll(options);
    const total = await Projects.getCount(options);

    res.json({
      success: true,
      data: transformProjects(projects),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching projects', 
      error: error.message 
    });
  }
});

// GET /api/projects/featured - Get featured projects
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6, type } = req.query;
    
    const projects = await Projects.findAll({
      featured: true,
      type: type || undefined,
      limit: parseInt(limit),
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured projects', 
      error: error.message 
    });
  }
});

// GET /api/projects/stats - Get project statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Projects.getStats();
    const statusBreakdown = await Projects.getProjectsByStatus();
    const provinceBreakdown = await Projects.getProjectsByProvince();

    res.json({
      success: true,
      data: {
        overview: stats,
        byStatus: statusBreakdown,
        byProvince: provinceBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching project statistics', 
      error: error.message 
    });
  }
});

// GET /api/projects/search - Search projects
router.get('/search', async (req, res) => {
  try {
    const { q, category, province, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const projects = await Projects.search(q, {
      category,
      province,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching projects', 
      error: error.message 
    });
  }
});

// GET /api/projects/category/:category - Get projects by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const projects = await Projects.findByCategory(category, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Projects.getCount({ category });

    res.json({
      success: true,
      data: projects,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching projects by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching projects by category', 
      error: error.message 
    });
  }
});

// GET /api/projects/province/:province - Get projects by province
router.get('/province/:province', async (req, res) => {
  try {
    const { province } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const projects = await Projects.findByProvince(province, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Projects.getCount({ province });

    res.json({
      success: true,
      data: projects,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching projects by province:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching projects by province', 
      error: error.message 
    });
  }
});

// GET /api/projects/location/:lat/:lng - Get projects near location
router.get('/location/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 50 } = req.query; // Default 50km radius

    const projects = await Projects.findByLocation({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    }, parseInt(radius));

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects by location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching projects by location', 
      error: error.message 
    });
  }
});

// GET /api/projects/:id - Get project by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let project = null;
    
    // Check if id is a number (integer ID) or string (slug)
    if (/^\d+$/.test(id)) {
      // It's a numeric ID
      project = await Projects.findById(parseInt(id));
    } else {
      // It's a slug
      project = await Projects.findBySlug(id);
    }
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: transformProject(project)
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching project', 
      error: error.message 
    });
  }
});

// POST /api/projects - Create new project (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== PROJECT CREATION DEBUG ===');
    console.log('Original req.body.fullDescription:', req.body.fullDescription);
    
    // Validate request data
    const validationErrors = validateProjectData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields',
        errors: validationErrors
      });
    }
    
    const projectData = transformToDatabase(req.body);
    console.log('Transformed projectData.full_description:', projectData.full_description);
    
    // Generate slug if not provided
    if (!projectData.slug) {
      projectData.slug = projectData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const project = await Projects.create(projectData);
    console.log('Created project.full_description:', project.full_description);

    const transformedProject = transformProject(project);
    console.log('Final transformed project.fullDescription:', transformedProject.fullDescription);
    console.log('=== END DEBUG ===');

    res.status(201).json({
      success: true,
      data: transformedProject,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Project with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error creating project', 
      error: error.message 
    });
  }
});

// PUT /api/projects/:id - Update project (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = transformToDatabase(req.body);

    console.log('=== PROJECT UPDATE DEBUG ===');
    console.log('Update ID/Slug:', id);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body fullDescription length:', req.body.fullDescription ? req.body.fullDescription.length : 'undefined');
    console.log('Request body title:', req.body.title);
    console.log('Transformed data keys:', Object.keys(projectData));
    console.log('Transformed full_description length:', projectData.full_description ? projectData.full_description.length : 'undefined');

    // Find project by ID or slug
    let existingProject = null;
    if (/^\d+$/.test(id)) {
      // It's a numeric ID
      existingProject = await Projects.findById(parseInt(id));
    } else {
      // It's a slug
      existingProject = await Projects.findBySlug(id);
    }

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    console.log('Found existing project ID:', existingProject.id);
    console.log('Existing project title:', existingProject.title);

    // Use the actual ID for the update
    const updatedProject = await Projects.update(existingProject.id, projectData);
    
    console.log('Updated project ID:', updatedProject.id);
    console.log('Updated project title:', updatedProject.title);
    console.log('Updated project full_description length:', updatedProject.full_description ? updatedProject.full_description.length : 'undefined');
    console.log('=== END UPDATE DEBUG ===');

    res.json({
      success: true,
      data: transformProject(updatedProject),
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Project with this slug already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error updating project', 
      error: error.message 
    });
  }
});

// DELETE /api/projects/:id - Delete project (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProject = await Projects.delete(id);
    
    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: deletedProject,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting project', 
      error: error.message 
    });
  }
});

module.exports = router;
