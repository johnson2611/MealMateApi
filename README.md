# 🍽️ MealMate API

A production-grade REST API for smart meal planning and recipe discovery. Built with Node.js, Express, PostgreSQL (Prisma), Socket.io, and AI-powered features via groq.

## Features

- **JWT Authentication** — Secure register/login with access & refresh tokens
- **Recipe CRUD** — Full management of personal recipes with pagination & search
- **Meal Planning** — Weekly meal planner with day/meal-type slots
- **Recipe Discovery** — Search millions of recipes via Spoonacular API
- **AI-Powered** — Recipe suggestions, shopping list generation, and meal plan analysis via Claude AI
- **Real-time Kitchen** — WebSocket rooms for cooking together live
- **API Docs** — Interactive Swagger UI at `/api/docs`
- **Rate Limiting** — Global + per-endpoint limits
- **Input Validation** — Zod schemas on all endpoints

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Spoonacular API key (free at [spoonacular.com](https://spoonacular.com/food-api))
- groq API key (at [console.anthropic.com](https://console.groq.com))

### Installation

```bash
git clone <your-repo>
cd mealmate-api
npm install

# Set up environment variables
.env
# Edit .env with your values

# Set up database
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run dev
```

### Running Tests

```bash
npm test
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/refresh` | Refresh token | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| GET | `/api/recipes` | List your recipes | ✅ |
| POST | `/api/recipes` | Create recipe | ✅ |
| GET | `/api/recipes/:id` | Get recipe | ✅ |
| PUT | `/api/recipes/:id` | Update recipe | ✅ |
| DELETE | `/api/recipes/:id` | Delete recipe | ✅ |
| GET | `/api/mealplan/week` | Get weekly plan | ✅ |
| POST | `/api/mealplan` | Add meal to plan | ✅ |
| PUT | `/api/mealplan/:itemId` | Update meal | ✅ |
| DELETE | `/api/mealplan/:itemId` | Remove meal | ✅ |
| GET | `/api/discover?query=pasta` | Search recipes | ✅ |
| GET | `/api/discover/random` | Random recipes | ✅ |
| GET | `/api/discover/:id` | Recipe details | ✅ |
| POST | `/api/ai/suggest` | AI recipe suggestions | ✅ |
| POST | `/api/ai/shopping-list` | Generate shopping list | ✅ |
| POST | `/api/ai/analyze` | Analyze meal plan | ✅ |
| GET | `/health` | Health check | ❌ |
| GET | `/api/docs` | Swagger UI | ❌ |

## WebSocket (Real-time Kitchen)

Connect to `/kitchen` namespace with JWT auth:

```js
const socket = io('http://localhost:3000/kitchen', {
  auth: { token: 'your_jwt_token' }
});

socket.emit('join_room', { roomId: 'room123', username: 'Chef Ada', recipe });
socket.emit('next_step');
socket.emit('chat_message', { message: 'The onions are ready!' });
socket.emit('start_timer', { duration: 300, label: 'Simmer sauce' });
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod
- **Real-time**: Socket.io
- **AI**: Anthropic Claude API
- **3rd-party**: Spoonacular API
- **Docs**: Swagger UI
- **Testing**: Jest + Supertest
- **Deployment**: Railway / Render / Fly.io

## Deployment

```bash
# Build
npm install --production
npx prisma generate
npx prisma migrate deploy

# Start
npm start
```

## Project Structure

```
src/
├── config/         # Prisma client, Swagger config
├── controllers/    # Business logic
├── middleware/     # Auth guard, error handler
├── routes/         # Express routers + Swagger JSDoc
├── sockets/        # Socket.io kitchen namespace
├── app.js          # Express app setup
└── server.js       # HTTP server + Socket.io init
tests/              # Jest + Supertest tests
prisma/             # Database schema
```
