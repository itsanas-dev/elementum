import clsx from "clsx";
import type { JSX } from "react";
 
export default function ModalHeader({className, children, ...rest}: JSX.IntrinsicElements["div"]) {
  return (
    <div className={clsx("modal-header", className)} {...rest}>{children}</div>
  )
}