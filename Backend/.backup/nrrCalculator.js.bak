
'use strict';

const pointsTableModel = require('../models/pointsTable');

/**
 * Local fallback computeNRR (used if pointsTableModel.computeNRR is missing)
 * Accepts runs and balls (integers) and returns run-rate difference (float).
 */
function _computeNRR_fallback(totalForRuns, totalForBalls, totalAgainstRuns, totalAgainstBalls) {
  const oversFor = totalForBalls > 0 ? totalForBalls / 6.0 : 0.0;
  const oversAgainst = totalAgainstBalls > 0 ? totalAgainstBalls / 6.0 : 0.0;
  const runRateFor = oversFor > 0 ? totalForRuns / oversFor : 0;
  const runRateAgainst = oversAgainst > 0 ? totalAgainstRuns / oversAgainst : 0;
  return runRateFor - runRateAgainst;
}

// Format NRR to 3 decimal places
function _formatNRR(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  return Number(Number(n).toFixed(3));
}

/**
 * Calculate required run rate
 * runsNeeded: number
 * oversAvailable: string or number (accepted by pointsTableModel.parseOversToBalls)
 */
function calculateRequiredRunRate(runsNeeded, oversAvailable) {
  const balls = pointsTableModel.parseOversToBalls(oversAvailable);
  if (!balls || balls === 0) {
    return 0;
  }
  return (runsNeeded * 6.0) / balls;
}

/**
 * Calculate projected NRR after a new match
 * currentStats: object with `for` and `against` (runs, balls)
 * newMatch: { runsScored, oversFaced, runsConceded, oversBowled }
 */
function calculateProjectedNRR(currentStats, newMatch) {
  // defensive defaults
  const curForRuns = (currentStats && currentStats.for && Number(currentStats.for.runs)) || 0;
  const curForBalls = (currentStats && currentStats.for && Number(currentStats.for.balls)) || 0;
  const curAgainstRuns = (currentStats && currentStats.against && Number(currentStats.against.runs)) || 0;
  const curAgainstBalls = (currentStats && currentStats.against && Number(currentStats.against.balls)) || 0;

  const addRunsFor = Number(newMatch.runsScored) || 0;
  const addBallsFor = pointsTableModel.parseOversToBalls(newMatch.oversFaced) || 0;
  const addRunsAgainst = Number(newMatch.runsConceded) || 0;
  const addBallsAgainst = pointsTableModel.parseOversToBalls(newMatch.oversBowled) || 0;

  const totalRunsFor = curForRuns + addRunsFor;
  const totalBallsFor = curForBalls + addBallsFor;
  const totalRunsAgainst = curAgainstRuns + addRunsAgainst;
  const totalBallsAgainst = curAgainstBalls + addBallsAgainst;

  const raw = (typeof pointsTableModel.computeNRR === 'function')
    ? pointsTableModel.computeNRR(totalRunsFor, totalBallsFor, totalRunsAgainst, totalBallsAgainst)
    : _computeNRR_fallback(totalRunsFor, totalBallsFor, totalRunsAgainst, totalBallsAgainst);

  return _formatNRR(raw);
}

/**
 * Calculate NRR for a specific match scenario
 * teamStats: the team's current stats object (with for/against)
 * yourRuns, yourOvers, oppRuns, oppOvers: numbers/strings
 */
function calculateNRRForScenario(teamStats, yourRuns, yourOvers, oppRuns, oppOvers) {
  const yourBalls = pointsTableModel.parseOversToBalls(yourOvers) || 0;
  const oppBalls = pointsTableModel.parseOversToBalls(oppOvers) || 0;

  const newRunsFor = (teamStats && teamStats.for && Number(teamStats.for.runs)) || 0;
  const newBallsFor = (teamStats && teamStats.for && Number(teamStats.for.balls)) || 0;
  const newRunsAgainst = (teamStats && teamStats.against && Number(teamStats.against.runs)) || 0;
  const newBallsAgainst = (teamStats && teamStats.against && Number(teamStats.against.balls)) || 0;

  const totalRunsFor = newRunsFor + Number(yourRuns || 0);
  const totalBallsFor = newBallsFor + yourBalls;
  const totalRunsAgainst = newRunsAgainst + Number(oppRuns || 0);
  const totalBallsAgainst = newBallsAgainst + oppBalls;

  const raw = (typeof pointsTableModel.computeNRR === 'function')
    ? pointsTableModel.computeNRR(totalRunsFor, totalBallsFor, totalRunsAgainst, totalBallsAgainst)
    : _computeNRR_fallback(totalRunsFor, totalBallsFor, totalRunsAgainst, totalBallsAgainst);

  return _formatNRR(raw);
}

/**
 * Calculate team's new points after match
 */
function calculateNewPoints(currentPoints, yourRuns, oppRuns) {
  const y = Number(yourRuns);
  const o = Number(oppRuns);
  if (Number.isNaN(y) || Number.isNaN(o)) return currentPoints;
  if (y > o) return currentPoints + 2;
  if (y < o) return currentPoints;
  return currentPoints + 1;
}

module.exports = {
  calculateRequiredRunRate,
  calculateProjectedNRR,
  calculateNRRForScenario,
  calculateNewPoints
};
