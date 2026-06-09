import clsx from "clsx";
import type { JSX } from "react";
 
export default function ModalContent({className, children, ...rest}: JSX.IntrinsicElements["div"]) {
  return (
    <div className={clsx("modal-content", className)} {...rest}>{children}</div>
  )
}