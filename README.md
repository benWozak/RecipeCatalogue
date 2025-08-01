# HomeChef Companion

A comprehensive recipe management Progressive Web App (PWA) that allows users to store, organize, and plan meals with their favorite recipes. Built as a modern full-stack application with recipe parsing capabilities from various sources.

## Table of Contents

- [Architecture](#architecture)
  - [Tech Stack](#tech-stack)
- [Features](#features)
  - [Recipe Management](#recipe-management)
  - [Meal Planning](#meal-planning)
  - [Smart Search & Discovery](#smart-search--discovery)
  - [Progressive Web App](#progressive-web-app)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Setup Instructions](#setup-instructions)
  - [Quick Development Start](#quick-development-start)
- [Documentation](#documentation)
- [Security](#security)
- [Development](#development)
  - [Project Structure](#project-structure)
  - [Available Scripts](#available-scripts)
- [Contributing](#contributing)
  - [Development Guidelines](#development-guidelines)
- [License](#license)
- [Roadmap](#roadmap)
- [Support](#support)
- [Contact](#contact)

## Architecture

This is a **mono-repo** containing both frontend and backend applications:

```
RecipeCatalogue/
├── frontend/          # React + TypeScript PWA
├── backend/           # FastAPI + PostgreSQL API
├── docs/             # Documentation (coming soon)
```

### Tech Stack

**Frontend (PWA)**

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **PWA**: Service Worker + Offline Support
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Clerk

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

## Features

### Recipe Management

- **Manual Recipe Entry**: Rich text editor for custom recipes
- **Recipe Parsing**: Extract recipes from:
  - Website URLs (with structured data support)
  - Images (OCR-powered)
  - Instagram posts
- **Recipe Organization**: Tags and categories
- **Rich Media Support**: Multiple images and videos per recipe

### Meal Planning

- **Weekly/Monthly Planning**: Drag-and-drop meal planning interface
- **Shopping Lists**: Auto-generate from meal plans
- **Portion Scaling**: Adjust recipes for different serving sizes
- **Nutritional Info**: Ingredient-based nutrition calculation (planned)

### Smart Search & Discovery

- **Advanced Search**: Filter by ingredients, cuisine, and prep time
- **Recipe Recommendations**: AI-powered suggestions (planned)
- **Collections**: Curated recipe collections
- **Social Features**: Share recipes with friends (planned)

### Progressive Web App

- **Offline Support**: Access recipes without internet
- **Mobile Optimized**: Native app-like experience
- **Push Notifications**: Meal reminders and updates (planned)
- **Cross-Platform**: Works on iOS, Android, and Desktop

## Quick Start

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL** (Neon account recommended)

### Setup Instructions

For detailed setup instructions, please refer to the specific README files:

- **[Backend Setup Guide](backend/README.md)** - Complete FastAPI backend setup with database configuration
- **[Frontend Setup Guide](frontend/README.md)** - React PWA setup with authentication and environment configuration

### Quick Development Start

1. **Backend**: Follow the [Backend Setup Guide](backend/README.md) to get the API running on `http://localhost:8000`
2. **Frontend**: Follow the [Frontend Setup Guide](frontend/README.md) to get the PWA running on `http://localhost:5173`

## Documentation

- **[Backend Setup Guide](backend/README.md)** - Detailed backend configuration
- **[Database Setup](backend/DATABASE_SETUP.md)** - Neon Postgres configuration
- **[Security Guide](backend/SECURITY.md)** - Security implementation details
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs (when running)

## Security

This application implements enterprise-grade security:

- **Secret Key Management**: 688-bit entropy keys with rotation procedures
- **JWT Authentication**: Secure token-based authentication
- **Database Security**: SSL-encrypted connections with input validation
- **Startup Validation**: Automatic security checks on application start
- **Audit Logging**: Comprehensive security event logging

See [Security Guide](backend/SECURITY.md) for detailed security information.

## Development

### Project Structure

```
backend/
├── app/
│   ├── api/          # API route handlers
│   ├── core/         # Core configuration & database
│   ├── models/       # SQLAlchemy database models
│   ├── schemas/      # Pydantic request/response schemas
│   ├── services/     # Business logic layer
│   └── utils/        # Helper functions
├── alembic/         # Database migrations
└── tests/           # Test suite

frontend/
├── src/
│   ├── components/   # React components
│   ├── pages/        # Route components
│   ├── hooks/        # Custom React hooks
│   ├── stores/       # State management
│   ├── services/     # API service layer
│   └── assets/       # Static assets
└── public/          # Public assets
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

## Contributing

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

### Phase 1: Core Features (Completed)

- [x] Backend API with authentication
- [x] Database schema and migrations
- [x] Security implementation
- [x] Recipe CRUD operations
- [x] Meal planning functionality

### Phase 2: Frontend Foundation (Completed)

- [x] React PWA setup
- [x] Clerk authentication integration
- [x] Recipe management interface
- [x] Meal planning calendar
- [x] Tailwind CSS styling
- [x] Zustand state management

### Phase 3: Enhanced Features (Completed)

- [x] Recipe parsing from URLs
- [x] Image-based recipe extraction (OCR)
- [x] Instagram recipe parsing
- [x] Advanced search and filtering
- [x] Collections and recipe organization

### Phase 4: Production Ready Beta MVP (In Progress)

- [ ] backend security and infrastructure review
- [ ] Frontend QA & Auth environment configuration
- [ ] Unit Testing coverage
- [ ] Backend deployment & monitoring
- [ ] Write API Documentation

### Phase 5: Post MVP Feature Updates

- [ ] Add nutritional info to recipe model
- [ ] Implement Account Linking
- [ ] Improve Image parsing from mobile
- [ ] Implement Stripe Subscriptions (Unlock Chef Plan)

### Phase 6: App Store Submission

- [ ] Submit to Google Play store
- [ ] Submit to Apple Store

## Support

- **Documentation**: Check the `/docs` directory and README files
- **Issues**: Report bugs via GitHub Issues
- **Security**: See [Security Guide](backend/SECURITY.md) for security-related questions
- **API**: Use http://localhost:8000/docs for interactive API documentation

## Contact

For questions or support, please open an issue on GitHub or contact me via https://benwozak.dev/contact

---
