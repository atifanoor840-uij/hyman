import { BuysContent } from "@/components/buys/buys-content"
// Theme tokens (card, muted, primary, border…) live in the workspace stylesheet; without them the
// checkout panel renders transparent.
import "../dashboard/globals.css"

export default function BuyChallengePage() {
  return (
    <div className="dashboard-authentic min-h-screen">
      <BuysContent />
    </div>
  )
}

