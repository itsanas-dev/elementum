import { ConfigContext } from "@/provider/ConfigContext"
import type { AppTheme } from "@/lib/types";
import { MoonIcon, Settings, SunIcon } from "lucide-react";
import { useContext, useEffect, useRef, type MouseEvent } from "react"
import Searchbar from "@/components/ui/Searchbar";
import "@/assets/css/topbar.css"

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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      document.documentElement.setAttribute("data-themechange-compat", "true")
      setTheme(newTheme);
      return;
    }

    isSwitching.current = true;

    const themeButton = (e.target as HTMLButtonElement);
    const rect = themeButton.getBoundingClientRect();

    // FIXME: There's an error where if the address bar of the browser on Android is present
    // then the animation starts shifted upwards to where it would be with the address bar collapsed
    // I have tried to fix the address bar issue, but I can't find a way to get the height effectively.
    // So instead, I just shift it by a random amount and hope it works everywhere.
    const vx = window.visualViewport?.width ?? document.documentElement.clientWidth;
    const vy = window.visualViewport?.height ?? document.documentElement.clientHeight;
    const shouldOffset = vx <= 768 && window.scrollY <= 50;
    const x = Math.floor(rect.left + rect.width / 2);
    const y = Math.floor(rect.top + rect.height / 2) + (shouldOffset ? 50 : 0);
    const r = Math.hypot(
      Math.max(x, vx - x),
      Math.max(y, vy - y) + (shouldOffset ? 75 : 0)
    );

    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    await transition.ready;

    const windowSize = Math.hypot(window.innerWidth, window.innerHeight);

    // Make duration proportional to windowSize so that it's not too fast for small screens or too slow for larger ones.
    const duration = Math.min(Math.floor(400 + (windowSize / 1125) * 200 + 0.5), 550) // I pulled these magic numbers out of my ass, so don't worry about them.

    console.log(duration, windowSize);
    
    const wipeAnim = document.documentElement.animate({
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${r}px at ${x}px ${y}px)`
      ],
    },
    {
      duration,
      easing: "cubic-bezier(.73,.49,.26,1.01)",
      pseudoElement: '::view-transition-new(root)',
    })

    wipeAnim.onfinish = () => {
      isSwitching.current = false;
    };
  }

  useEffect(() => {
    function preventScroll(e: Event) {
      if (!isSwitching.current) return; 
      e.preventDefault();
    }

    function keyPreventScroll(e: KeyboardEvent) {
      if (!isSwitching.current) return;
      
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', 'Home', 'End'];
      if (scrollKeys.includes(e.key)) e.preventDefault();
    }

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', keyPreventScroll);

    return () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", keyPreventScroll);
    }
  }, [])

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