import { LoaderCircle, type LucideProps } from "lucide-react";
import type { RefAttributes } from "react";

type Props = Omit<RefAttributes<SVGSVGElement>, "ref"> & LucideProps

export default function LoadingFallback({size, ...rest}: Props) {
  return (
    <div className="loading-spinner">
      <LoaderCircle className="icon-noshrink" size={size ?? 32} {...rest} />
    </div>
  )
}