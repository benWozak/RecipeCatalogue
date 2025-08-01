# HomeChef Companion Frontend

A modern Progressive Web App (PWA) built with React 19, TypeScript, and Tailwind CSS for comprehensive recipe management and meal planning.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** 
- **npm or yarn**

### Installation & Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file in the frontend directory:

   ```bash
   # Clerk Authentication
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   
   # Backend API
   VITE_API_URL=http://localhost:8000
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

5. **Visit the application:**
   - Local: http://localhost:5173

## 🏗️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.1
- **State Management**: Zustand
- **Authentication**: Clerk
- **HTTP Client**: TanStack Query (React Query)
- **UI Components**: Radix UI + Custom Components
- **Rich Text Editor**: Tiptap
- **PWA**: Vite PWA Plugin + Workbox
- **Icons**: Lucide React + Radix Icons
- **Animations**: Framer Motion

## ✨ Features

### 📱 Progressive Web App
- **Offline Support**: Access recipes without internet
- **Mobile Optimized**: Native app-like experience
- **Installable**: Add to home screen on mobile devices
- **Service Worker**: Background sync and caching

### 🔐 Authentication
- **Clerk Integration**: Secure user authentication
- **Protected Routes**: Route-level authentication
- **User Profiles**: Personalized user experience

### 📝 Recipe Management
- **Rich Text Editor**: TipTap-powered recipe editing
- **Image Support**: Multiple images per recipe
- **Collections**: Organize recipes into collections
- **Search & Filter**: Advanced recipe discovery
- **Import Options**: URL parsing, image OCR, Instagram import

### 🍽️ Meal Planning
- **Weekly Views**: Drag-and-drop meal planning
- **Daily Views**: Focused daily meal management
- **Meal Types**: Breakfast, lunch, dinner, snacks
- **Recipe Integration**: Easy recipe-to-meal assignment

### 🎨 Modern UI/UX
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-first approach
- **Component Library**: Reusable UI components
- **Smooth Animations**: Framer Motion transitions

## 🧩 Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared layout components
│   ├── error/          # Error boundary components
│   ├── landing/        # Landing page components
│   ├── meal-plan/      # Meal planning components
│   ├── parsing/        # Recipe parsing components
│   ├── recipe/         # Recipe management components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── pages/              # Route components
├── services/           # API service layer
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── constants/          # App constants
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with HMR

# Production
npm run build           # Build for production
npm run preview         # Preview production build locally

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues automatically

# Type Checking
npm run type-check      # Run TypeScript compiler check
```

## 🌐 API Integration

The frontend communicates with the FastAPI backend through:

- **TanStack Query**: For server state management and caching
- **Service Layer**: Centralized API communication
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Authentication**: Clerk token-based API authentication

### API Services

- `recipeService.ts` - Recipe CRUD operations
- `mealPlanService.ts` - Meal planning operations
- `collectionService.ts` - Recipe collection management
- `parsingService.ts` - Recipe parsing and import

## 📱 PWA Configuration

The app is configured as a Progressive Web App with:

- **Manifest**: App metadata and icons
- **Service Worker**: Offline functionality and caching
- **Install Prompt**: Custom install experience
- **Background Sync**: Offline-first data synchronization

## 🎯 Key Components

### State Management (Zustand)
- `recipeStore.ts` - Recipe state management
- Lightweight and performant state solution

### Authentication (Clerk)
- Route protection
- User session management
- Seamless login/logout flow

### UI Components
- **Shadcn/ui inspired**: Accessible and customizable
- **Radix UI**: Unstyled, accessible components
- **Custom Components**: App-specific UI elements

## 🔄 Development Workflow

1. **Feature Development**: Create components in appropriate directories
2. **State Management**: Use Zustand for client state, TanStack Query for server state
3. **Styling**: Use Tailwind CSS with custom component patterns
4. **Testing**: Component testing with React Testing Library (to be added)
5. **Build**: Vite handles bundling and optimization

## 📦 Build & Deployment

The app builds to a static site that can be deployed to:

- **Vercel** (Recommended)
- **Netlify**
- **GitHub Pages**
- **Firebase Hosting**
- Any static hosting service

Build artifacts are optimized for:
- Code splitting
- Asset optimization
- PWA manifest and service worker
- Compression and caching

## 🔧 Environment Variables

Required environment variables:

```bash
# Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# API Configuration
VITE_API_URL=http://localhost:8000

# Optional: Additional service keys
VITE_GOOGLE_ANALYTICS_ID=G-...
```

## 🤝 Contributing

1. Follow React best practices and TypeScript conventions
2. Use existing UI components when possible
3. Maintain PWA functionality in new features
4. Test on mobile devices for responsive design
5. Follow the established folder structure

---

**Part of the HomeChef Companion ecosystem** 🍳