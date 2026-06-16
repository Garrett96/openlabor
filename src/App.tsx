// src/App.tsx

import EntryForm from './components/EntryForm';
import Config from './components/Config';
import OverallSummary from './components/OverallSummary';
import EntriesTable from './components/EntriesTable';
import CategoryTotals from './components/CategoryTotals';
import HourlyChart from './components/HourlyChart';
import DataPipeline from './components/DataPipeline';

function App() {
  return (
    <div className="container">
    <header>
    <h1>OpenLabor</h1>
    <p>Open-source labor analytics for teams</p>
    </header>

    <main>
    <EntryForm />

    <Config />

    <OverallSummary />

    <EntriesTable />

    <CategoryTotals />

    <HourlyChart />

    <DataPipeline />
    </main>

    <footer>
    <a href="https://unlicense.org/" target="_blank" rel="noreferrer">Unlicense</a>
    <a href="https://github.com/Garrett96/openlabor" target="_blank" rel="noreferrer">Source</a>
    </footer>
    </div>
  );
}

export default App;
