# cricheroes_assignment
# CricHeroes 🏏

**Cricket IPL Points Table Position Calculator** - Predict what performance your team needs to reach a desired position based on Net Run Rate (NRR) calculations.

![Status](https://img.shields.io/badge/status-active-success)
![Tests](https://img.shields.io/badge/tests-71%2F71%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Testing Strategy](#testing-strategy)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

It is a web application that helps cricket teams understand what performance they need to reach a desired position in the IPL standings. It calculates scenarios based on:

- **Net Run Rate (NRR)**: `(Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled)`
- **Current standings**: Points, wins, losses, NRR
- **Match scenarios**: Batting first vs bowling first

### Example Use Case
*Rajasthan Royals wants to reach 3rd position. What runs do they need to score against Delhi Capitals?*

The app calculates the exact performance needed based on how other teams will perform.

---

## Features

✨ **Core Features:**
- 📊 Real-time IPL points table display
- 🎯 Position target calculator
- 📈 NRR-based ranking system
- 🧮 Automatic performance calculation
- ✅ Form validation and error handling


---

## Tech Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Morgan** - HTTP logging

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **PropTypes** - Type checking

### Testing
- **Jest** - Test framework
- **Supertest** - HTTP assertions
- **React Testing Library** - Component testing

---

## Prerequisites

Make sure you have installed:

- **Node.js** (v18+): [Download](https://nodejs.org/)
- **npm** (v9+): Comes with Node.js
- **Git** (optional): [Download](https://git-scm.com/)

### Verify Installation
```bash
node --version      # Should be v18+
npm --version       # Should be v9+
```

---

## Installation

### Step 1: Clone or Download Repository
```bash
# Clone the repository
git clone https://github.com/yourusername/cricheroes.git

```

### Step 2: Setup Backend
```bash
cd Backend
npm install
```

### Step 3: Setup Frontend
```bash
cd frontend
npm install
```

### Step 4: Verify Installation
```bash
# Check backend dependencies
cd Backend
npm list express jest supertest

# Check frontend dependencies
cd frontend
npm list react axios jest
```

---

## Running the Application

### Option 1: Run Everything Together (3 Terminals)

**Terminal 1 - Backend Server:**
```bash
cd "d:\cricketheroes assignment\Backend"
npm run dev
```
Expected output:
```
✅ Server up and running! Listening on port 4000
```

**Terminal 2 - Frontend Development Server:**
```bash
cd "d:\cricketheroes assignment\frontend"
npm run dev
```
Expected output:
```
VITE v4.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

**Terminal 3 - Run Tests (Optional):**
```bash
# Backend tests
cd "d:\cricketheroes assignment\Backend"
npm test

# Frontend tests (in another terminal)
cd "d:\cricketheroes assignment\frontend"
npm test
```

### Option 2: Backend Only (API Testing)
```bash
cd Backend
npm run dev
```

Then test API endpoints using curl or Postman:
```bash
# Get current points table
curl http://localhost:4000/api/points-table

# Simulate a match
curl -X POST http://localhost:4000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "yourTeam": "RR",
    "opposition": "DC",
    "mode": "exact",
    "matchOvers": 20,
    "yourRuns": 160,
    "yourOvers": "20.0",
    "oppRuns": 150,
    "oppOvers": "20.0"
  }'
```

### Option 3: Production Build
```bash
# Build frontend
cd frontend
npm run build
npm run preview

# This will create optimized production files
```

---

## Running Tests

### Backend Tests (40 tests)

```bash
cd Backend

# Run tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Expected Output:**
```
Test Suites: 2 passed, 2 total
Tests:       40 passed, 40 total
```

### Frontend Tests (31 tests)

```bash
cd frontend

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Expected Output:**
```
Test Suites: 4 passed, 4 total
Tests:       31 passed, 31 total
```

### Run All Tests at Once

```bash
# Backend tests
cd Backend && npm test

# Frontend tests (in new terminal)
cd frontend && npm test
```

**Combined Total: 71 tests - 100% passing ✅**

---

## API Endpoints

### Base URL
```
http://localhost:4000/api
```

### Endpoints

#### 1. Get Current Points Table
```http
GET /api/points-table
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "RR",
      "name": "Rajasthan Royals",
      "matches": 14,
      "won": 7,
      "lost": 7,
      "pts": 14,
      "nrr": 0.5,
      "for": { "runs": 1450, "balls": 1680 },
      "against": { "runs": 1470, "balls": 1680 }
    }
  ]
}
```

#### 2. Calculate Match Outcome
```http
POST /api/calculate
Content-Type: application/json
```

**Request Body (Exact Mode):**
```json
{
  "yourTeam": "RR",
  "opposition": "DC",
  "mode": "exact",
  "matchOvers": 20,
  "yourRuns": 160,
  "yourOvers": "20.0",
  "oppRuns": 150,
  "oppOvers": "20.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exact match simulated",
  "matchStats": {
    "yourRuns": 160,
    "yourOvers": "20.0",
    "oppRuns": 150,
    "oppOvers": "20.0"
  },
  "yourTeamResult": { /* updated team stats */ },
  "oppositionResult": { /* updated opposition stats */ },
  "fullTable": [ /* new standings */ ]
}
```

---

## Project Structure

```
cricheroes/
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── matchController.js      # API route handlers
│   │   ├── models/
│   │   │   └── pointsTable.js          # Data + utilities
│   │   └── routes/
│   │       └── matchRoutes.js          # Route definitions
│   ├── tests/
│   │   ├── pointsTable.test.js         # 28 unit tests
│   │   └── api.integration.test.js     # 12 integration tests
│   ├── server.js                       # Express server
│   ├── package.json
│   ├── jest.config.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     # Main component
│   │   ├── components/
│   │   │   ├── MatchForm.jsx           # Form for input
│   │   │   ├── PointsTable.jsx         # Display standings
│   │   │   └── ResultDisplay.jsx       # Show results
│   │   ├── services/
│   │   │   └── api.js                  # API wrapper
│   │   ├── __tests__/
│   │   │   └── App.test.jsx            # 6 app tests
│   │   └── components/__tests__/
│   │       ├── MatchForm.test.jsx      # 9 form tests
│   │       └── PointsTable.test.jsx    # 8 table tests
│   ├── package.json
│   ├── jest.config.js
│   ├── .babelrc
│   ├── vite.config.js
│   └── index.html
│
└── README.md
```

---

## How It Works

### 1. Data Model
Each team has:
- `matches`: Total matches played
- `won`: Matches won
- `lost`: Matches lost
- `pts`: Total points (2 per win, 0 per loss)
- `for`: Cumulative runs/overs scored
- `against`: Cumulative runs/overs conceded
- `nrr`: Net Run Rate

### 2. NRR Calculation
```
NRR = (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled)
```

Example:
- Team A: 180 runs in 20 overs vs 160 runs in 20 overs
- NRR = (180/20) - (160/20) = 9 - 8 = 1.0

### 3. Ranking
Teams are sorted by:
1. **Points** (higher is better)
2. **NRR** (tiebreaker - higher is better)
3. **Wins** (secondary tiebreaker)

### 4. Match Simulation
When you simulate a match:
1. Update team stats (matches, wins, points)
2. Update runs for/against for both teams
3. Recalculate NRR for all teams
4. Re-sort standings
5. Return new positions

---

## Testing Strategy

### Test Coverage: 71 Tests (100% Passing)

#### Backend Tests (40)
- **Unit Tests (28)**: Overs parsing, NRR calculation, utilities
- **Integration Tests (12)**: API endpoints, validation, error handling

#### Frontend Tests (31)
- **Component Tests (15)**: App, MatchForm, PointsTable rendering
- **Service Tests (8)**: API wrapper functions
- **Integration Tests (8)**: Form validation, API calls

### Test Execution

```bash
# All backend tests
cd Backend && npm test

# All frontend tests
cd frontend && npm test

# Watch mode (auto-rerun)
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Development Workflow

### 1. Make Changes
Edit files in `src/` directories

### 2. Run Tests
```bash
npm test:watch
```

### 3. Check API (Backend)
```bash
curl http://localhost:4000/api/points-table
```

### 4. Check UI (Frontend)
Open http://localhost:5173 in browser

### 5. Build for Production
```bash
# Frontend
cd frontend && npm run build

# This creates dist/ folder with optimized files
```

---

## Environment Variables

### Backend (.env)
```
PORT=4000

```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000
```

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 4000
netstat -ano | findstr :4000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
```

### Tests Failing
```bash
# Update node modules
npm install

# Clear jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose
```

### Frontend Won't Build
```bash
# Clear Vite cache
rm -r .vite

# Rebuild
npm run build
```

---

## Performance Tips

- Use watch mode during development
- Keep backend and frontend servers running separately
- Clear browser cache if UI doesn't update
- Use coverage reports to identify untested code

---



---

### Code Standards
- All tests must pass
- Add tests for new features
- Follow existing code style
- Update README for new features

---



## Quick Reference

```bash
# Initial Setup
cd Backend && npm install && cd ../frontend && npm install

# Development (3 terminals needed)
# Terminal 1
cd Backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Terminal 3 (Optional - Run tests)
cd Backend && npm test

# Testing
npm test                # Run once
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Production Build
cd frontend && npm run build

# API Testing (curl)
curl http://localhost:4000/api/points-table
```




**Made with ❤️ by Shubham Patel**

Happy coding! 🚀
