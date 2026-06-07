import { ConfigContext } from "@/provider/ConfigContext"
import type { AppTheme } from "@/lib/types";
import { MoonIcon, Settings, SunIcon } from "lucide-react";
import { useContext, useRef } from "react"
import Searchbar from "@/components/ui/searchbar/Searchbox";
import "@/assets/css/topbar.css"

function getThemeToggle(theme: AppTheme): AppTheme {
  return theme === "dark" ? "light" : "dark";
}

export default function Toolbar() {
  const { theme, setTheme } = useContext(ConfigContext);
  const iconAria = `Switch to ${getThemeToggle(theme)} mode`
  const canChange = useRef(true);

  async function toggleTheme() {
    if (!canChange.current) return;

    canChange.current = false;

    const newTheme = getThemeToggle(theme);

    document.documentElement.setAttribute("data-themechange", "true");
    setTheme(newTheme);

    // Very crude fixed timeout. Add a more flexible approach later.
    setTimeout(() => {
      canChange.current = true;
      document.documentElement.removeAttribute("data-themechange");
    }, 250)
  }

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Searchbar />
      </div>
      <nav className="toolbar" aria-label="Site controls">
        <button className="icon-button" onClick={toggleTheme} aria-label={iconAria}>
          {theme === "dark" ? <MoonIcon /> : <SunIcon />}
        </button>
        <button className="icon-button">
          <Settings />
        </button>
      </nav>
    </header>
  )
}