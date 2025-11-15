'use strict';

const pointsTableModel = require('../models/pointsTable');

const EPSILON = 1e-9;

// Sort teams: points desc, then NRR desc, then wins desc
function sortTable(table) {
  return table.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const nrrDiff = (b.nrr || 0) - (a.nrr || 0);
    if (Math.abs(nrrDiff) > EPSILON) return nrrDiff;
    return (b.won || 0) - (a.won || 0);
  });
}

function findTeam(table, teamId) {
  return pointsTableModel.findTeamIndex(table, teamId);
}

function cloneTeam(team) {
  return pointsTableModel.deepClone(team);
}

// Update team stats after match result
function updateTeamStats(team, runsScored, ballsFaced, runsConceded, ballsConceded, matchResult) {
  team.matches++;
  team.for.runs += runsScored;
  team.for.balls += ballsFaced;
  team.against.runs += runsConceded;
  team.against.balls += ballsConceded;
  
  if (matchResult === 'win') {
    team.won++;
    team.pts += 2;
  } else if (matchResult === 'loss') {
    team.lost++;
  } else {
    team.pts++; // tie
  }
}

// Simulate match and return updated table
function simulateMatch(table, firstTeamId, secondTeamId, firstTeamRuns, firstTeamOvers, secondTeamRuns, secondTeamOvers) {
  const updatedTable = table.map(cloneTeam);
  
  const firstTeamIndex = findTeam(updatedTable, firstTeamId);
  const secondTeamIndex = findTeam(updatedTable, secondTeamId);
  
  if (firstTeamIndex === -1 || secondTeamIndex === -1) throw new Error('Team not found');
  
  const firstTeamBalls = pointsTableModel.parseOversToBalls(firstTeamOvers);
  const secondTeamBalls = pointsTableModel.parseOversToBalls(secondTeamOvers);
  
  // Determine match result
  let firstTeamResult, secondTeamResult;
  if (firstTeamRuns > secondTeamRuns) {
    firstTeamResult = 'win';
    secondTeamResult = 'loss';
  } else if (firstTeamRuns < secondTeamRuns) {
    firstTeamResult = 'loss';
    secondTeamResult = 'win';
  } else {
    firstTeamResult = secondTeamResult = 'tie';
  }
  
  updateTeamStats(updatedTable[firstTeamIndex], firstTeamRuns, firstTeamBalls, secondTeamRuns, secondTeamBalls, firstTeamResult);
  updateTeamStats(updatedTable[secondTeamIndex], secondTeamRuns, secondTeamBalls, firstTeamRuns, firstTeamBalls, secondTeamResult);
  
  pointsTableModel.recalcTableNRR(updatedTable, true);
  
  return sortTable(updatedTable);
}

// Get position and NRR after simulated match
function getPositionAfterMatch(table, yourTeamId, opponentTeamId, yourTeamRuns, yourTeamOvers, opponentTeamRuns, opponentTeamOvers) {
  const updated = simulateMatch(table, yourTeamId, opponentTeamId, yourTeamRuns, yourTeamOvers, opponentTeamRuns, opponentTeamOvers);
  const teamIndex = findTeam(updated, yourTeamId);
  return {
    position: teamIndex + 1,
    nrr: updated[teamIndex].nrr,
    points: updated[teamIndex].pts
  };
}

function ballsToOvers(balls) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function formatOvers(overs) {
  return String(overs).includes('.') ? String(overs) : `${overs}.0`;
}

// Calculate range when batting first
function battingFirstRange(yourTeam, oppTeam, desiredPos, yourRuns, matchOvers) {
  const baselineTable = pointsTableModel.getPointsTableSnapshot();
  const overs = formatOvers(matchOvers);
  
  let minRuns = null, maxRuns = null;
  let minNRR = null, maxNRR = null;
  
  // Test all opponent scores from 0 to yourRuns-1 (you win)
  for (let oppRuns = 0; oppRuns < yourRuns; oppRuns++) {
    const tableClone = baselineTable.map(cloneTeam);
    const result = getPositionAfterMatch(tableClone, yourTeam, oppTeam, yourRuns, overs, oppRuns, overs);
    
    if (result.position <= desiredPos) {
      if (minRuns === null) {
        minRuns = oppRuns;
        minNRR = result.nrr;
      }
      maxRuns = oppRuns;
      maxNRR = result.nrr;
    }
  }
  
  if (minRuns === null) return { success: false };
  
  return {
    success: true,
    yourRuns,
    overs,
    restrictTo: { min: minRuns, max: maxRuns },
    nrrRange: { min: minNRR.toFixed(3), max: maxNRR.toFixed(3) }
  };
}

// Calculate range when bowling first (chasing)
function bowlingFirstRange(yourTeam, oppTeam, desiredPos, oppRuns, matchOvers) {
  const baselineTable = pointsTableModel.getPointsTableSnapshot();
  const overs = formatOvers(matchOvers);
  const target = oppRuns + 1; // chase target
  const maxBalls = pointsTableModel.parseOversToBalls(overs);
  
  let minBalls = null, maxBalls_valid = null;
  let minNRR = null, maxNRR = null;
  
  // Test all possible balls from 1 to maxBalls (you win by chasing)
  for (let balls = 1; balls <= maxBalls; balls++) {
    const tableClone = baselineTable.map(cloneTeam);
    const chasingOvers = ballsToOvers(balls);
    const result = getPositionAfterMatch(tableClone, yourTeam, oppTeam, target, chasingOvers, oppRuns, overs);
    
    if (result.position <= desiredPos) {
      if (minBalls === null) {
        minBalls = balls;
        minNRR = result.nrr;
      }
      maxBalls_valid = balls;
      maxNRR = result.nrr;
    }
  }
  
  if (minBalls === null) return { success: false };
  
  return {
    success: true,
    chaseTarget: oppRuns,
    chaseIn: { min: ballsToOvers(minBalls), max: ballsToOvers(maxBalls_valid) },
    nrrRange: { min: minNRR.toFixed(3), max: maxNRR.toFixed(3) }
  };
}

module.exports = {
  simulateMatch,
  sortTable,
  findTeam,
  battingFirstRange,
  bowlingFirstRange
};