// Match calculation routes

'use strict';
const express = require('express');
const router = express.Router();

const { getPointsTable, calculateMatch } = require('../controllers/matchController');

// GET points table
router.get('/points-table', getPointsTable);

// POST calculate match outcome or range
router.post('/calculate', calculateMatch);

module.exports = router;
