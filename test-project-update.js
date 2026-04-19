const axios = require('axios');

async function testProjectUpdate() {
  try {
    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@feed.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('Login successful! Token received.');
    
    // Step 2: Get list of projects
    console.log('Step 2: Getting projects...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects');
    const projects = projectsResponse.data.data;
    
    if (projects.length === 0) {
      console.log('No projects found. Creating a test project first...');
      
      // Create a test project
      const createResponse = await axios.post('http://localhost:5000/api/projects', {
        title: 'Test Project for Update',
        slug: 'test-project-update',
        description: 'This is a test project to test the update functionality',
        location: 'Kathmandu, Nepal',
        status: 'Planning',
        category: 'Solar Energy',
        type: 'detailed',
        fullDescription: '<p>This is the full description with <strong>rich text</strong>.</p>'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Test project created:', createResponse.data.data.title);
      projects.push(createResponse.data.data);
    }
    
    const projectToUpdate = projects[0];
    console.log(`Step 3: Updating project "${projectToUpdate.title}" (slug: ${projectToUpdate.slug})`);
    
    // Step 3: Update the project
    const updateData = {
      ...projectToUpdate,
      title: projectToUpdate.title + ' - UPDATED',
      description: 'This project has been updated via API test at ' + new Date().toISOString(),
      fullDescription: '<p>Updated full description with <strong>new content</strong> and <em>formatting</em>.</p>'
    };
    
    const updateResponse = await axios.put(`http://localhost:5000/api/projects/${projectToUpdate.slug}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Update successful!');
    console.log('Updated project title:', updateResponse.data.data.title);
    console.log('Updated description:', updateResponse.data.data.description);
    console.log('Full description preserved:', !!updateResponse.data.data.fullDescription);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('Authentication failed - check token or admin credentials');
    }
  }
}

testProjectUpdate();
