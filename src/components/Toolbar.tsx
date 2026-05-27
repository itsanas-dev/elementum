import { ConfigContext } from "@/provider/ConfigContext"
import type { AppTheme } from "@/types";
import { MoonIcon, Settings, SunIcon } from "lucide-react";
import { useContext, useRef, type MouseEvent } from "react"

function getThemeToggle(theme: AppTheme): AppTheme {
  return theme === "dark" ? "light" : "dark";
}

export default function Toolbar() {
  const { theme, setTheme } = useContext(ConfigContext);
  const iconAria = `Switch to ${getThemeToggle(theme)} mode`
  const isSwitching = useRef(false);

  async function toggleTheme(e: MouseEvent<HTMLButtonElement>) {
    if (isSwitching.current) return;
    const newTheme = getThemeToggle(theme);

    // For compatibility reasons
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    isSwitching.current = true;

    const themeButton = (e.target as HTMLButtonElement);
    const rect = themeButton.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const r = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    await transition.ready;

    const wipeAnim = document.documentElement.animate({
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${r}px at ${x}px ${y}px)`
      ],
    },
    {
      duration: 325,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)',
    })

    wipeAnim.onfinish = () => {
      isSwitching.current = false;
    };
  }

  return (
    <div className="toolbar">
      <button className="icon-button" onClick={toggleTheme} aria-label={iconAria}>
        {
          theme === "dark" ?
          <MoonIcon />
          :
          <SunIcon />
        }
      </button>
      <button className="icon-button">
        <Settings />
      </button>
    </div>
  )
}