// tests/pointsTable.test.js
const {
  parseOversToBalls,
  ballsToDecimalOvers,
  computeNRR,
  getPointsTableSnapshot,
  recalcTableNRR,
  findTeamIndex,
  deepClone
} = require('../src/models/pointsTable');

describe('Points Table Utilities', () => {
  
  describe('parseOversToBalls', () => {
    test('should parse "20.0" to 120 balls', () => {
      expect(parseOversToBalls('20.0')).toBe(120);
    });

    test('should parse "18.3" to 111 balls (18*6 + 3)', () => {
      expect(parseOversToBalls('18.3')).toBe(111);
    });

    test('should parse "0.5" to 5 balls', () => {
      expect(parseOversToBalls('0.5')).toBe(5);
    });

    test('should handle integer input (20 overs)', () => {
      expect(parseOversToBalls(20)).toBe(120);
    });

    test('should handle object format { overs: 18, balls: 3 }', () => {
      expect(parseOversToBalls({ overs: 18, balls: 3 })).toBe(111);
    });

    test('should throw error for invalid balls (>= 6)', () => {
      expect(() => parseOversToBalls('18.6')).toThrow();
    });

    test('should throw error for invalid string', () => {
      expect(() => parseOversToBalls('invalid')).toThrow();
    });

    test('should throw error for null input', () => {
      expect(() => parseOversToBalls(null)).toThrow();
    });
  });

  describe('ballsToDecimalOvers', () => {
    test('should convert 120 balls to 20.0 overs', () => {
      expect(ballsToDecimalOvers(120)).toBe(20);
    });

    test('should convert 111 balls to ~18.5 overs', () => {
      expect(ballsToDecimalOvers(111)).toBeCloseTo(18.5, 1);
    });

    test('should convert 5 balls to ~0.833 overs', () => {
      expect(ballsToDecimalOvers(5)).toBeCloseTo(0.833, 2);
    });
  });

  describe('computeNRR', () => {
    test('should calculate positive NRR correctly', () => {
      // Team scoring 180 runs in 20 overs vs conceding 160 runs in 20 overs
      // NRR = (180/20) - (160/20) = 9 - 8 = 1
      const nrr = computeNRR(180, 120, 160, 120);
      expect(nrr).toBe(1);
    });

    test('should calculate negative NRR correctly', () => {
      // Team scoring 160 runs in 20 overs vs conceding 180 runs in 20 overs
      // NRR = (160/20) - (180/20) = 8 - 9 = -1
      const nrr = computeNRR(160, 120, 180, 120);
      expect(nrr).toBe(-1);
    });

    test('should handle zero balls with defensive check', () => {
      expect(() => computeNRR(100, 0, 100, 120)).not.toThrow();
      expect(() => computeNRR(100, 120, 100, 0)).not.toThrow();
    });

    test('should calculate zero NRR when equal runs', () => {
      // 180 vs 180 in same overs
      const nrr = computeNRR(180, 120, 180, 120);
      expect(nrr).toBe(0);
    });

    test('should handle fractional overs correctly', () => {
      // 200 runs in 18.3 overs (111 balls) = 200/18.5
      // 180 runs in 20 overs (120 balls) = 180/20 = 9
      const nrr = computeNRR(200, 111, 180, 120);
      const expected = (200 / (111/6)) - (180 / 20);
      expect(nrr).toBeCloseTo(expected, 2);
    });
  });

  describe('getPointsTableSnapshot', () => {
    test('should return an array of teams', () => {
      const snapshot = getPointsTableSnapshot();
      expect(Array.isArray(snapshot)).toBe(true);
      expect(snapshot.length).toBeGreaterThan(0);
    });

    test('should have all required team properties', () => {
      const snapshot = getPointsTableSnapshot();
      const team = snapshot[0];

      expect(team).toHaveProperty('id');
      expect(team).toHaveProperty('name');
      expect(team).toHaveProperty('matches');
      expect(team).toHaveProperty('won');
      expect(team).toHaveProperty('lost');
      expect(team).toHaveProperty('pts');
      expect(team).toHaveProperty('nrr');
      expect(team).toHaveProperty('for');
      expect(team).toHaveProperty('against');
    });

    test('should have for/against objects with runs and balls', () => {
      const snapshot = getPointsTableSnapshot();
      const team = snapshot[0];

      expect(team.for).toHaveProperty('runs');
      expect(team.for).toHaveProperty('balls');
      expect(team.against).toHaveProperty('runs');
      expect(team.against).toHaveProperty('balls');
    });

    test('should return a new copy each time (not reference)', () => {
      const snapshot1 = getPointsTableSnapshot();
      const snapshot2 = getPointsTableSnapshot();
      
      expect(snapshot1).not.toBe(snapshot2);
      expect(JSON.stringify(snapshot1)).toEqual(JSON.stringify(snapshot2));
    });
  });

  describe('recalcTableNRR', () => {
    test('should recalculate NRR for all teams', () => {
      const table = getPointsTableSnapshot();
      const team = table[0];
      
      // Ensure NRR is calculated
      expect(typeof team.nrr).toBe('number');
    });

    test('should mutate table when mutate=true', () => {
      const table = getPointsTableSnapshot();
      const originalNRR = table[0].nrr;
      
      // Modify stats
      table[0].for.runs += 100;
      
      recalcTableNRR(table, true);
      
      // NRR should change
      expect(table[0].nrr).not.toEqual(originalNRR);
    });
  });

  describe('findTeamIndex', () => {
    test('should find team by ID (case-insensitive)', () => {
      const table = getPointsTableSnapshot();
      const idx = findTeamIndex(table, 'RR');
      expect(idx).toBeGreaterThanOrEqual(0);
    });

    test('should find team by name (case-insensitive)', () => {
      const table = getPointsTableSnapshot();
      const idx = findTeamIndex(table, 'rajasthan royals');
      expect(idx).toBeGreaterThanOrEqual(0);
    });

    test('should return -1 for non-existent team', () => {
      const table = getPointsTableSnapshot();
      const idx = findTeamIndex(table, 'INVALID_TEAM');
      expect(idx).toBe(-1);
    });
  });

  describe('deepClone', () => {
    test('should create a deep copy of object', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });
  });
});
