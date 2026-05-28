import { useEffect, useState } from 'react'
import type { PeriodicTableSchema } from './lib/types'
import '@/assets/css/app.css'
import TooltipProvider from './components/provider/TooltipProvider';
import AppProvider from './components/provider/AppProvider';
import Topbar from './components/layout/Topbar';
import { PeriodicTable } from './components/layout/pages/PagePeriodicTable';

const searchHelpEntries: [string, string][] = [
  ["molar mass of, mr of", "Get the molar mass of an element or compound"],
  ["atomic number of", "Get the atomic number of an element"],
  ["electronic configuration of", "Get the electronic configuration of an element"],
  ["how dense is, density of", "Get the density of an element"],
  ["group of, family of", "Get the group of an element"],
  ["period of, row of", "Get the period of an element"],
  ["state of matter of, state of", "Get the physical state of an element"],
  ["melt of, melting point of", "Get the melting point of an element"],
  ["boil of, boiling point of", "Get the boiling point of an element"],
  ["appearance, look", "Get the appearance or look of an element (at r.t.p)"],
  ["electron affinity, e- affinity of", "Get the electron affinity of an element"],
  ["electronegativity of, EN of", "Get the electronegativity of an element."],
  ["EN difference of, EN diff of", "Gets the E.N difference between two elements"],
  ["Empirical formula of, composition formula of", "Gets the empirical formula of a compound"]
]

const queryExamples: string[] = [
  "The molar mass of Ca(OH)2",
  "Zn family",
  "What is the group of silicon",
  "How dense is oxygen gas.",
  "room temperature state of I2"
]

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
        <>
          <main>
            <Topbar />
            <PeriodicTable />

            <div className='section-help'>
              <h2 className='underline'>How to search</h2>

              <p className='section-line'>
                You can query anything chemistry-related in the search box.
              </p>

              <p className="section-line">Examples include:</p>

              <div className="search-help-grid">
                {searchHelpEntries.map((entry, index) => (
                  <div className='help-entry' key={index}>
                    <code>{entry[0]}</code> - {entry[1]}
                  </div>
                ))}
              </div>

              <p className="section-line section-paragraph-break">
                Examples of queries include
              </p>

              <div className='search-help-grid'>
                {queryExamples.map((entry, index) => (
                  <div className='help-entry' key={index}>
                    <code>
                      {entry}
                    </code>
                  </div>
                ))}
              </div>

              <p className="section-line">
                Queries are very open-ended especially when it comes to phrasing them. If you have any problems with the queries, create an issues request on the Github page.
              </p>
            </div>
          </main>
        </>

        <footer>
          <p>Made by Anas (itsanas-dev)</p>

          <div className='footer-links'>
            <a target='_blank' href="https://github.com/itsanas-dev">Profile</a>
            <a target='_blank' href="https://github.com/itsanas-dev/elementum">Github repo</a>
          </div>
        </footer>
      </TooltipProvider>
    </AppProvider>
  )
}

export default App
