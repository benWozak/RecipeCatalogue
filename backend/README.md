# Recipe Catalogue Backend

FastAPI backend for the Recipe Management PWA application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual configuration values
```

4. Set up the database:
```bash
# Create database migration
alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head
```

5. Run the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, you can access:
- API Documentation: http://localhost:8000/docs
- Alternative API docs: http://localhost:8000/redoc

## Project Structure

```
app/
├── api/                 # API route handlers
│   ├── auth/           # Authentication endpoints
│   ├── recipes/        # Recipe CRUD endpoints
│   ├── meal_plans/     # Meal planning endpoints
│   ├── users/          # User profile endpoints
│   └── parsing/        # Recipe parsing endpoints
├── core/               # Core functionality
│   ├── config.py       # Configuration settings
│   ├── database.py     # Database connection
│   └── security.py     # Security utilities
├── models/             # SQLAlchemy database models
├── schemas/            # Pydantic request/response schemas
├── services/           # Business logic layer
└── main.py            # FastAPI application entry point
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key
- `CLERK_SECRET_KEY`: Clerk authentication secret
- `CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_WEBHOOK_SECRET`: Clerk webhook secret

Optional:
- `GOOGLE_CLOUD_VISION_CREDENTIALS`: For OCR functionality
- `OPENAI_API_KEY`: For AI-powered recipe parsing

## Database Migrations

To create a new migration after model changes:
```bash
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## Features

- **Authentication**: Clerk-based user authentication
- **Recipe Management**: Full CRUD operations for recipes
- **Meal Planning**: Create and manage meal plans
- **Recipe Parsing**: Extract recipes from URLs, images, and Instagram
- **Search & Filtering**: Advanced recipe search and filtering
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API Documentation**: Auto-generated OpenAPI/Swagger docs