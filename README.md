# FEED Website Backend

A Node.js Express API backend for the FEED website with MongoDB database integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB installed locally or MongoDB Atlas account
- Git

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy example environment file
   copy .env.example .env
   
   # Edit .env file with your configurations
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

5. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be running at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── Admin.js             # Admin user model
│   └── Timeline.js          # Timeline model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── timeline.js          # Timeline CRUD routes
│   └── upload.js            # File upload routes
├── scripts/
│   └── seed.js              # Database seeding script
├── uploads/                 # File upload directory
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
└── server.js               # Main server file
```

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feed_db
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secure_jwt_secret_key
ADMIN_EMAIL=admin@feed.org.np
ADMIN_PASSWORD=admin123
MAX_FILE_SIZE=10485760
```

## 🛠 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get admin profile (protected)
- `POST /api/auth/verify-token` - Verify JWT token (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Timeline
- `GET /api/timeline` - Get all timeline items (public)
- `GET /api/timeline/featured` - Get featured items (public)
- `GET /api/timeline/:id` - Get single timeline item (public)
- `POST /api/timeline` - Create timeline item (admin)
- `PUT /api/timeline/:id` - Update timeline item (admin)
- `DELETE /api/timeline/:id` - Delete timeline item (admin)
- `GET /api/timeline/meta/categories` - Get categories (public)
- `GET /api/timeline/meta/icons` - Get available icons (public)

### File Upload
- `POST /api/upload/single` - Upload single file (admin)
- `POST /api/upload/multiple` - Upload multiple files (admin)
- `DELETE /api/upload/:filename` - Delete file (admin)
- `GET /api/upload/list` - List uploaded files (admin)

### Utility
- `GET /health` - Health check endpoint

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

```javascript
headers: {
  'Authorization': 'Bearer your_jwt_token_here'
}
```

## 📊 Database Models

### Timeline Model
```javascript
{
  year: String (required),
  title: String (required, max 200 chars),
  description: String (required, max 1000 chars),
  icon: String (enum of available icons),
  category: String (enum of categories),
  featured: Boolean (default: true),
  isActive: Boolean (default: true),
  sortOrder: Number (default: 0),
  timestamps: true
}
```

### Admin Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: admin, super_admin),
  isActive: Boolean (default: true),
  lastLogin: Date,
  timestamps: true
}
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Setup for Production
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure proper MongoDB connection
4. Set up proper CORS origins
5. Configure file upload limits

## 📱 API Usage Examples

### Get Featured Timeline Items
```javascript
fetch('http://localhost:5000/api/timeline/featured')
  .then(response => response.json())
  .then(data => console.log(data.data));
```

### Admin Login
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@feed.org.np',
    password: 'admin123'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    localStorage.setItem('token', data.data.token);
  }
});
```

### Create Timeline Item (Admin)
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/timeline', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    year: '2024',
    title: 'New Milestone',
    description: 'Description of the milestone',
    icon: 'Award',
    category: 'Achievement',
    featured: true
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🛡 Security Features

- JWT authentication
- Password hashing with bcrypt
- Request rate limiting
- CORS protection
- Helmet security headers
- Input validation
- File upload restrictions
- Soft delete for data integrity

## 📈 Hosting in Nepal

### Recommended Hosting Providers
1. **Websoftex Networks** - Local provider with Node.js support
2. **Himalayan Host** - Reliable local hosting
3. **AGM Web Hosting** - Popular choice in Nepal
4. **Heroku** - International, easy deployment
5. **DigitalOcean Singapore** - Close server location

### Deployment Steps
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Install dependencies: `npm install`
4. Seed database: `npm run seed`
5. Start server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: admin@feed.org.np
- Create an issue in the repository

---

**Built with ❤️ for FEED - Sustainable Energy Development in Nepal**
