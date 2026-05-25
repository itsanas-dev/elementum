import PeriodicTable from '@/components/PeriodicTable'
import { useEffect, useState } from 'react'
import type { PeriodicTableSchema } from './types'
import LoadingFallback from './components/fallback/LoadingFallback';
import '@/assets/css/app.css'
import TooltipRenderer from './components/TooltipRenderer';
import Searchbar from './components/Searchbar';
import TableProvider from './components/provider/TableProvider';

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
    <>
      <TooltipRenderer />
      <main className="centered">
        <TableProvider elementTable={table}>
          { 
            table ?
            <>
              <Searchbar />
              <PeriodicTable table={table} />
            </>
            :
            <LoadingFallback />
          }
        </TableProvider>
      </main>
    </>
  )
}

export default App
