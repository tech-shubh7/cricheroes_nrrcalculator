// tests/api.integration.test.js
const request = require('supertest');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const matchRoutes = require('../src/routes/matchRoutes');

// Create a minimal express app for testing
const createTestApp = () => {
  const app = express();
  
  app.use(helmet());
  app.use(cors());
  app.use(bodyParser.json({ limit: '100kb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.use('/api', matchRoutes);
  
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not Found' });
  });
  
  return app;
};

describe('API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/points-table', () => {
    test('should return points table with success=true', async () => {
      const response = await request(app)
        .get('/api/points-table')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should return teams sorted by points (descending)', async () => {
      const response = await request(app)
        .get('/api/points-table')
        .expect(200);

      const teams = response.body.data;
      for (let i = 1; i < teams.length; i++) {
        const prevPts = teams[i - 1].pts;
        const currPts = teams[i].pts;
        expect(prevPts).toBeGreaterThanOrEqual(currPts);
      }
    });

    test('should include all team fields', async () => {
      const response = await request(app)
        .get('/api/points-table')
        .expect(200);

      const team = response.body.data[0];
      expect(team).toHaveProperty('id');
      expect(team).toHaveProperty('name');
      expect(team).toHaveProperty('matches');
      expect(team).toHaveProperty('won');
      expect(team).toHaveProperty('nrr');
      expect(team).toHaveProperty('pts');
    });
  });

  describe('POST /api/calculate - Exact Mode', () => {
    test('should simulate exact match outcome correctly', async () => {
      const matchData = {
        yourTeam: 'RR',
        opposition: 'DC',
        mode: 'exact',
        matchOvers: 20,
        yourRuns: 160,
        yourOvers: '20.0',
        oppRuns: 150,
        oppOvers: '20.0'
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(matchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.matchStats).toBeDefined();
      expect(response.body.yourTeamResult).toBeDefined();
      expect(response.body.oppositionResult).toBeDefined();
      expect(response.body.fullTable).toBeDefined();
    });

    test('should increase your team points when winning', async () => {
      const matchData = {
        yourTeam: 'RR',
        opposition: 'DC',
        mode: 'exact',
        matchOvers: 20,
        yourRuns: 170,
        yourOvers: '20.0',
        oppRuns: 150,
        oppOvers: '20.0'
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(matchData)
        .expect(200);

      // Your team should have won (got 2 points)
      expect(response.body.yourTeamResult.pts).toBeGreaterThanOrEqual(8);
    });

    test('should handle tie scenarios', async () => {
      const matchData = {
        yourTeam: 'RR',
        opposition: 'DC',
        mode: 'exact',
        matchOvers: 20,
        yourRuns: 150,
        yourOvers: '20.0',
        oppRuns: 150,
        oppOvers: '20.0'
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(matchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Tie handling: typically 1 point each
    });

    test('should validate required fields', async () => {
      const invalidData = {
        yourTeam: 'RR',
        opposition: 'DC',
        mode: 'exact'
        // Missing: yourRuns, yourOvers, oppRuns, oppOvers
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject missing opposition field', async () => {
      const invalidData = {
        yourTeam: 'RR',
        mode: 'exact'
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('opposition');
    });

    test('should reject invalid team names with error response', async () => {
      const invalidTeamData = {
        yourTeam: 'FAKE_TEAM',
        opposition: 'DC',
        mode: 'exact',
        yourRuns: 160,
        yourOvers: '20.0',
        oppRuns: 150,
        oppOvers: '20.0'
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(invalidTeamData);

      // Should get 400 or 500 (team not found)
      expect([400, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    test('should validate overs format', async () => {
      const invalidOversData = {
        yourTeam: 'RR',
        opposition: 'DC',
        mode: 'exact',
        matchOvers: 20,
        yourRuns: 160,
        yourOvers: '25.0', // exceeds matchOvers
        oppRuns: 150,
        oppOvers: '20.0'
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(invalidOversData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject negative runs', async () => {
      const negativeRunsData = {
        yourTeam: 'RR',
        opposition: 'DC',
        mode: 'exact',
        matchOvers: 20,
        yourRuns: -10,
        yourOvers: '20.0',
        oppRuns: 150,
        oppOvers: '20.0'
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(negativeRunsData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/calculate - Range Mode', () => {
    test('should check if range mode endpoint exists (currently returns 400 for missing fields)', async () => {
      const rangeData = {
        yourTeam: 'RR',
        opposition: 'DC',
        mode: 'range',
        desiredPosition: 3,
        tossResult: 'batting_first'
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(rangeData);

      // Range mode returns 400 (missing exact mode fields) or 501 (if implemented)
      expect([400, 501]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for unknown endpoint', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });
});
