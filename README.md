# PlaceFlow 🎓

A comprehensive campus placement management system built with Next.js that streamlines the entire placement process for educational institutions. PlaceFlow enables efficient management of student profiles, company registrations, job applications, and placement tracking.

## ✨ Features

### For Students
- **Profile Management** - Create and update academic profiles with CGPA, branch, and resume
- **Company Discovery** - Browse and filter companies based on eligibility criteria
- **Application Tracking** - Apply to companies and track application status in real-time
- **Smart Eligibility** - Automatic eligibility checks based on CGPA, branch, and backlogs
- **Real-time Notifications** - Get instant updates on application status changes
- **Dashboard Analytics** - View personalized statistics and recent activities

### For Administrators
- **Student Management** - Manage student profiles and verify enrollment details
- **Company Management** - Add and manage company details, job roles, and deadlines
- **Application Oversight** - Review all applications and update status (Shortlisted, Rejected, Selected)
- **Profile Update Requests** - Approve or reject student profile modification requests
- **Analytics Dashboard** - Monitor placement statistics and track company-wise applications
- **Application Logs** - Comprehensive audit trail of all status changes

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT-based authentication with httpOnly cookies
- **State Management:** Zustand
- **Validation:** Zod schemas
- **File Upload:** Resume upload with validation
- **Testing:** Jest

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Local or Atlas cluster
- **npm** or **yarn** package manager
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/placeflow.git
cd placeflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/placement-monitoring-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload
RESUME_UPLOAD_PATH=./public/uploads/resumes
MAX_FILE_SIZE=5242880

# Cloudinary (Optional - for production cloud storage)
# Leave empty to use local storage in development
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Environment
NODE_ENV=development
```

**Important:** 
- Replace `JWT_SECRET` with a strong, random string in production
- For production deployment with cloud storage, see [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md)

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### 5. Create Admin User

Run the script to create your first admin user:

```bash
npm run create-admin
```

Follow the prompts to set up admin credentials.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
placement-monitoring-system/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── student/           # Student portal pages
│   │   └── admin/             # Admin portal pages
│   ├── components/            # React components
│   │   ├── auth/              # Auth components
│   │   ├── student/           # Student components
│   │   ├── admin/             # Admin components
│   │   ├── layouts/           # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Core utilities
│   │   ├── mongodb.js         # Database connection
│   │   ├── jwt.js             # JWT utilities
│   │   └── auth.js            # Auth helpers
│   ├── models/                # Mongoose models
│   ├── repositories/          # Database queries
│   ├── services/              # Business logic
│   ├── store/                 # Zustand state management
│   ├── utils/                 # Utility functions
│   └── validators/            # Zod validation schemas
├── public/                    # Static assets
├── tests/                     # Test files
└── scripts/                   # Utility scripts
```

## 👥 User Roles & Access

### Student Account
- Register with enrollment number, branch, CGPA
- View eligible companies
- Apply to companies
- Track application status
- Update profile (requires admin approval)

### Admin Account
- Full system access
- Manage students and companies
- Review and update applications
- Approve profile update requests
- View analytics and logs

**Default Login:**
- Use the credentials created with `npm run create-admin`

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Testing
npm test             # Run Jest tests

# Utilities
npm run create-admin # Create admin user
npm run lint         # Run ESLint
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **HttpOnly Cookies** - Prevents XSS attacks
- **Role-Based Access Control** - Separate portals for students and admins
- **Input Validation** - Zod schemas for all API requests
- **MongoDB Injection Protection** - Parameterized queries with Mongoose
- **File Upload Validation** - Restricted file types and sizes for resumes

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- Authentication & role-based access
- Eligibility checks
- Application workflows
- Profile update requests
- Status transitions
- Token expiry handling

## 📝 API Documentation

API endpoints follow RESTful conventions:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration
- `GET /api/student/dashboard` - Student dashboard data
- `GET /api/admin/applications` - List all applications
- `PUT /api/admin/applications/:id` - Update application status

See individual route files in `src/app/api/` for detailed documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues & Troubleshooting

### MongoDB Connection Error
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running. Start it with `mongod` or check your connection string.

### JWT Token Errors
**Solution:** Clear browser cookies and log in again. Ensure `JWT_SECRET` is set in `.env`.

### Resume Upload Fails
**Solution:** Check that `public/uploads/resumes/` directory exists and has write permissions.

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ for students by the PlaceFlow team**
