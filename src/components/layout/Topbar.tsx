import { ConfigContext } from "@/provider/ConfigContext"
import type { AppTheme } from "@/lib/types";
import { MoonIcon, Settings, SunIcon } from "lucide-react";
import { useContext, useRef, useState } from "react"
import Searchbar from "@/components/ui/searchbox/Searchbox";
import SettingsModal from "@/components/layout/modal/SettingsModal";
import "@/assets/css/topbar.css"

function getThemeToggle(theme: AppTheme): AppTheme {
  return theme === "dark" ? "light" : "dark";
}

export default function Toolbar() {
  const { theme, setTheme } = useContext(ConfigContext);
  const [settings, setModalShow] = useState(false);
  const iconAria = `Switch to ${getThemeToggle(theme)} mode`
  const canChange = useRef(true);

  async function toggleTheme() {
    if (!canChange.current) return;

    canChange.current = false;

    const newTheme = getThemeToggle(theme);

    setTheme(newTheme);

    setTimeout(() => {
      canChange.current = true;
    }, 50)
  }

  return (
    <>
      <SettingsModal show={settings} close={() => setModalShow(false)} />
      <header className="topbar">
        <div className="topbar-search">
          <Searchbar />
        </div>
        <nav className="toolbar" aria-label="Site controls">
          <button className="icon-button" onClick={toggleTheme} aria-label={iconAria}>
            {theme === "dark" ? <MoonIcon /> : <SunIcon />}
          </button>
          <button onClick={() => setModalShow(true)} className="icon-button">
            <Settings />
          </button>
        </nav>
      </header>
    </>
  )
}