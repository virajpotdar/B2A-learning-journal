# B2A Learning Journal

A full-stack knowledge management platform for interns to store, organize, and share what they're learning during onboarding.

## Project Goal

Build a personal and team-level knowledge base where interns can:
- Create and organize learning notes
- Bookmark important topics for quick access
- Share learning paths with team members
- Track progress on different learning categories
- Collaborate in groups

This helps interns learn full-stack architecture while creating something useful for the team.

## Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Auth0** - Authentication
- **Framer Motion** - Animations
- **TanStack Query** - Data fetching

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Database & Auth (PostgreSQL)
- **bcryptjs** - Password hashing
- **Swagger** - API documentation
- **CORS** - Cross-origin resource sharing

### Database
- **Supabase PostgreSQL** - Primary database
- **Row Level Security (RLS)** - Data access control

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **GitHub Actions** - CI/CD pipeline

## Features

### ✅ Implemented
- **User Authentication** - Auth0 integration with Google OAuth
- **Learning Paths** - Create and organize learning paths by category
- **Notes Management** - Create, edit, and delete learning notes
- **Individual Topic Bookmarking** - Bookmark specific topics within learning paths
- **Bookmark Dialog** - Clean popup interface for accessing bookmarked topics
- **Search Functionality** - Search learning paths by title and description
- **Progress Tracking** - Track completion status for topics
- **Group Collaboration** - Create groups and share learning paths
- **Share Links** - Generate shareable links for learning paths
- **Responsive Design** - Mobile-friendly interface
- **API Documentation** - Swagger UI for backend API
- **Supabase Integration** - Direct database operations for notes storage

### 🚧 In Progress
- Real-time collaboration features
- Advanced analytics and statistics

### 📋 Planned
- Email notifications
- Export to PDF
- Advanced search with filters
- Learning recommendations
- Integration with external resources

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Auth0 account
- Git

### Environment Variables

#### Frontend (`.env.local`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_BACKEND_URL=http://localhost:4000
```

#### Backend (`.env`)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/b2a-learning-journal.git
cd b2a-learning-journal
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
npm install
```

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migrations in `backend/supabase-migrations/`
   - Get your URL and keys from project settings

5. **Set up Auth0**
   - Create a new application at [auth0.com](https://auth0.com)
   - Enable Google OAuth2 connection
   - Add your callback URLs (localhost:5173 for dev)
   - Get your domain and client ID

### Running the Application

#### Frontend
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

#### Backend
```bash
cd backend
npm run dev
```
Backend runs on [http://localhost:4000](http://localhost:4000)
Swagger UI available at [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

#### Backend
- `npm run dev` - Start development server with tsx watch
- `npm run build` - Build TypeScript to JavaScript

## Database Schema

### Tables
- **profiles** - User profiles and metadata
- **users** - Custom user authentication
- **groups** - Learning groups
- **group_members** - Group membership
- **group_activity** - Group activity tracking
- **shared_paths** - Shared learning paths
- **custom_categories** - Custom learning categories
- **notes** - Learning notes
- **password_resets** - Password reset tokens

### Row Level Security (RLS)
All tables have RLS policies to ensure users can only access their own data.

## API Documentation

The backend API is documented using Swagger UI.

**Access:** [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

### Main Endpoints
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/share/create` - Create a share link
- `GET /api/share/:shareId` - Get shared path

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Configure as Web Service
3. Set environment variables in Render dashboard
4. Deploy automatically on push to main branch

### GitHub Actions
The project includes CI/CD workflows:
- **Frontend CI** - Type checking, linting, and building
- **Backend CI** - Type checking and linting
- **Frontend Deploy** - Automatic deployment to Vercel
- **Backend Deploy** - Automatic deployment to Render

**Required GitHub Secrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `RENDER_SERVICE_ID`
- `RENDER_API_KEY`

## Recent Updates

### Latest Changes
-  **Individual Topic Bookmarking** - Users can now bookmark specific topics within learning paths
-  **Bookmark Dialog** - Clean popup interface for accessing bookmarked topics
-  **Supabase Integration** - Migrated notes storage from local backend to Supabase
-  **Swagger Documentation** - Added comprehensive API documentation
-  **Bug Fixes** - Fixed group deletion, search bar, and bookmark display issues
-  **TypeScript Fixes** - Resolved Material UI v6 compatibility issues
-  **GitHub Actions** - Set up CI/CD pipeline for automated testing and deployment

### Architecture Decisions
- **No CQRS** - Using traditional CRUD pattern for simplicity
- **No RabbitMQ** - Not needed for current scale and requirements
- **Direct Supabase Integration** - Removed dependency on local backend for notes
- **Auth0 for Authentication** - Enterprise-grade auth with social login support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
