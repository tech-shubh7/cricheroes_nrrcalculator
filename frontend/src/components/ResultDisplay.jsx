// Match result display component

import React from 'react';
import PropTypes from 'prop-types';

export default function ResultDisplay({ result }) {
  if (!result) {
    return (
      <div className="rounded-lg bg-white shadow p-4 text-slate-500">
        No results yet — run a calculation.
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="rounded-lg bg-white shadow p-4">
        <div className="text-red-600">
          Error: {result.message || 'Calculation failed'}
        </div>
      </div>
    );
  }

  // Check if it's range mode (has result.result field)
  if (result.result) {
    return <RangeResultDisplay result={result} />;
  }

  // Otherwise it's exact mode
  return <ExactResultDisplay result={result} />;
}

ResultDisplay.propTypes = {
  result: PropTypes.object
};

// Range mode result display
function RangeResultDisplay({ result }) {
  const yourTeam = result.yourTeam || '-';
  const opposition = result.opposition || '-';
  const desiredPosition = result.desiredPosition || '-';
  const tossResult = result.tossResult || '-';
  const rangeResult = result.result || {};

  return (
    <div className="rounded-lg bg-white shadow p-4 space-y-4">
      <h3 className="text-lg font-semibold text-slate-700">NRR Range Calculation Result</h3>

      <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
        <div className="text-sm font-medium text-blue-900 mb-2">Scenario Details</div>
        <div className="text-sm text-blue-800 space-y-1">
          <div>Your Team: {yourTeam}</div>
          <div>Opposition: {opposition}</div>
          <div>Desired Position: {desiredPosition}</div>
          <div>Toss Result: {tossResult === 'batting' ? 'Batting First' : 'Bowling First'}</div>
        </div>
      </div>

      <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200">
        <div className="text-sm font-medium text-emerald-900 mb-2">Result</div>
        <div className={rangeResult.canAchieve ? 'text-sm text-emerald-800' : 'text-sm text-red-800'}>
          {rangeResult.message || 'No result available'}
        </div>
      </div>

      {rangeResult.canAchieve && rangeResult.details && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-md bg-slate-50">
            <div className="text-xs text-slate-500 mb-2">
              {tossResult === 'batting' ? 'Restrict Opponent To' : 'Chase Target In'}
            </div>
            <div className="font-medium text-slate-800">
              {tossResult === 'batting'
                ? rangeResult.details.restrictBetween
                : rangeResult.details.chaseBetween}
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50">
            <div className="text-xs text-slate-500 mb-2">Revised NRR Range</div>
            <div className="font-medium text-slate-800">
              {rangeResult.details.nrrRange || '-'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

RangeResultDisplay.propTypes = {
  result: PropTypes.object.isRequired
};

// Exact mode result display
function ExactResultDisplay({ result }) {
  const yourTeam = result.yourTeam || null;
  const opposition = result.opposition || null;
  const fullTable = result.updatedTable || [];

  return (
    <div className="rounded-lg bg-white shadow p-4 space-y-3">
      <h3 className="text-md font-medium text-slate-700">Exact Match Simulation Result</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-md bg-slate-50">
          <div className="text-xs text-slate-500">Your Team</div>
          <div className="font-medium text-slate-800">
            {yourTeam ? `${yourTeam.name} — Pts: ${yourTeam.pts}` : '-'}
          </div>
          <div className="text-sm text-slate-600">
            NRR: {yourTeam ? formatNRR(yourTeam.nrr) : '-'}
          </div>
        </div>

        <div className="p-3 rounded-md bg-slate-50">
          <div className="text-xs text-slate-500">Opposition</div>
          <div className="font-medium text-slate-800">
            {opposition ? `${opposition.name} — Pts: ${opposition.pts}` : '-'}
          </div>
          <div className="text-sm text-slate-600">
            NRR: {opposition ? formatNRR(opposition.nrr) : '-'}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="text-xs text-slate-500 mb-2">Updated Points Table</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-left border-b">
              <tr>
                <th className="py-2">Pos</th>
                <th className="py-2">Team</th>
                <th className="py-2">M</th>
                <th className="py-2">W</th>
                <th className="py-2">Pts</th>
                <th className="py-2">NRR</th>
              </tr>
            </thead>
            <tbody>
              {createTableRows(fullTable)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

ExactResultDisplay.propTypes = {
  result: PropTypes.object.isRequired
};

// Format NRR value
function formatNRR(nrr) {
  if (nrr === null || nrr === undefined) return '-';
  if (typeof nrr === 'number') return nrr.toFixed(3);
  return nrr;
}

// Render table rows
function createTableRows(fullTable) {
  if (!Array.isArray(fullTable) || fullTable.length === 0) {
    return (
      <tr key="no-data">
        <td colSpan={6} className="py-4 text-slate-400 text-center">
          No data available
        </td>
      </tr>
    );
  }

  return fullTable.map((team, idx) => {
    const position = idx + 1;
    const key = team.id || team.name || `team-${idx}`;
    const bgClass = idx % 2 === 0 ? 'bg-slate-50' : '';

    return (
      <tr key={key} className={bgClass}>
        <td className="py-2 font-medium">{position}</td>
        <td className="py-2">{team.name || '-'}</td>
        <td className="py-2">{team.matches || 0}</td>
        <td className="py-2">{team.won || 0}</td>
        <td className="py-2">{team.pts || 0}</td>
        <td className="py-2">{formatNRR(team.nrr)}</td>
      </tr>
    );
  });
}