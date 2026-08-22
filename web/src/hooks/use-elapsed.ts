import { useEffect, useState } from 'react'

// A measured elapsed timer (FR5): wall clock since the run row was created, counted
// from the server's `created_at` so a reload does not restart it. This is the one
// interval in the app that is not server state — it polls nothing, it only re-renders
// a clock. Run state itself is polled by TanStack Query and by nothing else (AR26).
export function useElapsed(startIso: string, running: boolean): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [running])

  const start = Date.parse(startIso)
  if (Number.isNaN(start)) return 0
  return Math.max(0, now - start)
}
