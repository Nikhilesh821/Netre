import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './shell/AppShell'
import { Dashboard } from './views/Dashboard'
import { LiveView } from './views/LiveView'
import { PlaybackView } from './views/PlaybackView'
import { EventsView } from './views/EventsView'
import { ErrorBoundary } from './components/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary title="App Crashed">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="live" element={<LiveView />} />
            <Route path="events" element={<EventsView />} />
            <Route path="playback" element={<PlaybackView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
