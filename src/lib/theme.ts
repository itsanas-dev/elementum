import type { AppTheme } from "@/lib/types"

type ThemeDef = {
  metalloid: string,
  transitionMetal: string,
  alkaliMetal: string,
  alkaliEarth: string,
  nonMetal: string,
  nobleGas: string,
  halogen: string,
  postTransitionMetal: string,

  unknown: string,
  seriesBlock: string,

  lanthanides: string,
  actinides: string
}

export const AppThemes: Record<AppTheme, ThemeDef> = {
  "dark": {
    metalloid: "#55b7bb",
    transitionMetal: "#caa411",
    alkaliMetal: "#c45164",
    alkaliEarth: "#cd8028",
    nonMetal: "#3a7fd5",
    seriesBlock: "#8cb8c6",
    halogen: "#be61af",
    nobleGas: "#a452c2",
    postTransitionMetal: "#93ad37",
    unknown: "#ffffff",

    lanthanides: "#92c4d8",
    actinides: "#58a7c6"
  },

  "light": {
    metalloid: "#55b7bb",
    transitionMetal: "hsl(49, 85%, 61%)",
    alkaliMetal: "#ea4f6d",
    alkaliEarth: "#f39629",
    nonMetal: "#4792ef",
    seriesBlock: "#85c4d7",
    halogen: "#da6fc9",
    nobleGas: "#af55d0",
    postTransitionMetal: "#9bb831",
    unknown: "#919191",

    lanthanides: "#8dcde6",
    actinides: "#4fa7c9",
  }
}