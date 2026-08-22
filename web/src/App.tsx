import { Link, Route, Routes } from 'react-router'

import { RunPage } from '@/routes/run'
import { SubmitPage } from '@/routes/submit'

// Two routes, as D24 leaves them: `/` submits and lists, `/runs/:id` watches and reviews.
// There is no `/history` — the recent-runs list is a section of `/`.
function App() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10">
      <header className="grid gap-1">
        <Link to="/" className="font-heading text-2xl font-medium">
          MenuLens
        </Link>
        <p className="text-sm text-muted-foreground">
          The model reports what it saw and quotes the menu; deterministic rules decide which
          rows you still have to check.
        </p>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<SubmitPage />} />
          <Route path="/runs/:id" element={<RunPage />} />
          <Route
            path="*"
            element={
              <p className="text-sm text-muted-foreground">
                Nothing lives at this address.{' '}
                <Link to="/" className="underline">
                  Back to the form
                </Link>
              </p>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
