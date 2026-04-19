# FEED Website Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Common Query Parameters
- `limit` - Number of items per page (default: varies by endpoint)
- `offset` - Number of items to skip for pagination (default: 0)
- `sortBy` - Field to sort by (default: varies by endpoint)
- `sortOrder` - ASC or DESC (default: varies by endpoint)

## Timeline API

### GET /api/timeline
Get all timeline items with filtering and pagination
- Query: `category`, `featured`, `limit`, `offset`, `sortBy`, `sortOrder`

### GET /api/timeline/featured
Get featured timeline items
- Query: `limit` (default: 5)

### GET /api/timeline/categories
Get all unique categories

### GET /api/timeline/search
Search timeline items
- Query: `q` (required), `category`, `limit`, `offset`

### GET /api/timeline/:id
Get timeline item by ID

### POST /api/timeline (Auth Required)
Create new timeline item

### PUT /api/timeline/:id (Auth Required)
Update timeline item

### DELETE /api/timeline/:id (Auth Required)
Delete timeline item

## Services API

### GET /api/services
Get all services
- Query: `status`, `featured`, `limit`, `offset`, `sortBy`, `sortOrder`

### GET /api/services/featured
Get featured services
- Query: `limit` (default: 6)

### GET /api/services/search
Search services
- Query: `q` (required), `limit`, `offset`

### GET /api/services/:id
Get service by ID or slug

### POST /api/services (Auth Required)
Create new service

### PUT /api/services/:id (Auth Required)
Update service

### DELETE /api/services/:id (Auth Required)
Delete service

## Projects API

### GET /api/projects
Get all projects
- Query: `category`, `status`, `province`, `featured`, `limit`, `offset`, `sortBy`, `sortOrder`

### GET /api/projects/featured
Get featured projects
- Query: `limit` (default: 6)

### GET /api/projects/stats
Get project statistics and breakdowns

### GET /api/projects/search
Search projects
- Query: `q` (required), `category`, `province`, `limit`, `offset`

### GET /api/projects/category/:category
Get projects by category
- Query: `limit`, `offset`

### GET /api/projects/province/:province
Get projects by province
- Query: `limit`, `offset`

### GET /api/projects/location/:lat/:lng
Get projects near location
- Query: `radius` (km, default: 50)

### GET /api/projects/:id
Get project by ID or slug

### POST /api/projects (Auth Required)
Create new project

### PUT /api/projects/:id (Auth Required)
Update project

### DELETE /api/projects/:id (Auth Required)
Delete project

## Events API

### GET /api/events
Get all events
- Query: `category`, `status`, `featured`, `upcoming`, `limit`, `offset`, `sortBy`, `sortOrder`

### GET /api/events/upcoming
Get upcoming events
- Query: `category`, `limit`, `offset`

### GET /api/events/past
Get past events
- Query: `category`, `limit`, `offset`

### GET /api/events/featured
Get featured events
- Query: `limit` (default: 5)

### GET /api/events/stats
Get event statistics

### GET /api/events/search
Search events
- Query: `q` (required), `category`, `status`, `limit`, `offset`

### GET /api/events/date-range/:start/:end
Get events in date range
- Query: `limit`, `offset`

### POST /api/events/:id/register
Register for an event (increments attendee count)

### GET /api/events/:id
Get event by ID or slug

### POST /api/events (Auth Required)
Create new event

### PUT /api/events/:id (Auth Required)
Update event

### DELETE /api/events/:id (Auth Required)
Delete event

## Publications API

### GET /api/publications
Get all publications
- Query: `type`, `category`, `featured`, `is_public`, `limit`, `offset`, `sortBy`, `sortOrder`

### GET /api/publications/featured
Get featured publications
- Query: `limit` (default: 6)

### GET /api/publications/popular
Get popular publications (by downloads + citations)
- Query: `limit` (default: 10)

### GET /api/publications/recent
Get recent publications
- Query: `limit` (default: 10)

### GET /api/publications/stats
Get publication statistics

### GET /api/publications/search
Search publications
- Query: `q` (required), `type`, `category`, `limit`, `offset`

### GET /api/publications/type/:type
Get publications by type
- Query: `limit`, `offset`

### GET /api/publications/category/:category
Get publications by category
- Query: `limit`, `offset`

### GET /api/publications/author/:author
Get publications by author
- Query: `limit`, `offset`

### POST /api/publications/:id/download
Track publication download (increments download count)

### GET /api/publications/:id
Get publication by ID or slug

### POST /api/publications (Auth Required)
Create new publication

### PUT /api/publications/:id (Auth Required)
Update publication

### DELETE /api/publications/:id (Auth Required)
Delete publication

## Team API

### GET /api/team
Get all team members
- Query: `department`, `is_active`, `limit`, `offset`, `sortBy`, `sortOrder`

### GET /api/team/department/:department
Get team members by department
- Query: `limit`, `offset`

### GET /api/team/search
Search team members
- Query: `q` (required), `department`, `limit`, `offset`

### GET /api/team/:id
Get team member by ID

### POST /api/team (Auth Required)
Create new team member

### PUT /api/team/:id (Auth Required)
Update team member

### DELETE /api/team/:id (Auth Required)
Delete team member

## News/Blog API

### GET /api/news
Get all news/blog posts
- Query: `category`, `featured`, `is_published`, `limit`, `offset`, `sortBy`, `sortOrder`

### GET /api/news/featured
Get featured news
- Query: `limit` (default: 5)

### GET /api/news/recent
Get recent news
- Query: `limit` (default: 10)

### GET /api/news/popular
Get popular news (by views)
- Query: `limit` (default: 10)

### GET /api/news/search
Search news
- Query: `q` (required), `category`, `limit`, `offset`

### GET /api/news/category/:category
Get news by category
- Query: `limit`, `offset`

### GET /api/news/:id
Get news article by ID or slug (increments view count)

### POST /api/news (Auth Required)
Create new article

### PUT /api/news/:id (Auth Required)
Update article

### DELETE /api/news/:id (Auth Required)
Delete article

## Authentication API

### POST /api/auth/login
Admin login
- Body: `{ "username": "admin", "password": "password" }`

### GET /api/auth/profile (Auth Required)
Get admin profile

### POST /api/auth/change-password (Auth Required)
Change admin password
- Body: `{ "currentPassword": "old", "newPassword": "new" }`

## File Upload API

### POST /api/upload (Auth Required)
Upload single file
- Form data with file field

### POST /api/upload/multiple (Auth Required)
Upload multiple files
- Form data with files field (array)

### GET /api/upload/list (Auth Required)
List all uploaded files

### DELETE /api/upload/:filename (Auth Required)
Delete uploaded file

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "pagination": {  // For paginated endpoints
    "total": 100,
    "limit": 20,
    "offset": 0,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Database Schema

### Services Table
- id, title, slug, description, short_description, icon, service_type, status, featured, sort_order, meta_title, meta_description, created_at, updated_at

### Projects Table
- id, title, slug, description, excerpt, category, type, location, province, district, coordinates, status, duration, completion_date, start_date, client, budget, team_size, capacity, energy_generation, images (JSON), technologies (JSON), objectives (JSON), outcomes (JSON), challenges (JSON), impact (JSON), featured, tags (JSON), created_at, updated_at

### Events Table  
- id, title, slug, subtitle, description, full_description, event_date, end_date, event_time, location, venue, organizer, category, status, capacity, registered_attendees, ticket_price, images (JSON), speakers (JSON), agenda (JSON), registration_url, contact_info (JSON), featured, tags (JSON), created_at, updated_at

### Publications Table
- id, title, slug, subtitle, type, category, publication_date, authors (JSON), abstract, description, full_content, download_url, image_url, tags (JSON), pages, language, doi, citations, downloads, featured, is_public, created_at, updated_at

### Team Members Table
- id, name, position, department, bio, expertise (JSON), education (JSON), image_url, email, linkedin, publications, years_experience, languages (JSON), awards (JSON), is_active, sort_order, created_at, updated_at

### News Table
- id, title, slug, excerpt, content, author, category, publication_date, image_url, images (JSON), tags (JSON), featured, is_published, views, meta_title, meta_description, created_at, updated_at

### Timeline Table
- id, title, description, date, category, icon, featured, year, created_at, updated_at

### Admin Table
- id, username, password (hashed), email, created_at, updated_at

## Error Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (duplicate slug/username)
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error
