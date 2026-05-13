import '@/assets/css/App.css'
import PeriodicTable from '@/components/PeriodicTable'
import { useEffect, useState } from 'react'
import type { PeriodicTableStruct } from './types'

function App() {
  const [table, setTable] = useState<PeriodicTableStruct|null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchTableJson() {
      const res = await fetch("/periodic_table.json", {
        method: "GET",
        headers: {
          'Accept': "application/json"
        },

        signal: controller.signal
      });

      console.log(res.status)

      if (res.ok) {
        const tableStruct: PeriodicTableStruct = await res.json();

        setTable(tableStruct);
      }
    }

    fetchTableJson();
    return () => {
      controller.abort();
    }
  }, [])

  useEffect(() => console.log(table), [table])


  return (
    <>
      <main className="centered">
        {table && <PeriodicTable table={table} />}
      </main>
    </>
  )
}

export default App
