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

  const mode = result.mode || 'exact';

  if (mode === 'range') {
    return <RangeResultDisplay result={result} />;
  }

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

      {rangeResult.canAchieve && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-md bg-slate-50">
            <div className="text-xs text-slate-500 mb-2">
              {tossResult === 'batting' ? 'Runs to Restrict (Range)' : 'Overs to Chase (Range)'}
            </div>
            <div className="font-medium text-slate-800">
              {tossResult === 'batting'
                ? `${rangeResult.minRuns} to ${rangeResult.maxRuns} runs`
                : `${rangeResult.minOvers} to ${rangeResult.maxOvers} overs`}
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50">
            <div className="text-xs text-slate-500 mb-2">Revised NRR (Range)</div>
            <div className="font-medium text-slate-800">
              {rangeResult.minNRR != null && rangeResult.maxNRR != null
                ? `${rangeResult.minNRR.toFixed(3)} to ${rangeResult.maxNRR.toFixed(3)}`
                : '-'}
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
  const matchStats = result.matchStats || {};
  const yourTeamResult = result.yourTeamResult || null;
  const oppositionResult = result.oppositionResult || null;
  const fullTable = Array.isArray(result.fullTable) ? result.fullTable : [];

  return (
    <div className="rounded-lg bg-white shadow p-4 space-y-3">
      <h3 className="text-md font-medium text-slate-700">Exact Match Simulation Result</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-md bg-slate-50">
          <div className="text-xs text-slate-500">Your Team</div>
          <div className="font-medium text-slate-800">
            {yourTeamResult ? `${yourTeamResult.name} — Pts: ${yourTeamResult.pts}` : '-'}
          </div>
          <div className="text-sm text-slate-600">NRR: {formatNRR(yourTeamResult)}</div>
        </div>

        <div className="p-3 rounded-md bg-slate-50">
          <div className="text-xs text-slate-500">Opposition</div>
          <div className="font-medium text-slate-800">
            {oppositionResult ? `${oppositionResult.name} — Pts: ${oppositionResult.pts}` : '-'}
          </div>
          <div className="text-sm text-slate-600">NRR: {formatNRR(oppositionResult)}</div>
        </div>
      </div>

      <div className="mt-2">
        <div className="text-xs text-slate-500">Match Stats</div>
        <div className="text-sm text-slate-700">
          You: {matchStats.yourRuns || '-'} ({matchStats.yourOvers || '-'}) — Opp: {matchStats.oppRuns || '-'} ({matchStats.oppOvers || '-'})
        </div>
      </div>

      <div className="mt-2">
        <div className="text-xs text-slate-500">Updated Table Snapshot</div>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-left">
              <tr>
                <th className="py-2">Pos</th>
                <th className="py-2">Team</th>
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

// Format team NRR value for display
function formatNRR(teamResult) {
  if (!teamResult) return '-';
  if (typeof teamResult.nrr === 'number') return teamResult.nrr.toFixed(3);
  if (teamResult.nrr === null || teamResult.nrr === undefined) return '-';
  return teamResult.nrr;
}

// Render table rows
function createTableRows(fullTable) {
  if (!Array.isArray(fullTable) || fullTable.length === 0) {
    return (
      <tr key="no-data">
        <td colSpan={4} className="py-4 text-slate-400 text-center">
          No snapshot available
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
        <td className="py-2">{team.name}</td>
        <td className="py-2">{typeof team.pts === 'number' ? team.pts : '-'}</td>
        <td className="py-2">{formatNRR(team)}</td>
      </tr>
    );
  });
}
