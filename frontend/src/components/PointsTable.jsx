// Points table display component

import React,{useState,useEffect} from 'react';
import PropTypes from 'prop-types';
import { fetchPointsTable } from '../services/api';

export default function PointsTable({ table = [], setTable, loading = false }) {
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (table && table.length > 0) return;

      setLocalLoading(true);
      setError(null);

      try {
        const response = await fetchPointsTable();

        if (!mounted) return;

        if (response?.success && Array.isArray(response.data)) {
          setTable(response.data);
        } else {
          setTable([]);
        }
      } catch (err) {
        if (!mounted) return;

        console.error("PointsTable load error", err);
        setError(err?.message || "Failed to load points table");
      } finally {
        if (mounted) setLocalLoading(false);
      }
    }

    loadData();
    return () => (mounted = false);
  }, [table, setTable]);

  const isLoading = loading || localLoading;

  const formatNRR = (nrr) =>
    typeof nrr === "number" ? nrr.toFixed(3) : (nrr ?? "-");

  const displayValue = (v) => (typeof v === "number" ? v : "-");

  return (
    <div className="rounded-lg bg-white shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-slate-700">Points Table</h2>
        <div className="text-xs text-slate-500">
          {isLoading ? "Refreshing..." : ""}
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600">Error: {error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-left">
              <th className="py-3 px-2">Pos</th>
              <th className="py-3 px-2">Team</th>
              <th className="py-3 px-2">M</th>
              <th className="py-3 px-2">W</th>
              <th className="py-3 px-2">L</th>
              <th className="py-3 px-2">Pts</th>
              <th className="py-3 px-2">NRR</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading && (!table || table.length === 0) && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-slate-400">
                  No data — simulate or refresh.
                </td>
              </tr>
            )}

            {!isLoading &&
              table.map((team, i) => (
                <tr
                  key={team.id || team.name || `team-${i}`}
                  className={i % 2 === 0 ? "bg-slate-50" : ""}
                >
                  <td className="py-2 px-2 font-medium">{i + 1}</td>
                  <td className="py-3 px-1">{team.name}</td>
                  <td className="py-3 px-2">{displayValue(team.matches)}</td>
                  <td className="py-3 px-2">{displayValue(team.won)}</td>
                  <td className="py-3 px-2">{displayValue(team.lost)}</td>
                  <td className="py-3 px-2">{displayValue(team.pts)}</td>
                  <td className="py-3 px-2">{formatNRR(team.nrr)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

PointsTable.propTypes = {
  table: PropTypes.array,
  setTable: PropTypes.func.isRequired,
  loading: PropTypes.bool
};
