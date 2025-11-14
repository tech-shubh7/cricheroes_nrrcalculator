// backend/src/services/positionCalculator.js
// Simplified Position Calculator - FIXED VERSION
// Properly converts balls to overs format without errors

'use strict';

const pointsTableModel = require('../models/pointsTable');
const nrrCalculator = require('./nrrCalculator');

// Small number for comparing decimals
const EPS = 0.000000001;

/**
 * Sort table by points, NRR, and wins
 */
function sortTable(table) {
  const sorted = table.slice(); // Make a copy

  // Simple bubble sort
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = 0; j < sorted.length - 1 - i; j++) {
      const teamA = sorted[j];
      const teamB = sorted[j + 1];

      // Compare points first
      if (teamB.pts > teamA.pts) {
        const temp = sorted[j];
        sorted[j] = sorted[j + 1];
        sorted[j + 1] = temp;
      } else if (teamB.pts === teamA.pts) {
        // If points are same, compare NRR
        const nrrDiff = teamB.nrr - teamA.nrr;
        if (nrrDiff > EPS) {
          const temp = sorted[j];
          sorted[j] = sorted[j + 1];
          sorted[j + 1] = temp;
        } else if (Math.abs(nrrDiff) < EPS) {
          // If NRR is also same, compare wins
          if (teamB.won > teamA.won) {
            const temp = sorted[j];
            sorted[j] = sorted[j + 1];
            sorted[j + 1] = temp;
          }
        }
      }
    }
  }

  return sorted;
}

/**
 * Find team in table
 */
function findTeam(table, teamId) {
  for (let i = 0; i < table.length; i++) {
    if (table[i].id === teamId) {
      return i;
    }
  }
  return -1;
}

/**
 * Copy table
 */
function copyTable(table) {
  const newTable = [];
  for (let i = 0; i < table.length; i++) {
    const team = table[i];
    const newTeam = {
      id: team.id,
      name: team.name,
      matches: team.matches,
      won: team.won,
      lost: team.lost,
      pts: team.pts,
      nrr: team.nrr,
      for: {
        runs: team.for.runs,
        balls: team.for.balls
      },
      against: {
        runs: team.against.runs,
        balls: team.against.balls
      }
    };
    newTable.push(newTeam);
  }
  return newTable;
}

/**
 * Convert balls to overs format (e.g., 115 balls -> "19.1")
 * This ensures the format is always valid for parseOversToBalls
 */
function ballsToOversString(balls) {
  const oversNum = Math.floor(balls / 6);
  const ballsPart = balls % 6;
  return oversNum + '.' + ballsPart;
}

/**
 * Simulate match and return new table with updated position
 */
function simulateMatchAndGetPosition(table, yourTeamId, oppTeamId, yourRuns, yourOvers, oppRuns, oppOvers) {
  const newTable = copyTable(table);

  // Find teams
  const yourIdx = findTeam(newTable, yourTeamId);
  const oppIdx = findTeam(newTable, oppTeamId);

  if (yourIdx === -1 || oppIdx === -1) {
    return null;
  }

  const yourTeam = newTable[yourIdx];
  const oppTeam = newTable[oppIdx];

  // Convert overs to balls
  const yourBalls = pointsTableModel.parseOversToBalls(yourOvers);
  const oppBalls = pointsTableModel.parseOversToBalls(oppOvers);

  // Update stats
  yourTeam.matches = (yourTeam.matches || 0) + 1;
  oppTeam.matches = (oppTeam.matches || 0) + 1;

  yourTeam.for.runs = (yourTeam.for.runs || 0) + yourRuns;
  yourTeam.for.balls = (yourTeam.for.balls || 0) + yourBalls;
  yourTeam.against.runs = (yourTeam.against.runs || 0) + oppRuns;
  yourTeam.against.balls = (yourTeam.against.balls || 0) + oppBalls;

  oppTeam.for.runs = (oppTeam.for.runs || 0) + oppRuns;
  oppTeam.for.balls = (oppTeam.for.balls || 0) + oppBalls;
  oppTeam.against.runs = (oppTeam.against.runs || 0) + yourRuns;
  oppTeam.against.balls = (oppTeam.against.balls || 0) + yourBalls;

  // Update points and wins/losses
  if (yourRuns > oppRuns) {
    yourTeam.won = (yourTeam.won || 0) + 1;
    yourTeam.pts = (yourTeam.pts || 0) + 2;
    oppTeam.lost = (oppTeam.lost || 0) + 1;
  } else if (yourRuns < oppRuns) {
    oppTeam.won = (oppTeam.won || 0) + 1;
    oppTeam.pts = (oppTeam.pts || 0) + 2;
    yourTeam.lost = (yourTeam.lost || 0) + 1;
  } else {
    yourTeam.pts = (yourTeam.pts || 0) + 1;
    oppTeam.pts = (oppTeam.pts || 0) + 1;
  }

  // Recalculate NRR for all teams
  pointsTableModel.recalcTableNRR(newTable, true);

  // Sort table
  const sortedTable = sortTable(newTable);

  // Find your team's new position
  const newYourIdx = findTeam(sortedTable, yourTeamId);
  const position = newYourIdx + 1; // Position is index + 1

  return {
    table: sortedTable,
    position: position,
    yourTeam: sortedTable[newYourIdx]
  };
}

/**
 * Find range of runs to restrict opponent (batting first scenario)
 */
function findBattingFirstRange(yourTeamId, oppTeamId, desiredPosition, yourRuns, matchOvers) {
  const table = pointsTableModel.getPointsTableSnapshot();
  
  // Ensure overs is in string format with decimal
  const oversString = String(matchOvers).indexOf('.') >= 0 ? String(matchOvers) : String(matchOvers) + '.0';

  // Opponent must score less than yourRuns to lose
  let minRuns = 0;
  let maxRuns = Math.max(0, yourRuns - 1);

  let minValidRuns = null;
  let maxValidRuns = null;

  // Binary search for minimum runs
  let left = minRuns;
  let right = maxRuns;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const result = simulateMatchAndGetPosition(table, yourTeamId, oppTeamId, yourRuns, oversString, mid, oversString);

    if (result && result.position <= desiredPosition) {
      minValidRuns = mid;
      right = mid - 1; // try lower
    } else {
      left = mid + 1;
    }
  }

  // Binary search for maximum runs
  left = minRuns;
  right = maxRuns;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const result = simulateMatchAndGetPosition(table, yourTeamId, oppTeamId, yourRuns, oversString, mid, oversString);

    if (result && result.position <= desiredPosition) {
      maxValidRuns = mid;
      left = mid + 1; // try higher
    } else {
      right = mid - 1;
    }
  }

  // Calculate NRRs from simulated snapshots
  let minNRR = null;
  let maxNRR = null;

  if (minValidRuns !== null) {
    const sim = simulateMatchAndGetPosition(table, yourTeamId, oppTeamId, yourRuns, oversString, minValidRuns, oversString);
    if (sim && sim.yourTeam && typeof sim.yourTeam.nrr === 'number') {
      minNRR = sim.yourTeam.nrr;
    } else {
      const yourTeamIdx = findTeam(table, yourTeamId);
      const yourTeamStats = table[yourTeamIdx];
      minNRR = nrrCalculator.calculateNRRForScenario(yourTeamStats, yourRuns, oversString, minValidRuns, oversString);
    }
  }

  if (maxValidRuns !== null) {
    const sim = simulateMatchAndGetPosition(table, yourTeamId, oppTeamId, yourRuns, oversString, maxValidRuns, oversString);
    if (sim && sim.yourTeam && typeof sim.yourTeam.nrr === 'number') {
      maxNRR = sim.yourTeam.nrr;
    } else {
      const yourTeamIdx = findTeam(table, yourTeamId);
      const yourTeamStats = table[yourTeamIdx];
      maxNRR = nrrCalculator.calculateNRRForScenario(yourTeamStats, yourRuns, oversString, maxValidRuns, oversString);
    }
  }

  return {
    success: minValidRuns !== null && maxValidRuns !== null,
    minRuns: minValidRuns,
    maxRuns: maxValidRuns,
    minNRR: typeof minNRR === 'number' ? Number(minNRR.toFixed(3)) : null,
    maxNRR: typeof maxNRR === 'number' ? Number(maxNRR.toFixed(3)) : null,
    yourRuns: yourRuns,
    overs: oversString
  };
}

/**
 * Find range of overs to chase target (bowling first scenario)
 * FIXED: Properly converts balls to overs format
 */
function findBowlingFirstRange(yourTeamId, oppTeamId, desiredPosition, targetRuns, matchOvers) {
  const table = pointsTableModel.getPointsTableSnapshot();
  
  // Ensure overs is in string format with decimal
  const oversString = String(matchOvers).indexOf('.') >= 0 ? String(matchOvers) : String(matchOvers) + '.0';
  const chasingRuns = targetRuns + 1; // Need to score more than target

  // Convert match overs to balls
  const maxBalls = pointsTableModel.parseOversToBalls(oversString);

  let minValidBalls = null;
  let maxValidBalls = null;

  // Find minimum balls (fastest chase)
  let left = 1; // at least 1 ball to chase
  let right = maxBalls;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    // FIXED: Convert balls to proper overs format
    const oversDecimal = ballsToOversString(mid);
    
    const result = simulateMatchAndGetPosition(table, yourTeamId, oppTeamId, chasingRuns, oversDecimal, targetRuns, oversString);

    if (result && result.position <= desiredPosition) {
      minValidBalls = mid;
      right = mid - 1; // try faster
    } else {
      left = mid + 1;
    }
  }

  // Find maximum balls (slowest chase that still achieves position)
  left = 1;
  right = maxBalls;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    // FIXED: Convert balls to proper overs format
    const oversDecimal = ballsToOversString(mid);
    
    const result = simulateMatchAndGetPosition(table, yourTeamId, oppTeamId, chasingRuns, oversDecimal, targetRuns, oversString);

    if (result && result.position <= desiredPosition) {
      maxValidBalls = mid;
      left = mid + 1; // try slower
    } else {
      right = mid - 1;
    }
  }

  // Calculate NRRs from the simulated snapshots
  let minNRR = null;
  let maxNRR = null;
  let minOversStr = null;
  let maxOversStr = null;

  if (minValidBalls !== null) {
    // FIXED: Convert balls to proper overs format
    minOversStr = ballsToOversString(minValidBalls);
    
    const sim = simulateMatchAndGetPosition(table, yourTeamId, oppTeamId, chasingRuns, minOversStr, targetRuns, oversString);
    if (sim && sim.yourTeam && typeof sim.yourTeam.nrr === 'number') {
      minNRR = sim.yourTeam.nrr;
    } else {
      const yourTeamIdx = findTeam(table, yourTeamId);
      const yourTeamStats = table[yourTeamIdx];
      minNRR = nrrCalculator.calculateNRRForScenario(yourTeamStats, chasingRuns, minOversStr, targetRuns, oversString);
    }
  }

  if (maxValidBalls !== null) {
    // FIXED: Convert balls to proper overs format
    maxOversStr = ballsToOversString(maxValidBalls);
    
    const sim = simulateMatchAndGetPosition(table, yourTeamId, oppTeamId, chasingRuns, maxOversStr, targetRuns, oversString);
    if (sim && sim.yourTeam && typeof sim.yourTeam.nrr === 'number') {
      maxNRR = sim.yourTeam.nrr;
    } else {
      const yourTeamIdx = findTeam(table, yourTeamId);
      const yourTeamStats = table[yourTeamIdx];
      maxNRR = nrrCalculator.calculateNRRForScenario(yourTeamStats, chasingRuns, maxOversStr, targetRuns, oversString);
    }
  }

  return {
    success: minValidBalls !== null && maxValidBalls !== null,
    minOvers: minOversStr,
    maxOvers: maxOversStr,
    minNRR: typeof minNRR === 'number' ? Number(minNRR.toFixed(3)) : null,
    maxNRR: typeof maxNRR === 'number' ? Number(maxNRR.toFixed(3)) : null,
    targetRuns: targetRuns,
    chasingRuns: chasingRuns
  };
}

/**
 * Main function to find required performance range
 */
function findRequiredPerformanceRange(yourTeamId, oppTeamId, desiredPosition, tossResult, runsScored, matchOvers) {
  if (tossResult === 'batting') {
    // Batting first - find range of runs to restrict opponent
    return findBattingFirstRange(yourTeamId, oppTeamId, desiredPosition, runsScored, matchOvers);
  } else {
    // Bowling first (chasing) - find range of overs to chase
    return findBowlingFirstRange(yourTeamId, oppTeamId, desiredPosition, runsScored, matchOvers);
  }
}

module.exports = {
  findRequiredPerformanceRange: findRequiredPerformanceRange,
  simulateMatchAndGetPosition: simulateMatchAndGetPosition,
  findBattingFirstRange: findBattingFirstRange,
  findBowlingFirstRange: findBowlingFirstRange
};