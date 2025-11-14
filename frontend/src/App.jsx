// Main App component

import React,{useState} from 'react';
import PointsTable from './components/pointsTable';
import MatchForm from './components/matchForm';
import ResultDisplay from './components/ResultDisplay';


export default function App() {
  const [table, setTable] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle simulation results from MatchForm
  const handleSimulate = React.useCallback(({ fullTable, ...rest }) => {
    if (Array.isArray(fullTable)) setTable(fullTable);
    setResult({ fullTable, ...rest });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
              CricHeroes — Position Calculator
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Predict runs/overs to reach the position you need
            </p>
          </div>

        
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <MatchForm onSimulate={handleSimulate} setLoading={setLoading} />
            <ResultDisplay result={result} />
          </section>

          <aside className="lg:col-span-1">
            <PointsTable table={table} setTable={setTable} loading={loading} />
          </aside>
        </main>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Built by Shubham Patel
        </footer>
      </div>
    </div>
  );
}

