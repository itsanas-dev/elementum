import { createContext } from "react"

export type ModalContextObject = {
  titleId: string,

  closeModal: () => void
}

export const ModalContext = createContext<ModalContextObject>({
  titleId: "",
  closeModal: () => console.log("No ModalProvider found. Add ModalProvider to Modal component.")
})