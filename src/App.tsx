import { PeriodicTable } from '@/components/PeriodicTable'
import { useEffect, useState } from 'react'
import type { PeriodicTableSchema } from './types'
import LoadingFallback from './components/fallback/LoadingFallback';
import '@/assets/css/app.css'
import TooltipProvider from './components/provider/TooltipProvider';
import Searchbar from './components/Searchbar';
import PeriodicTableProvider from './components/provider/PeriodicTableProvider';
import Toolbar from './components/Toolbar';

function App() {
  const [table, setTable] = useState<PeriodicTableSchema|null>(null);

  useEffect(() => {
    async function fetchTableJson() {
      const res = await fetch("/periodic_table.json", {
        method: "GET",
        headers: {
          'Accept': "application/json"
        },

      });

      if (res.ok) {
        const tableStruct: PeriodicTableSchema = await res.json();

        setTable(tableStruct);
      }
    }

    fetchTableJson();
  }, [])

  return (
    <PeriodicTableProvider elementTable={table}>
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
    </PeriodicTableProvider>
  )
}

export default App
