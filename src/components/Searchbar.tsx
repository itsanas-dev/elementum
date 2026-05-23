import clsx from "clsx"
import { Search } from "lucide-react"
import { useState, type JSX } from "react"
import "@/assets/css/searchbox.css"

type SearchbarProps = Omit<JSX.IntrinsicElements["input"], "onSubmit"> & {
  onSubmit?: (query: string) => void
}

export default function Searchbar({className, onSubmit, ...rest }: SearchbarProps) {
  return (
    <div
      className="searchbox-wrapper" 
      role="searchbox"
    >
      <Search className="search-icon" aria-hidden size={16} />
      <input 
        className={clsx("searchbox", className)} 
        placeholder="Molar mass of ..."
        {...rest} 
      />

    </div>
  )
}