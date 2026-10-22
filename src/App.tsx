// src/App.tsx

import { useState } from 'react';
import EntryForm from './components/EntryForm';
import EmployeeManager from './components/EmployeeManager';
import Config from './components/Config';
import OverallSummary from './components/OverallSummary';
import EntriesTable from './components/EntriesTable';
import RoleTotals from './components/RoleTotals';
import HourlyChart from './components/HourlyChart';
import DataPipeline from './components/DataPipeline';

type ViewType = 'dashboard' | 'roster';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  return (
    <div className="container">
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
    <div>
    <h1 style={{ marginBottom: '0.25rem' }}>OpenLabor</h1>
    <p style={{ margin: 0 }}>Hourly-Workforce Analytics Dashboard</p>
    </div>

    {/* Navigation Tabs */}
    <nav style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f3f4f6', padding: '0.25rem', borderRadius: '8px' }}>
    <button
    onClick={() => setActiveView('dashboard')}
    style={{
      padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
      backgroundColor: activeView === 'dashboard' ? 'white' : 'transparent',
      boxShadow: activeView === 'dashboard' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          fontWeight: activeView === 'dashboard' ? 600 : 400,
          color: activeView === 'dashboard' ? 'var(--primary)' : '#666'
    }}
    >
    Dashboard
    </button>
    <button
    onClick={() => setActiveView('roster')}
    style={{
      padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
      backgroundColor: activeView === 'roster' ? 'white' : 'transparent',
      boxShadow: activeView === 'roster' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          fontWeight: activeView === 'roster' ? 600 : 400,
          color: activeView === 'roster' ? 'var(--primary)' : '#666'
    }}
    >
    Roster
    </button>
    </nav>
    </header>

    <main>
    {activeView === 'dashboard' ? (
      <>
      <EntryForm />
      <OverallSummary />
      <EntriesTable />
      <RoleTotals />
      <HourlyChart />
      <Config />
      <DataPipeline />
      </>
    ) : (
      <EmployeeManager />
    )}
    </main>

    <footer>
    <a href="https://unlicense.org/" target="_blank" rel="noreferrer">Unlicense</a>
    <a href="https://github.com/Garrett96/openlabor" target="_blank" rel="noreferrer">Source</a>
    <a href="https://github.com/Garrett96/openlabor/releases" target="_blank" rel="noreferrer">
    Self-Host
    </a>
    </footer>
    </div>
  );
}

export default App;
