// Backend match calculation controller

'use strict';

const pointsTableModel = require('../models/pointsTable');
const positionCalculator = require('../services/positionCalculator');
const nrrCalculator = require('../services/nrrCalculator');

const EPS = 0.000000001;

// GET /api/points-table - Return current points table
function getPointsTable(req, res) {
  try {
    const snapshot = pointsTableModel.getPointsTableSnapshot();
    const sortedTable = sortTable(snapshot);

    return res.json({
      success: true,
      data: sortedTable
    });
  } catch (err) {
    console.error('GET points-table error', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Sort table by points (descending), NRR (descending), then wins (descending)
function sortTable(table) {
  const sorted = table.slice();

  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = 0; j < sorted.length - 1 - i; j++) {
      const teamA = sorted[j];
      const teamB = sorted[j + 1];

      if (teamB.pts > teamA.pts) {
        const temp = sorted[j];
        sorted[j] = sorted[j + 1];
        sorted[j + 1] = temp;
      } else if (teamB.pts === teamA.pts) {
        const nrrDiff = (teamB.nrr || 0) - (teamA.nrr || 0);
        if (nrrDiff > EPS) {
          const temp = sorted[j];
          sorted[j] = sorted[j + 1];
          sorted[j + 1] = temp;
        } else if (Math.abs(nrrDiff) < EPS) {
          if ((teamB.won || 0) > (teamA.won || 0)) {
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

// Find team index in table
function findTeam(table, teamId) {
  for (let i = 0; i < table.length; i++) {
    if (table[i].id === teamId) {
      return i;
    }
  }
  return -1;
}

// Deep clone a table
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

// Apply match outcome to the points table
function applyMatchOutcome(snapshot, yourId, oppId, matchStats) {
  // Find teams in table
  const yourIndex = findTeam(snapshot, yourId);
  const oppIndex = findTeam(snapshot, oppId);

  if (yourIndex === -1 || oppIndex === -1) {
    throw new Error('Team not found in points table');
  }

  const yourTeam = snapshot[yourIndex];
  const oppTeam = snapshot[oppIndex];

  // Convert overs to balls
  const yourBalls = pointsTableModel.parseOversToBalls(matchStats.yourOvers);
  const oppBalls = pointsTableModel.parseOversToBalls(matchStats.oppOvers);

  const yourRuns = Number(matchStats.yourRuns);
  const oppRuns = Number(matchStats.oppRuns);

  // Validate runs
  if (isNaN(yourRuns) || isNaN(oppRuns)) {
    throw new Error('Invalid run values');
  }
  if (yourRuns < 0 || oppRuns < 0) {
    throw new Error('Runs cannot be negative');
  }

  // Update match count
  yourTeam.matches = (yourTeam.matches || 0) + 1;
  oppTeam.matches = (oppTeam.matches || 0) + 1;

  // Update runs and balls for your team
  yourTeam.for.runs = (yourTeam.for.runs || 0) + yourRuns;
  yourTeam.for.balls = (yourTeam.for.balls || 0) + yourBalls;
  yourTeam.against.runs = (yourTeam.against.runs || 0) + oppRuns;
  yourTeam.against.balls = (yourTeam.against.balls || 0) + oppBalls;

  // Update runs and balls for opponent team
  oppTeam.for.runs = (oppTeam.for.runs || 0) + oppRuns;
  oppTeam.for.balls = (oppTeam.for.balls || 0) + oppBalls;
  oppTeam.against.runs = (oppTeam.against.runs || 0) + yourRuns;
  oppTeam.against.balls = (oppTeam.against.balls || 0) + yourBalls;

  // Determine winner and update points
  if (yourRuns > oppRuns) {
    // Your team won
    yourTeam.won = (yourTeam.won || 0) + 1;
    yourTeam.pts = (yourTeam.pts || 0) + 2;
    oppTeam.lost = (oppTeam.lost || 0) + 1;
  } else if (yourRuns < oppRuns) {
    // Opponent won
    oppTeam.won = (oppTeam.won || 0) + 1;
    oppTeam.pts = (oppTeam.pts || 0) + 2;
    yourTeam.lost = (yourTeam.lost || 0) + 1;
  } else {
    // Tie - give 1 point to each
    yourTeam.pts = (yourTeam.pts || 0) + 1;
    oppTeam.pts = (oppTeam.pts || 0) + 1;
  }

  // Recalculate NRR for all teams
  if (typeof pointsTableModel.recalcTableNRR === 'function') {
    pointsTableModel.recalcTableNRR(snapshot, true);
  } else if (typeof pointsTableModel.computeNRR === 'function') {
    // best-effort fallback: recompute just for the two teams
    try {
      const y = yourTeam;
      const o = oppTeam;
      y.nrr = pointsTableModel.computeNRR(y.for.runs, y.for.balls, y.against.runs, y.against.balls);
      o.nrr = pointsTableModel.computeNRR(o.for.runs, o.for.balls, o.against.runs, o.against.balls);
    } catch (e) {
      // ignore fallback errors
      console.warn('Fallback NRR compute failed', e);
    }
  }

  // Sort the table again
  const sortedTable = sortTable(snapshot);

  return sortedTable;
}

// Format output for NRR value
function _fmtNRRval(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  return Number(Number(n).toFixed(3));
}

// Format output for batting first scenario
function formatBattingFirstOutput(yourTeamName, oppTeamName, result) {
  if (!result || !result.success) {
    return {
      message: 'Cannot achieve desired position with given parameters',
      canAchieve: false
    };
  }

  const minNRRFormatted = (result.minNRR !== null && result.minNRR !== undefined) ? _fmtNRRval(result.minNRR) : null;
  const maxNRRFormatted = (result.maxNRR !== null && result.maxNRR !== undefined) ? _fmtNRRval(result.maxNRR) : null;

  // Human-friendly message (safe formatting)
  const messageParts = [
    `If ${yourTeamName} scores ${result.yourRuns} runs in ${result.overs} overs,`,
    `${yourTeamName} needs to restrict ${oppTeamName} between ${result.minRuns} to ${result.maxRuns} runs in ${result.overs}.`
  ];

  if (minNRRFormatted !== null && maxNRRFormatted !== null) {
    messageParts.push(`Revised NRR of ${yourTeamName} will be between ${minNRRFormatted.toFixed(3)} to ${maxNRRFormatted.toFixed(3)}.`);
  } else {
    messageParts.push('NRR values could not be computed for the scenario.');
  }

  return {
    message: messageParts.join(' '),
    canAchieve: true,
    minRuns: result.minRuns,
    maxRuns: result.maxRuns,
    minNRR: minNRRFormatted,
    maxNRR: maxNRRFormatted,
    yourRuns: result.yourRuns,
    overs: result.overs
  };
}

// Format output for bowling first scenario
function formatBowlingFirstOutput(yourTeamName, oppTeamName, result) {
  if (!result || !result.success) {
    return {
      message: 'Cannot achieve desired position with given parameters',
      canAchieve: false
    };
  }

  const minNRRFormatted = (result.minNRR !== null && result.minNRR !== undefined) ? _fmtNRRval(result.minNRR) : null;
  const maxNRRFormatted = (result.maxNRR !== null && result.maxNRR !== undefined) ? _fmtNRRval(result.maxNRR) : null;

  const messageParts = [
    `${yourTeamName} needs to chase ${result.targetRuns} runs between ${result.minOvers} and ${result.maxOvers} overs.`
  ];

  if (minNRRFormatted !== null && maxNRRFormatted !== null) {
    messageParts.push(`Revised NRR for ${yourTeamName} will be between ${minNRRFormatted.toFixed(3)} to ${maxNRRFormatted.toFixed(3)}.`);
  } else {
    messageParts.push('NRR values could not be computed for the scenario.');
  }

  return {
    message: messageParts.join(' '),
    canAchieve: true,
    minOvers: result.minOvers,
    maxOvers: result.maxOvers,
    minNRR: minNRRFormatted,
    maxNRR: maxNRRFormatted,
    targetRuns: result.targetRuns,
    chasingRuns: result.chasingRuns
  };
}

// POST /api/calculate - Main calculation endpoint (exact and range mode)
function calculateMatch(req, res) {
  try {
    const body = req.body;

    // Check if body exists
    if (!body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required'
      });
    }

    const yourTeam = body.yourTeam;
    const opposition = body.opposition;
    const mode = (body.mode || 'exact').toString();
    const desiredPosition = (body.desiredPosition !== undefined && body.desiredPosition !== null) ? Number(body.desiredPosition) : null;
    const tossResult = body.tossResult;
    const runsScored = (body.yourRuns !== undefined) ? Number(body.yourRuns) : (body.runsScored !== undefined ? Number(body.runsScored) : null);
    const matchOvers = body.matchOvers;

    // Validate required fields
    if (!yourTeam || !opposition) {
      return res.status(400).json({
        success: false,
        message: 'yourTeam and opposition are required'
      });
    }

    // Get team names for output
    const table = pointsTableModel.getPointsTableSnapshot();
    const yourTeamIdx = findTeam(table, yourTeam);
    const oppTeamIdx = findTeam(table, opposition);

    if (yourTeamIdx === -1 || oppTeamIdx === -1) {
      return res.status(400).json({
        success: false,
        message: 'Team not found in points table'
      });
    }

    const yourTeamName = table[yourTeamIdx].name;
    const oppTeamName = table[oppTeamIdx].name;

    // RANGE MODE - Calculate NRR range for desired position
    if (mode === 'range') {
      // Validate range mode fields
      if (desiredPosition === null || Number.isNaN(desiredPosition)) {
        return res.status(400).json({
          success: false,
          message: 'desiredPosition is required in range mode'
        });
      }
      if (!tossResult) {
        return res.status(400).json({
          success: false,
          message: 'tossResult is required in range mode (batting or bowling)'
        });
      }
      if (runsScored === null || runsScored === undefined || Number.isNaN(runsScored)) {
        return res.status(400).json({
          success: false,
          message: 'runsScored is required in range mode'
        });
      }
      if (!matchOvers && matchOvers !== 0) {
        return res.status(400).json({
          success: false,
          message: 'matchOvers is required in range mode'
        });
      }

      // Calculate the range using positionCalculator
      const result = positionCalculator.findRequiredPerformanceRange(
        yourTeam,
        opposition,
        Number(desiredPosition),
        tossResult,
        Number(runsScored),
        matchOvers
      );

      // Format output based on toss result
      let output;
      if (tossResult === 'batting') {
        output = formatBattingFirstOutput(yourTeamName, oppTeamName, result);
      } else {
        output = formatBowlingFirstOutput(yourTeamName, oppTeamName, result);
      }

      return res.json({
        success: true,
        mode: 'range',
        yourTeam: yourTeamName,
        opposition: oppTeamName,
        desiredPosition: Number(desiredPosition),
        tossResult: tossResult,
        result: output
      });
    }

    // EXACT MODE - Simulate exact match outcome
    if (mode !== 'exact') {
      return res.status(400).json({
        success: false,
        message: 'Mode must be "exact" or "range"'
      });
    }

    // Check exact mode required fields
    const yourRuns = body.yourRuns;
    const yourOvers = body.yourOvers;
    const oppRuns = body.oppRuns;
    const oppOvers = body.oppOvers;

    if (yourRuns === undefined || yourRuns === null) {
      return res.status(400).json({
        success: false,
        message: 'yourRuns is required in exact mode'
      });
    }
    if (!yourOvers && yourOvers !== 0) {
      return res.status(400).json({
        success: false,
        message: 'yourOvers is required in exact mode'
      });
    }
    if (oppRuns === undefined || oppRuns === null) {
      return res.status(400).json({
        success: false,
        message: 'oppRuns is required in exact mode'
      });
    }
    if (!oppOvers && oppOvers !== 0) {
      return res.status(400).json({
        success: false,
        message: 'oppOvers is required in exact mode'
      });
    }

    // Get current table and make a copy
    const snapshot = pointsTableModel.getPointsTableSnapshot();
    const clonedSnapshot = copyTable(snapshot);

    // Prepare match stats
    const matchStats = {
      yourRuns: Number(yourRuns),
      yourOvers: yourOvers,
      oppRuns: Number(oppRuns),
      oppOvers: oppOvers
    };

    // Validate overs if matchOvers is provided
    if (body.matchOvers) {
      const matchOversBalls = pointsTableModel.parseOversToBalls(body.matchOvers);
      const yourBalls = pointsTableModel.parseOversToBalls(matchStats.yourOvers);
      const oppBallsCount = pointsTableModel.parseOversToBalls(matchStats.oppOvers);

      if (yourBalls > matchOversBalls || oppBallsCount > matchOversBalls) {
        return res.status(400).json({
          success: false,
          message: 'Overs in match result exceed declared matchOvers'
        });
      }
    }

    // Apply the match outcome
    const newTable = applyMatchOutcome(clonedSnapshot, yourTeam, opposition, matchStats);

    // Find the updated team data
    const yourIndex = findTeam(newTable, yourTeam);
    const oppIndex = findTeam(newTable, opposition);

    return res.json({
      success: true,
      mode: 'exact',
      message: 'Exact match simulated',
      matchStats: matchStats,
      yourTeamResult: newTable[yourIndex],
      oppositionResult: newTable[oppIndex],
      fullTable: newTable
    });

  } catch (err) {
    console.error('POST /api/calculate error', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }
}

module.exports = {
  getPointsTable: getPointsTable,
  calculateMatch: calculateMatch
};
