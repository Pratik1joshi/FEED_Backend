const axios = require('axios');

// Test the update endpoint
async function testUpdate() {
  try {
    // First, get a project to update
    console.log('Getting projects...');
    const getResponse = await axios.get('http://localhost:5000/api/projects');
    const projects = getResponse.data.data;
    
    if (projects.length === 0) {
      console.log('No projects found to update');
      return;
    }
    
    const project = projects[0];
    console.log('Found project:', project.title, 'with slug:', project.slug);
    
    // Test update with slug
    const updateData = {
      ...project,
      title: project.title + ' - UPDATED',
      description: 'This project has been updated via API test'
    };
    
    console.log('Updating project with slug:', project.slug);
    const updateResponse = await axios.put(`http://localhost:5000/api/projects/${project.slug}`, updateData, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Update successful:', updateResponse.data);
    
  } catch (error) {
    console.error('Error testing update:', error.response?.data || error.message);
  }
}

testUpdate();
