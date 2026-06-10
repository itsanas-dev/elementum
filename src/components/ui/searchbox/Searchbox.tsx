import clsx from "clsx"
import { CircleQuestionMark, EqualIcon, Search } from "lucide-react"
import React, { useContext, useId, useMemo, useRef, useState, type InputEvent, type JSX, type KeyboardEvent } from "react"
import { buildQuantityRecord, evaluateUserSearch, getIntendedArgumentCount, getQuantitiesRequiredForEntry, type SearchEvaluation } from "@/lib/search"
import LoadingFallback from "@/components/fallback/LoadingFallback"
import { AppContext } from "@/provider/PeriodicTableContext"
import type { SearchCandidate } from "@/lib/searchTypes"
import { markupMolecularFormula } from "@/lib/markup"
import type { PeriodicTableSchema } from "@/lib/types"
import { SearchboxEntry } from "./SearchboxEntry"
import SearchboxWarning from "./SearchboxWarning"
import "@/assets/css/searchbox.css"

type SearchboxStatus = {
  focused: boolean,
  status: "empty" | "loading" | "fetched",
  query: SearchEvaluation|null
}

type SearchboxHistory = {
  timeline: string[],
  pointer: number
}

function historyChanged(symbolLookup: Record<string, string>, history: SearchboxHistory, el: HTMLDivElement) {
  const text = history.timeline[history.pointer];

  el.textContent = text;
  markupMolecularFormula(symbolLookup, el);
  
  const sel = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)

  if (sel) {
    sel.removeAllRanges()
    sel.addRange(range)
  }
}

function elementSearcher(table: PeriodicTableSchema|null, symbolLookup: Record<string, string>) {
  return (query: string) => {
    const queryLowerCase = query.toLowerCase();

    // Searching by id.
    // This can match "Calcium", "calcium" and other element names.
    if (table && table.elements[queryLowerCase]) {
      const el = table.elements[queryLowerCase]

      return (el.type === "element" ? queryLowerCase : null);
    }

    if (symbolLookup[query]) {
      return symbolLookup[query];
    }

    return null;
  }
}

// Ensures that you need a large threshold to show the other result.
// Masks out weak words like 'EN', 'mass' and so on in place of longer terms
function filterIntents(intents: SearchCandidate[]): SearchCandidate[] {
  if (intents.length < 2) return intents;

  const [first, ...rest] = intents;
  const threshold = first.confidence * 0.55; // 55% of the first result must be achieved for it to show second result.

  return [first, ...rest.filter(intent => intent.confidence >= threshold)];
}

function SearchboxQueryResults({ query }: {query: SearchEvaluation}) {
  return <>
    {query && filterIntents(query.evaluation).map((intent) => {
      const elements = query.params.elements;
      const quantitiesRequired = getQuantitiesRequiredForEntry(intent.type);
      const argumentCount = getIntendedArgumentCount(intent.type);
      const quantities = quantitiesRequired ? buildQuantityRecord(query.params.quantities, quantitiesRequired) : {};

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
                quantities={quantities}
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
          quantities={quantities}
          elements={elements} 
          intentEntry={intent}  
        />
      )
    })}

    {query.warnings?.map((warning, index) => (
      <SearchboxWarning key={`${warning.kind}-${index}`} warning={warning} />
    ))}
  </>
}

export default function Searchbar({className, ...rest }: JSX.IntrinsicElements["div"]) {
  const { elementTable, elementSymbolLookup } = useContext(AppContext);
  const [searchboxState, setSearchboxState] = useState<SearchboxStatus>({focused: false, query: null, status: "empty"});
  const [isEmpty, setIsEmpty] = useState(true);
  const textHistory = useRef<SearchboxHistory>({pointer: -1, timeline: []});
  const searchTimeoutRef = useRef<number>(-1);
  const searchboxInputRef = useRef<HTMLDivElement>(null);
  const searchboxContentRef = useRef<HTMLDivElement>(null);
  const searchElement = useMemo(() => elementSearcher(elementTable, elementSymbolLookup), [elementTable, elementSymbolLookup]);
  const id = useId();
  const listboxId = `search-content-${id}`;

  const pushHistory = (text: string) => {
    const hist = textHistory.current;
    hist.timeline.push(text);

    if (hist.timeline.length > 50) {
      hist.timeline = hist.timeline.slice(hist.timeline.length - 50);
    }

    hist.pointer = hist.timeline.length - 1;
  }

  const undo = () => {
    textHistory.current.pointer = Math.max(0, textHistory.current.pointer - 1);
    historyChanged(elementSymbolLookup, textHistory.current, searchboxInputRef.current!);
  }

  const redo = () => {
    textHistory.current.pointer = Math.min(textHistory.current.timeline.length - 1, textHistory.current.pointer + 1);
    historyChanged(elementSymbolLookup, textHistory.current, searchboxInputRef.current!);
  }

  function closeLastQuery(e: InputEvent<HTMLDivElement>) {
    const inputElement = e.currentTarget as HTMLDivElement;
    const rawInput = inputElement.textContent;

    setIsEmpty((rawInput === ""));
    markupMolecularFormula(elementSymbolLookup, inputElement);

    const searchQuery = rawInput.replaceAll("\n", "");

    if (searchTimeoutRef.current >= 0) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery === "") {
      setSearchboxState((s) => ({
        ...s,
        query: null,
        status: "empty"
      }));
      return;
    }

    setSearchboxState((s) => ({
      ...s,
      query: null,
      status: "loading"
    }));

    searchTimeoutRef.current = setTimeout(() => {
      const query = evaluateUserSearch(searchQuery, searchElement);

      pushHistory(rawInput);

      setSearchboxState((s) => ({
        ...s,
        query,
        status: "fetched"
      }))

      searchTimeoutRef.current = -1;
    }, 500)
  }

  function onBlur(e: React.FocusEvent<HTMLDivElement>) {
    const target = (e.relatedTarget as HTMLElement);

    // Hacky fix to stop it from closing.
    if (searchboxContentRef.current?.contains(target)) {
      e.preventDefault();
      searchboxInputRef.current?.focus();
      return;
    }

    setSearchboxState((s) => ({...s, focused: false}))
  }

  function onFocus() {
    setSearchboxState((s) => {
      if (s.focused) return s;

      return ({...s, focused: true})
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter") e.preventDefault(); // Disallow new lines

    const key = e.key.toLowerCase();

    if (key === "z" && e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (
      (key === "y" && e.ctrlKey) ||
      (key === "z" && e.ctrlKey && e.shiftKey)
    ) {
      e.preventDefault();
      redo();
    }
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
      <div 
        className={clsx("searchbox", className)}
        role="searchbox"
        dir="ltr"
        contentEditable
        suppressContentEditableWarning
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-busy={searchboxState.status === "loading"}
        data-placeholder="Enter a chemical query..."
        data-empty={`${isEmpty}`}
        {...rest}
        ref={searchboxInputRef}
        onKeyDown={onKeyDown}
        onInput={closeLastQuery}
      ></div>

      {(searchboxState.focused && searchboxState.status !== "empty") &&
        <div 
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