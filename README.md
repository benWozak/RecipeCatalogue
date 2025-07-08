# Recipe Catalogue

A comprehensive recipe management Progressive Web App (PWA) that allows users to store, organize, and plan meals with their favorite recipes. Built as a modern full-stack application with recipe parsing capabilities from various sources.

## 🏗️ Architecture

This is a **mono-repo** containing both frontend and backend applications:

```
📁 RecipeCatalogue/
├── 📱 frontend/          # React + TypeScript PWA
├── 🔧 backend/           # FastAPI + PostgreSQL API
├── 📚 docs/             # Documentation (coming soon)
└── 🚀 deployment/       # Deployment configurations (coming soon)
```

### Tech Stack

**Frontend (PWA)**
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **PWA**: Service Worker + Offline Support
- **Styling**: Tailwind CSS (planned)
- **State Management**: Zustand (planned)
- **Authentication**: Clerk (planned)

**Backend (API)**
- **Framework**: FastAPI (Python)
- **Database**: Neon Postgres
- **ORM**: SQLAlchemy + Alembic
- **Authentication**: JWT + Clerk Integration
- **Validation**: Pydantic
- **Security**: Comprehensive security implementation

**External Services**
- **Database**: Neon Postgres (Cloud)
- **Authentication**: Clerk
- **Image Processing**: Google Cloud Vision (planned)
- **Recipe Parsing**: Custom parsers + OpenAI (planned)

## ✨ Features

### 📝 Recipe Management
- **Manual Recipe Entry**: Rich text editor for custom recipes
- **Recipe Parsing**: Extract recipes from:
  - 🌐 Website URLs (with structured data support)
  - 📷 Images (OCR-powered)
  - 📱 Instagram posts
- **Recipe Organization**: Tags and categories
- **Rich Media Support**: Multiple images and videos per recipe

### 🍽️ Meal Planning
- **Weekly/Monthly Planning**: Drag-and-drop meal planning interface
- **Shopping Lists**: Auto-generate from meal plans
- **Portion Scaling**: Adjust recipes for different serving sizes
- **Nutritional Info**: Ingredient-based nutrition calculation (planned)

### 🔍 Smart Search & Discovery
- **Advanced Search**: Filter by ingredients, cuisine, and prep time
- **Recipe Recommendations**: AI-powered suggestions (planned)
- **Collections**: Curated recipe collections
- **Social Features**: Share recipes with friends (planned)

### 📱 Progressive Web App
- **Offline Support**: Access recipes without internet
- **Mobile Optimized**: Native app-like experience
- **Push Notifications**: Meal reminders and updates (planned)
- **Cross-Platform**: Works on iOS, Android, and Desktop

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL** (Neon account recommended)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```

4. **Generate secure secret key:**
   ```bash
   python generate_secret_key.py
   # Follow prompts and update .env with generated key
   ```

5. **Set up database:**
   ```bash
   # Create initial migration
   alembic revision --autogenerate -m "Initial schema"
   
   # Apply migration
   alembic upgrade head
   ```

6. **Start development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. **Visit API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Visit application:**
   - Local: http://localhost:5173

## 📚 Documentation

- **[Backend Setup Guide](backend/README.md)** - Detailed backend configuration
- **[Database Setup](backend/DATABASE_SETUP.md)** - Neon Postgres configuration
- **[Security Guide](backend/SECURITY.md)** - Security implementation details
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs (when running)

## 🔐 Security

This application implements enterprise-grade security:

- **🔑 Secret Key Management**: 688-bit entropy keys with rotation procedures
- **🛡️ JWT Authentication**: Secure token-based authentication
- **🔒 Database Security**: SSL-encrypted connections with input validation
- **🚨 Startup Validation**: Automatic security checks on application start
- **📝 Audit Logging**: Comprehensive security event logging

See [Security Guide](backend/SECURITY.md) for detailed security information.

## 🏗️ Development

### Project Structure

```
📁 backend/
├── 📱 app/
│   ├── 🔧 api/          # API route handlers
│   ├── ⚙️ core/         # Core configuration & database
│   ├── 📊 models/       # SQLAlchemy database models
│   ├── 📋 schemas/      # Pydantic request/response schemas
│   ├── 🔄 services/     # Business logic layer
│   └── 🧹 utils/        # Helper functions
├── 🗃️ alembic/         # Database migrations
└── 🧪 tests/           # Test suite

📁 frontend/
├── 📱 src/
│   ├── 🧩 components/   # React components
│   ├── 📄 pages/        # Route components
│   ├── 🔗 hooks/        # Custom React hooks
│   ├── 🗄️ stores/       # State management
│   ├── 🌐 services/     # API service layer
│   └── 🎨 assets/       # Static assets
└── 📦 public/          # Public assets
```

### Available Scripts

**Backend:**
```bash
# Development
uvicorn app.main:app --reload

# Database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head

# Testing
python -m pytest
python validate_setup.py

# Security
python test_jwt_security.py
python generate_secret_key.py
```

**Frontend:**
```bash
# Development
npm run dev

# Production build
npm run build

# Code quality
npm run lint
npm run preview
```

## 🚀 Deployment

### Backend Deployment Options

- **Railway**: Direct FastAPI deployment
- **Vercel**: Serverless Python functions
- **DigitalOcean**: App Platform deployment
- **Docker**: Containerized deployment
- **Heroku**: Traditional PaaS deployment

### Frontend Deployment Options

- **Vercel**: Recommended for React PWAs
- **Netlify**: JAMstack deployment
- **GitHub Pages**: Static site hosting
- **Firebase Hosting**: Google Cloud integration

### Database

- **Neon Postgres**: Recommended cloud PostgreSQL
- **Supabase**: Alternative PostgreSQL with real-time features
- **AWS RDS**: Enterprise PostgreSQL
- **Google Cloud SQL**: Google Cloud PostgreSQL

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- **Backend**: Follow PEP 8, use type hints, write tests
- **Frontend**: Follow React best practices, use TypeScript
- **Security**: Run security validation before commits
- **Database**: Always create migrations for schema changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Backend API with authentication
- [x] Database schema and migrations
- [x] Security implementation
- [x] Recipe CRUD operations
- [x] Meal planning functionality

### Phase 2: Frontend Foundation (In Progress)
- [ ] React PWA setup
- [ ] Clerk authentication integration
- [ ] Recipe management interface
- [ ] Meal planning calendar

### Phase 3: Enhanced Features
- [ ] Recipe parsing from URLs
- [ ] Image-based recipe extraction (OCR)
- [ ] Instagram recipe parsing
- [ ] Advanced search and filtering

### Phase 4: Social & AI Features
- [ ] Recipe sharing and collections
- [ ] AI-powered recipe recommendations
- [ ] Nutritional analysis
- [ ] Smart shopping lists

### Phase 5: Mobile & Offline
- [ ] Enhanced PWA features
- [ ] Offline recipe access
- [ ] Push notifications
- [ ] Mobile app deployment

## 🆘 Support

- **Documentation**: Check the `/docs` directory and README files
- **Issues**: Report bugs via GitHub Issues
- **Security**: See [Security Guide](backend/SECURITY.md) for security-related questions
- **API**: Use http://localhost:8000/docs for interactive API documentation

## 📧 Contact

For questions or support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for food lovers and home cooks everywhere!** 🍳👨‍🍳👩‍🍳