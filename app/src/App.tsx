import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './shell/AppShell'
import { Dashboard } from './views/Dashboard'
import { LiveView } from './views/LiveView'
import { PlaybackView } from './views/PlaybackView'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="live" element={<LiveView />} />
          <Route path="playback" element={<PlaybackView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
