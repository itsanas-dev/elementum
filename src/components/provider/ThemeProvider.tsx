import { ConfigContext } from "@/provider/ConfigContext";
import { useContext, useEffect } from "react";

export default function ThemeProvider() {
  const {theme} = useContext(ConfigContext);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme])

  return null;
}