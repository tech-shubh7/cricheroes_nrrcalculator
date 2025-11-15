'use strict';

const pointsTableModel = require('../models/pointsTable');
const calculator = require('../services/calculator');

function validateField(value, fieldName, isNumeric = false) {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  if (isNumeric && isNaN(Number(value))) {
    return `${fieldName} must be a number`;
  }
  return null;
}

// Get current points table
function getPointsTable(req, res) {
  try {
    const table = pointsTableModel.getPointsTableSnapshot();
    const sorted = calculator.sortTable(table);
    return res.json({ success: true, data: sorted });
  } catch (err) {
    console.error('Error fetching table:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Format response per PDF requirements
function formatResponse(yourTeam, oppTeam, result, tossResult) {
  if (!result.success) {
    return {
      canAchieve: false,
      message: 'Cannot achieve desired position with these parameters'
    };
  }

  if (tossResult === 'batting') {
    // Batting first scenario
    return {
      canAchieve: true,
      message: `If ${yourTeam} scores ${result.yourRuns} runs in ${result.overs} overs, ${yourTeam} needs to restrict ${oppTeam} between ${result.restrictTo.min} to ${result.restrictTo.max} runs in ${result.overs}. Revised NRR of ${yourTeam} will be between ${result.nrrRange.min} to ${result.nrrRange.max}.`,
      details: {
        yourRuns: result.yourRuns,
        overs: result.overs,
        restrictBetween: `${result.restrictTo.min}-${result.restrictTo.max}`,
        nrrRange: `${result.nrrRange.min} to ${result.nrrRange.max}`
      }
    };
  } else {
    // Bowling first scenario
    return {
      canAchieve: true,
      message: `${yourTeam} needs to chase ${result.chaseTarget} between ${result.chaseIn.min} and ${result.chaseIn.max} overs. Revised NRR for ${yourTeam} will be between ${result.nrrRange.min} to ${result.nrrRange.max}.`,
      details: {
        chaseTarget: result.chaseTarget,
        chaseBetween: `${result.chaseIn.min}-${result.chaseIn.max} overs`,
        nrrRange: `${result.nrrRange.min} to ${result.nrrRange.max}`
      }
    };
  }
}

// Main calculation endpoint
function calculateMatch(req, res) {
  try {
    const { yourTeam, opposition, mode = 'range', desiredPosition, tossResult, yourRuns, matchOvers, yourOvers, oppRuns, oppOvers } = req.body;

    // Validate teams exist
    const teamValidation = validateField(yourTeam, 'yourTeam') || validateField(opposition, 'opposition');
    if (teamValidation) {
      return res.status(400).json({ success: false, message: teamValidation });
    }

    const table = pointsTableModel.getPointsTableSnapshot();
    const yourIdx = calculator.findTeam(table, yourTeam);
    const oppIdx = calculator.findTeam(table, opposition);

    if (yourIdx === -1 || oppIdx === -1) {
      return res.status(400).json({ success: false, message: 'Team not found in table' });
    }

    const yourTeamName = table[yourIdx].name;
    const oppTeamName = table[oppIdx].name;

    // RANGE MODE - Calculate NRR range for desired position
    if (mode === 'range') {
      const validations = [
        validateField(desiredPosition, 'desiredPosition', true),
        validateField(tossResult, 'tossResult'),
        validateField(yourRuns, 'yourRuns', true),
        validateField(matchOvers, 'matchOvers')
      ].filter(err => err !== null);
      
      if (validations.length > 0) {
        return res.status(400).json({ success: false, message: validations[0] });
      }

      if (!['batting', 'bowling'].includes(tossResult)) {
        return res.status(400).json({ 
          success: false, 
          message: 'tossResult must be either "batting" or "bowling"' 
        });
      }

      // Validate desired position range
      const desiredPositionNum = Number(desiredPosition);
      if (desiredPositionNum < 1 || desiredPositionNum > 10) {
        return res.status(400).json({
          success: false,
          message: 'desiredPosition must be between 1 and 10'
        });
      }

      // Calculate range based on toss result
      const rangeResult = tossResult === 'batting'
        ? calculator.battingFirstRange(yourTeam, opposition, Number(desiredPosition), Number(yourRuns), matchOvers)
        : calculator.bowlingFirstRange(yourTeam, opposition, Number(desiredPosition), Number(yourRuns), matchOvers);

      const response = formatResponse(yourTeamName, oppTeamName, rangeResult, tossResult);

      return res.json({
        success: true,
        yourTeam: yourTeamName,
        opposition: oppTeamName,
        desiredPosition: Number(desiredPosition),
        tossResult,
        result: response
      });
    }

    // EXACT MODE - Simulate specific match
    if (mode !== 'exact') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid mode. Use "exact" or "range"' 
      });
    }

    const validations = [
      validateField(yourRuns, 'yourRuns', true),
      validateField(yourOvers, 'yourOvers'),
      validateField(oppRuns, 'oppRuns', true),
      validateField(oppOvers, 'oppOvers')
    ].filter(err => err !== null);
    
    if (validations.length > 0) {
      return res.status(400).json({ success: false, message: validations[0] });
    }

    // Validate runs are not negative
    if (Number(yourRuns) < 0 || Number(oppRuns) < 0) {
      return res.status(400).json({ success: false, message: 'Runs cannot be negative' });
    }

    // Validate overs limit
    if (matchOvers) {
      const maxBalls = pointsTableModel.parseOversToBalls(matchOvers);
      const yourBalls = pointsTableModel.parseOversToBalls(yourOvers);
      const oppBalls = pointsTableModel.parseOversToBalls(oppOvers);

      if (yourBalls > maxBalls || oppBalls > maxBalls) {
        return res.status(400).json({ 
          success: false, 
          message: 'Overs cannot exceed match limit' 
        });
      }
    }

    const updatedTable = calculator.simulateMatch(
      table, yourTeam, opposition, 
      Number(yourRuns), yourOvers, 
      Number(oppRuns), oppOvers
    );

    const yourResult = updatedTable[calculator.findTeam(updatedTable, yourTeam)];
    const oppResult = updatedTable[calculator.findTeam(updatedTable, opposition)];

    return res.json({
      success: true,
      mode: 'exact',
      yourTeam: yourResult,
      opposition: oppResult,
      updatedTable
    });

  } catch (err) {
    console.error('Calculation error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getPointsTable,
  calculateMatch
};