import clsx from "clsx"
import { CircleQuestionMark, EqualIcon, Search } from "lucide-react"
import React, { useCallback, useContext, useId, useMemo, useRef, useState, type ChangeEvent, type InputEvent, type JSX, type ReactNode } from "react"
import "@/assets/css/searchbox.css"
import { evaluateUserSearch, getIntendedArgumentCount, getSearchExpression, type SearchIntent } from "@/lib/search"
import LoadingFallback from "../fallback/LoadingFallback"
import { AppContext } from "@/provider/PeriodicTableContext"
import { ConfigContext } from "@/provider/ConfigContext"
import type { ParsedElement, SearchIntentEntry } from "@/lib/searchTypes"

type SearchboxStatus = {
  focused: boolean,
  status: "empty" | "loading" | "fetched",
  query: SearchIntent|null
}

type SearchboxEntryProps = {
  icon: ReactNode,
  intentEntry: SearchIntentEntry,
  elements: ParsedElement[]
}

// Ensures that you need a large threshold to show the other result.
// Masks out weak words like 'EN', 'mass' and so on in place of longer terms
function filterIntents(intents: SearchIntentEntry[]): SearchIntentEntry[] {
  if (intents.length < 2) return intents;

  const [first, ...rest] = intents;
  const threshold = first.confidence * 0.55; // 60% of the first result must be achieved for it to show second result.

  return [first, ...rest.filter(intent => intent.confidence >= threshold)];
}

const SearchboxEntry = React.memo(({ icon, intentEntry, elements }: SearchboxEntryProps) => {
  const {elementTable} = useContext(AppContext);
  const { preferredDensityUnit, preferredTemperatureUnit } = useContext(ConfigContext);
  const evaluation = useMemo(() => getSearchExpression(elementTable!, intentEntry, elements, {preferredDensityUnit, preferredTemperatureUnit}), [preferredDensityUnit, preferredTemperatureUnit])
  
  if (!evaluation) return null;

  return (
    <button aria-label={`${evaluation.action} ${evaluation.result}`} className="searchbox-entry-wrapper">
      {icon}
      <div className="searchbox-entry" aria-hidden>
        {
          (evaluation.action && evaluation.action.length > 0) && 
          <p className="searchbox-expression text-muted">{evaluation.action}</p>
        }

        {
          (evaluation.result && evaluation.result.length > 0) && 
          <h2 className="searchbox-result">{evaluation.result}</h2>
        }

      </div>
    </button>
  )
})

function SearchboxQueryResults({ query }: {query: SearchIntent}) {
  return <>
    {query && filterIntents(query.evaluation).map((intent) => {
      const elements = query.params.elements;
      const argumentCount = getIntendedArgumentCount(intent.type);

      // Get a max of 4 permutations of a single-argument function
      // If you have more than 1 element provided.
      if (elements.length > 1 && argumentCount === 1) {
        let elementSlice = elements;

        if (elements.length > 4) {
          elementSlice = elements.slice(0, 4)
        }

        return (
          <>
            {elementSlice.map((el, index) => (
              <SearchboxEntry 
                key={`${intent.type}${index+1}`} 
                elements={[el]}
                icon={
                  intent.type === "unknown" ? 
                  <CircleQuestionMark className="icon-noshrink" size={20} /> 
                  : 
                  <EqualIcon className="icon-noshrink" size={20} aria-hidden />
                } 
                intentEntry={intent} 
              />
            ))}
          </>
        )
      }

      return (
        <SearchboxEntry 
          key={`${intent.type}0`}
          icon={
            intent.type === "unknown" ? 
            <CircleQuestionMark className="icon-noshrink" size={20} /> 
            : 
            <EqualIcon className="icon-noshrink" size={20} aria-hidden />
          }
          elements={elements} 
          intentEntry={intent} 
        />
      )
    })}
  </>
}

export default function Searchbar({className, ...rest }: JSX.IntrinsicElements["input"]) {
  const { elementTable, elementSymbolLookup } = useContext(AppContext);
  const [searchboxState, setSearchboxState] = useState<SearchboxStatus>({focused: false, query: null, status: "empty"});
  const searchTimeoutRef = useRef<number>(-1);
  const searchboxInputRef = useRef<HTMLInputElement>(null);
  const searchboxContentRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const listboxId = `search-content-${id}`;

  const searchElement = useCallback((query: string) => {
    const queryLowerCase = query.toLowerCase();

    // Searching by id.
    // This can match "Calcium", "calcium" and other element names.
    if (elementTable && query !== "order" && elementTable[queryLowerCase]) {
      const el = elementTable[queryLowerCase]
      return el.type === "element" ? queryLowerCase : null;
    }

    if (elementSymbolLookup && elementSymbolLookup[query]) {
      return elementSymbolLookup[query];
    }

    return null;
  }, [elementTable, elementSymbolLookup])

  function closeLastQuery(e: InputEvent<HTMLInputElement>) {
    const input = (e.target as HTMLInputElement);
    const searchQuery = input.value;

    if (searchTimeoutRef.current >= 0) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery === "") {
      setSearchboxState((s) => ({
        ...s,
        query: null,
        status: "empty"
      }))
    }
  }

  function sendSearchQuery(e: ChangeEvent<HTMLInputElement>) {
    const input = (e.target as HTMLInputElement);
    const searchQuery = input.value;

    if (searchQuery === "") return;

    setSearchboxState((s) => ({
      ...s,
      query: null,
      status: "loading"
    }));

    searchTimeoutRef.current = setTimeout(() => {
      const query = evaluateUserSearch(searchQuery, searchElement);
      console.log("User search.")
      setSearchboxState((s) => ({
        ...s,
        query,
        status: "fetched"
      }))
      searchTimeoutRef.current = -1;
    }, 500)
  }

  function onBlur() {
    setSearchboxState((s) => ({...s, focused: false}))
  }

  function onFocus() {
    setSearchboxState((s) => ({...s, focused: true}))
  }

  return (
    <div
      className="searchbox-wrapper" 
      role="combobox"
      aria-expanded={searchboxState.status !== "empty" && searchboxState.focused}
      aria-haspopup="listbox"
      aria-owns={listboxId}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <Search className="icon-noshrink" aria-hidden size={16} />
      <input 
        className={clsx("searchbox", className)}
        role="searchbox" 
        placeholder="Enter a chemical query..."
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-busy={searchboxState.status === "loading"}
        {...rest}
        ref={searchboxInputRef}
        onInput={closeLastQuery}
        onChange={sendSearchQuery}
      />

      {(searchboxState.focused && searchboxState.status !== "empty") &&
        <div 
          tabIndex={-1} 
          ref={searchboxContentRef} 
          className="searchbox-content"
          id={listboxId}
          role="listbox"
          aria-label="Query results"
          aria-live="assertive"
          aria-busy={searchboxState.status === "loading"}
        >
          {
            (searchboxState.status === "loading") ?
              <LoadingFallback className="spinner-search" size={24} />
            :
              <SearchboxQueryResults query={searchboxState.query!} />
          }
        </div>
      }
    </div>
  )
}