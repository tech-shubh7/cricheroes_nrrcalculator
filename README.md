# cricheroes_assignment
# CricHeroes 🏏

**Cricket IPL Points Table Position Calculator** - Predict what performance your team needs to reach a desired position based on Net Run Rate (NRR) calculations.

![Status](https://img.shields.io/badge/status-active-success)
![Tests](https://img.shields.io/badge/tests-71%2F71%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)


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
  
---

## 🛠 Tech Stack
**Backend:** Node.js, Express, Jest, Supertest  
**Frontend:** React (Vite), Axios, Tailwind, RTL  
**Tests:** 71 total (100% passing)

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
cd "\cricketheroes assignment\Backend"
npm run dev
```
Expected output:
```
✅ Server up and running! Listening on port 4000
```

**Terminal 2 - Frontend Development Server:**
```bash
cd "\cricketheroes assignment\frontend"
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
cd "\cricketheroes assignment\Backend"
npm test

# Frontend tests (in another terminal)
cd "\cricketheroes assignment\frontend"
npm test
```
---

## Running Tests

### Backend Tests (40 tests)

```bash
cd Backend

# Run tests once
npm test

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

```

**Expected Output:**
```
Test Suites: 4 passed, 4 total
Tests:       31 passed, 31 total
```

**Combined Total: 71 tests - 100% passing ✅**

---


## Environment Variables
```
### Backend (.env)

PORT=4000
```

```
### Frontend (.env)

VITE_API_URL=http://localhost:4000
```

**Made with ❤️ by Shubham Patel**

Happy coding! 🚀
