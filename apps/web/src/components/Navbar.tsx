import { NavLink } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

const baseClass = 'rounded-md px-3 py-2 text-sm font-medium transition-colors'
const activeClass = 'text-accent underline underline-offset-4'
const inactiveClass = 'text-fg hover:text-accent'

export function Navbar() {
  return (
    <nav className="border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 p-4">
        <NavLink
          to="/"
          className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
        >
          Search
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
        >
          History
        </NavLink>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
