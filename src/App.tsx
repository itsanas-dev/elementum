import { PeriodicTable } from '@/components/PeriodicTable'
import { useEffect, useState } from 'react'
import type { PeriodicTableSchema } from './lib/types'
import LoadingFallback from './components/fallback/LoadingFallback';
import '@/assets/css/app.css'
import TooltipProvider from './components/provider/TooltipProvider';
import Searchbar from './components/Searchbar';
import AppProvider from './components/provider/AppProvider';
import Toolbar from './components/Toolbar';

function App() {
  const [table, setTable] = useState<PeriodicTableSchema|null>(null);

  useEffect(() => {
    async function fetchTable() {
      const res = await fetch("/periodic_table.json", {
        method: "GET",
        headers: {
          'Accept': "application/json"
        }
      });

      if (res.ok) {
        const tableStruct: PeriodicTableSchema = await res.json();

        setTable(tableStruct);
      }
    }

    fetchTable();
  }, [])

  return (
    <AppProvider elementTable={table}>
      <TooltipProvider>
        <main className="centered">
          { 
            table ?
            <>
              <div className="top-bar">
                <Searchbar />
                <Toolbar />
              </div>
              <PeriodicTable table={table} />
            </>
            :
            <LoadingFallback />
          }
        </main>
      </TooltipProvider>
    </AppProvider>
  )
}

export default App
