// Match simulation form component

import React from 'react';
import PropTypes from 'prop-types';
import { calculateMatch } from '../services/api';

export default function MatchForm({ onSimulate, setLoading }) {
  // Form state
  const [yourTeam, setYourTeam] = React.useState('RR');
  const [opposition, setOpposition] = React.useState('DC');
  const [matchOvers, setMatchOvers] = React.useState('20');
  const [desiredPosition, setDesiredPosition] = React.useState('1');
  const [tossResult, setTossResult] = React.useState('batting');
  const [runsScored, setRunsScored] = React.useState('160');

  const [message, setMessage] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Validate input fields
  const validateInputs = () => {
    setError(null);

    if (!yourTeam || yourTeam.trim() === '') return 'Please provide your team ID';
    if (!opposition || opposition.trim() === '') return 'Please provide opposition team ID';

    if (yourTeam.trim().toLowerCase() === opposition.trim().toLowerCase())
      return 'Teams must be different';

    const oversNum = Number(matchOvers);
    if (Number.isNaN(oversNum) || oversNum <= 0) return 'Match overs must be a positive number';

    const posNum = Number(desiredPosition);
    if (Number.isNaN(posNum) || posNum < 1 || posNum > 10) return 'Desired position must be between 1 and 10';

    const runsNum = Number(runsScored);
    if (Number.isNaN(runsNum) || runsNum < 0) return 'Runs must be a non-negative number';

    return null;
  };

  // Convert overs format "20" -> "20.0"
  const toOversString = (overs) => {
    const s = String(overs).trim();
    return s.includes('.') ? s : `${s}.0`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const oversString = toOversString(matchOvers);
      const runsNum = Number(runsScored);

      let payload;
      if (tossResult === 'batting') {
        // Team batted first
        payload = {
          yourTeam: yourTeam.trim(),
          opposition: opposition.trim(),
          mode: 'range',
          runsScored: runsNum, 
          matchOvers: matchOvers.trim(),
          desiredPosition: Number(desiredPosition),
          tossResult: 'batting',
          yourRuns: runsNum,
          yourOvers: oversString,
          oppRuns: Math.max(0, runsNum - 1),
          oppOvers: oversString
        };
      } else {
        // Team bowling first (chasing)
        payload = {
          yourTeam: yourTeam.trim(),
          opposition: opposition.trim(),
          mode: 'range',
          runsScored: runsNum,   
          matchOvers: matchOvers.trim(),
          desiredPosition: Number(desiredPosition),
          tossResult: 'bowling',
          yourRuns: runsNum + 1,
          yourOvers: oversString,
          oppRuns: runsNum,
          oppOvers: oversString
        };
      }

      const response = await calculateMatch(payload);


      if (!response || !response.success) {
        const msg = (response && response.message) || 'Simulation failed';
        throw new Error(msg);
      }

      setMessage('Simulation successful');
      if (typeof onSimulate === 'function') onSimulate(response);
    } catch (err) {
      console.error('Simulate error', err);
      setError(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white shadow p-4 space-y-4">
      <h2 className="text-lg font-medium text-slate-700">IPL Match Scenario Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500">1. Your Team (ID)</label>
          <input
            type="text"
            value={yourTeam}
            onChange={(e) => setYourTeam(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-200 p-2 shadow-sm"
            placeholder="e.g., RR, MI, CSK"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">2. Opposition Team (ID)</label>
          <input
            type="text"
            value={opposition}
            onChange={(e) => setOpposition(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-200 p-2 shadow-sm"
            placeholder="e.g., DC, KKR, RCB"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">3. How many overs match?</label>
          <input
            type="text"
            value={matchOvers}
            onChange={(e) => setMatchOvers(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-200 p-2 shadow-sm"
            placeholder="20"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">4. Desired Position for Your Team</label>
          <input
            type="text"
            value={desiredPosition}
            onChange={(e) => setDesiredPosition(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-200 p-2 shadow-sm"
            placeholder="1 (for 1st position)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500">5. Toss Result</label>
          <select
            value={tossResult}
            onChange={(e) => setTossResult(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-200 p-2 shadow-sm"
          >
            <option value="batting">Batting First</option>
            <option value="bowling">Bowling First</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500">
            {tossResult === 'batting' ? '6. Runs Scored (Batting First)' : '6. Runs to Chase (Bowling First)'}
          </label>
          <input
            type="text"
            value={runsScored}
            onChange={(e) => setRunsScored(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-200 p-2 shadow-sm"
            placeholder="160"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">Fill all fields to calculate match scenarios</div>
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md shadow hover:bg-emerald-700">
          Calculate
        </button>
      </div>

      {message && <div className="text-sm text-emerald-700">{message}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </form>
  );
}

MatchForm.propTypes = {
  onSimulate: PropTypes.func,
  setLoading: PropTypes.func.isRequired
};
