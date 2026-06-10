import { ConfigContext } from "@/provider/ConfigContext";
import { useContext, useEffect, useRef } from "react";

export default function ThemeProvider() {
  const {theme} = useContext(ConfigContext);
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const link = useRef(document.head.querySelector("link[data-first='true'][rel='icon']") as HTMLLinkElement);
  
  useEffect(() => {
    link.current.href = dark ? `/favicon-light.svg` : `/favicon-dark.svg`

    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, dark])

  return null;
}