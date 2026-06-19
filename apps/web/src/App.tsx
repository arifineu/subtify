import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { useAppStore } from './store/useAppStore'

function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas text-fg">
      <Navbar />
      <main className="mx-auto w-full min-h-0 max-w-7xl flex-1 p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
      <footer className="shrink-0 border-t border-line px-4 py-2 text-center text-xs text-muted">
        Subtitles sourced from YouTube’s timedtext API. For personal and educational use only.
      </footer>
    </div>
  )
}

export default App
