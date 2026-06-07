import { ModalContext } from "@/provider/ModalContext";
import clsx from "clsx";
import { useContext, type JSX } from "react";

export default function ModalTitle({className, children, ...rest}: Omit<JSX.IntrinsicElements["h2"], "id">) {
  const {titleId} = useContext(ModalContext);
  
  return (
    <h2 id={titleId} className={clsx("modal-title", className)} {...rest}>{children}</h2>
  )
}