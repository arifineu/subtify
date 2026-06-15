import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0f0f0f] text-[#f1f1f1]">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
      <footer className="border-t border-[#2a2a2a] px-4 py-3 text-center text-xs text-[#aaaaaa]">
        Subtitles sourced from YouTube’s timedtext API. For personal and educational use only.
      </footer>
    </div>
  )
}

export default App
