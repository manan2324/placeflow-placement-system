# PlaceFlow 🎓

A comprehensive campus placement management system built with Next.js that streamlines the entire placement process for educational institutions. PlaceFlow enables efficient management of student profiles, company registrations, job applications, and placement tracking — with OTP-verified registration, password reset, real-time notifications, and data export.

## ✨ Features

### For Students
- **Profile Management** - Create and update academic profiles with CGPA, branch, and resume
- **Company Discovery** - Browse and filter companies based on eligibility criteria
- **Application Tracking** - Apply to companies and track application status in real-time
- **Smart Eligibility** - Automatic eligibility checks based on CGPA, branch, and backlogs
- **Real-time Notifications** - Get instant updates on application status changes via notification dropdown
- **Dashboard Analytics** - View personalized statistics and recent activities
- **Resume Upload & Viewing** - Upload resumes with validation and in-app viewing
- **Toast Notifications** - Inline feedback for actions via react-toastify

### For Administrators
- **Student Management** - Manage student profiles and verify enrollment details
- **Company Management** - Add and manage company details, job roles, and deadlines
- **Application Oversight** - Review all applications and update status (Shortlisted, Rejected, Selected)
- **Profile Update Requests** - Approve or reject student profile modification requests
- **Analytics Dashboard** - Monitor placement statistics and track company-wise applications
- **Application Logs** - Comprehensive audit trail of all status changes
- **Data Export** - Export application data to CSV for offline analysis

### Authentication & Security
- **OTP Email Verification** - Email-based OTP verification during student registration (Nodemailer)
- **Forgot Password** - OTP-verified password reset flow
- **JWT Authentication** - Secure token-based authentication with httpOnly cookies
- **Rate Limiting** - API rate limiting to prevent abuse
- **Security Headers** - X-Content-Type-Options, X-Frame-Options, Referrer-Policy

### Landing Page
- **Hero Section** - Welcoming introduction with call-to-action
- **Features Section** - Showcase of key capabilities
- **CTA Section** - Registration prompts
- **Navigation & Footer** - Consistent site-wide navigation

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TailwindCSS 4
- **Backend:** Next.js API Routes (App Router)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with httpOnly cookies + OTP email verification
- **State Management:** Zustand
- **Validation:** Zod schemas
- **Email:** Nodemailer (SMTP / Ethereal fallback for dev)
- **File Upload:** Cloudinary (production) / local storage (development)
- **Icons:** Lucide React
- **Toast Notifications:** react-toastify
- **HTTP Client:** Axios
- **Testing:** Jest + mongodb-memory-server (in-memory DB)
- **Linting:** ESLint with Next.js config

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

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

The `.env.local` file should contain:

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

# Email SMTP Configuration (for OTP emails)
# Leave empty to use Ethereal test emails in development
# For Gmail: use an App Password (https://myaccount.google.com/apppasswords)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM="PlaceFlow <noreply@placeflow.com>"

# Environment
NODE_ENV=development
```

**Important:**
- Replace `JWT_SECRET` with a strong, random string in production
- For Gmail SMTP, generate an [App Password](https://myaccount.google.com/apppasswords) — regular passwords won't work
- Without SMTP config, the app falls back to [Ethereal](https://ethereal.email/) fake SMTP for development (OTP preview URLs are logged to the console)
- Cloudinary credentials are optional — local file storage is used when they're empty

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env.local
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
│   ├── app/                       # Next.js App Router pages
│   │   ├── api/                   # API routes
│   │   │   ├── auth/              #   login, register, logout, me, send-otp, verify-otp, forgot-password
│   │   │   ├── admin/             #   applications, companies, dashboard, export, student-requests, students, application-logs
│   │   │   ├── student/           #   applications, apply, dashboard, notifications, profile, profile-change-request, resume
│   │   │   ├── companies/         #   Public company listing
│   │   │   └── health/            #   Health check endpoint
│   │   ├── auth/                  # Authentication pages (login, register, forgot-password)
│   │   ├── student/               # Student portal pages (dashboard, companies, applications, profile)
│   │   └── admin/                 # Admin portal pages (dashboard, companies, applications, students, student-requests, application-logs, data-export)
│   ├── components/                # React components
│   │   ├── auth/                  #   Login, Register, ForgotPassword forms
│   │   ├── student/               #   NotificationDropdown, ResumeViewer, dashboard, applications
│   │   ├── admin/                 #   CreateCompanyForm, company, dashboard
│   │   ├── home/                  #   HeroSection, FeaturesSection, CtaSection, HomeNavbar, SiteFooter
│   │   ├── layouts/               #   AdminLayout, AdminSidebar, StudentLayout, StudentSidebar
│   │   └── ui/                    #   Badge, Button, Card, Input, Skeleton, Table, ToastProvider
│   ├── lib/                       # Core utilities
│   │   ├── mongodb.js             #   Database connection
│   │   ├── jwt.js                 #   JWT utilities
│   │   ├── auth.js                #   Auth helpers
│   │   ├── authGuard.js           #   Route protection
│   │   ├── axios.js               #   Configured Axios instance
│   │   └── cloudinary.js          #   Cloudinary upload config
│   ├── models/                    # Mongoose models (User, StudentProfile, Company, Application, ApplicationLog, Notification, Otp, ProfileUpdateRequest)
│   ├── repositories/              # Database queries (data-access layer)
│   ├── services/                  # Business logic (auth, application, company, email, otp, passwordReset, dashboard, notification, etc.)
│   ├── store/                     # Zustand state management (authStore)
│   ├── utils/                     # Utility functions (apiResponse, csv, date, errors, logger, notification, objectId, parse, rateLimit, validate)
│   └── validators/                # Zod validation schemas (auth, application, company, student)
├── public/                        # Static assets & uploads
├── tests/                         # Jest test files + helpers
│   └── helpers/                   #   mongo.js (in-memory MongoDB setup)
└── scripts/                       # Utility scripts
    ├── createAdmin.js             #   Create admin user
    └── createDemoNotifications.js #   Generate demo notifications for testing
```

## 👥 User Roles & Access

### Student Account
- Register with email (OTP-verified), enrollment number, branch, CGPA
- View eligible companies
- Apply to companies
- Track application status
- Upload and manage resume
- Update profile (requires admin approval)
- Receive notifications for status changes

### Admin Account
- Full system access
- Manage students and companies
- Review and update applications
- Approve profile update requests
- View analytics and logs
- Export data to CSV

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
npm test             # Run Jest tests (uses mongodb-memory-server)

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
- **OTP Verification** - Hashed OTPs with attempt limits and expiry (5 min TTL)
- **Rate Limiting** - Per-IP rate limiting on sensitive endpoints (login, OTP)
- **Security Headers** - X-Content-Type-Options (nosniff), X-Frame-Options (DENY), strict Referrer-Policy
- **Powered-By Header Removed** - `X-Powered-By` header is stripped in production

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests use **mongodb-memory-server** for isolated, in-memory database instances — no running MongoDB required.

Tests cover:
- Authentication & role-based access
- Dashboard data validation
- Eligibility checks & application flow
- Negative / invalid ObjectID handling
- Ownership protection (cross-user access)
- Profile update requests
- Resume upload validation
- Status transitions
- Token expiry handling

## 📝 API Documentation

API endpoints follow RESTful conventions under `src/app/api/`:

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Student registration (requires OTP) |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/logout` | User logout |
| `GET`  | `/api/auth/me` | Get current user |
| `POST` | `/api/auth/send-otp` | Send OTP to email |
| `POST` | `/api/auth/verify-otp` | Verify OTP code |
| `POST` | `/api/auth/forgot-password` | Password reset (send OTP → verify → reset) |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/student/dashboard` | Student dashboard data |
| `GET`  | `/api/student/applications` | List student's applications |
| `POST` | `/api/student/apply` | Apply to a company |
| `GET`  | `/api/student/profile` | Get student profile |
| `PUT`  | `/api/student/profile` | Update student profile |
| `POST` | `/api/student/profile-change-request` | Submit profile change request |
| `POST` | `/api/student/resume` | Upload resume |
| `GET`  | `/api/student/notifications` | Get notifications |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/admin/dashboard` | Admin dashboard analytics |
| `GET`  | `/api/admin/applications` | List all applications |
| `PUT`  | `/api/admin/applications/:id` | Update application status |
| `GET`  | `/api/admin/companies` | List companies |
| `POST` | `/api/admin/companies` | Add a company |
| `GET`  | `/api/admin/students` | List all students |
| `GET`  | `/api/admin/student-requests` | List profile update requests |
| `PUT`  | `/api/admin/student-requests/:id` | Approve/reject profile request |
| `GET`  | `/api/admin/application-logs` | Get application audit logs |
| `GET`  | `/api/admin/export/applications` | Export applications as CSV |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/companies` | Public company listing |
| `GET`  | `/api/health` | Health check |

See individual route files in `src/app/api/` for detailed request/response documentation.

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
**Solution:** Clear browser cookies and log in again. Ensure `JWT_SECRET` is set in `.env.local`.

### Resume Upload Fails
**Solution:** Check that `public/uploads/resumes/` directory exists and has write permissions.

### OTP Emails Not Arriving
**Solution:** If using Gmail, make sure you're using an [App Password](https://myaccount.google.com/apppasswords), not your regular password. With no SMTP config, check the console for Ethereal preview URLs.

### Cloudinary Upload Errors
**Solution:** Verify your `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env.local`. Leave all three empty to fall back to local file storage.

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ for students by the PlaceFlow team**
