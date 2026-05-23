import { LoaderCircle } from "lucide-react";

type Props = {
  size?: number
}

export default function LoadingFallback({size}: Props) {
  return (
    <div className="loading-spinner">
      <LoaderCircle size={size ?? 32} />
    </div>
  )
}