
'use strict';

const deepClone = obj => JSON.parse(JSON.stringify(obj));

const pointsTable = [
  {
    id: 'CSK',
    name: 'Chennai Super Kings',
    matches: 7,
    won: 5,
    lost: 2,
    pts: 10,
    for: { runs: 1130, balls: 799 },
    against: { runs: 1071, balls: 833 },
    nrr: 0.771
  },
  {
    id: 'RCB',
    name: 'Royal Challengers Bangalore',
    matches: 7,
    won: 4,
    lost: 3,
    pts: 8,
    for: { runs: 1217, balls: 840 },
    against: { runs: 1066, balls: 790 },
    nrr: 0.597
  },
  {
    id: 'DC',
    name: 'Delhi Capitals',
    matches: 7,
    won: 4,
    lost: 3,
    pts: 8,
    for: { runs: 1085, balls: 756 },
    against: { runs: 1136, balls: 822 },
    nrr: 0.319
  },
  {
    id: 'RR',
    name: 'Rajasthan Royals',
    matches: 7,
    won: 3,
    lost: 4,
    pts: 6,
    for: { runs: 1066, balls: 770 },
    against: { runs: 1094, balls: 823 },
    nrr: 0.331
  },
  {
    id: 'MI',
    name: 'Mumbai Indians',
    matches: 8,
    won: 2,
    lost: 6,
    pts: 4,
    for: { runs: 1003, balls: 932 },
    against: { runs: 1134, balls: 829 },
    nrr: -1.75
  }
];


// Convert overs string (e.g., "18.3") or object to total balls
function parseOversToBalls(oversInput) {
  if (oversInput === null || oversInput === undefined) {
    throw new Error('overs input required');
  }

  if (typeof oversInput === 'number' && Number.isInteger(oversInput)) {
    return oversInput * 6;
  }

  if (typeof oversInput === 'string') {
    if (!/^\d+(\.\d+)?$/.test(oversInput.trim())) {
      throw new Error(`invalid overs string "${oversInput}"`);
    }
    const parts = oversInput.split('.');
    const overs = parseInt(parts[0], 10);
    const balls = parts.length > 1 ? parseInt(parts[1].slice(0, 2), 10) : 0;
    if (balls >= 6) {
      throw new Error('balls part must be between 0 and 5 (inclusive)');
    }
    return overs * 6 + (isNaN(balls) ? 0 : balls);
  }

  if (typeof oversInput === 'object' && oversInput !== null) {
    const overs = Number(oversInput.overs) || 0;
    const balls = Number(oversInput.balls) || 0;
    if (!Number.isInteger(balls) || balls < 0 || balls >= 6) {
      throw new Error('balls must be integer between 0 and 5');
    }
    return overs * 6 + balls;
  }

  throw new Error('unsupported overs input type');
}

// Convert total balls to decimal overs
function ballsToDecimalOvers(totalBalls) {
  return totalBalls / 6.0;
}

// Calculate NRR from runs and balls
function computeNRR(forRuns, forBalls, againstRuns, againstBalls) {
  const forOvers = forBalls === 0 ? 0.000001 : ballsToDecimalOvers(forBalls);
  const againstOvers = againstBalls === 0 ? 0.000001 : ballsToDecimalOvers(againstBalls);

  const runRateFor = forRuns / forOvers;
  const runRateAgainst = againstRuns / againstOvers;
  return runRateFor - runRateAgainst;
}

// Recalculate NRR for all teams in the table
function recalcTableNRR(table, mutate = false) {
  const tbl = mutate ? table : deepClone(table);
  tbl.forEach(team => {
    team.nrr = computeNRR(team.for.runs, team.for.balls, team.against.runs, team.against.balls);
  });
  return tbl;
}

// Find team by ID or name (case-insensitive)
function findTeamIndex(table, teamKey) {
  const key = String(teamKey).toLowerCase();
  return table.findIndex(
    t => t.id.toLowerCase() === key || t.name.toLowerCase() === key
  );
}

// Get a deep clone of the current points table
function getPointsTableSnapshot() {
  const cloned = deepClone(pointsTable);
  recalcTableNRR(cloned, true);
  return cloned;
}

module.exports = {
  pointsTable, 
  getPointsTableSnapshot,
  parseOversToBalls,
  ballsToDecimalOvers,
  computeNRR,
  recalcTableNRR,
  findTeamIndex,
  deepClone
};
