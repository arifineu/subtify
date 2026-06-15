import { NavLink } from 'react-router-dom'

const baseClass = 'rounded-md px-3 py-2 text-sm font-medium transition-colors'
const activeClass = 'text-[#ff0000] underline underline-offset-4'
const inactiveClass = 'text-[#f1f1f1] hover:text-[#ff0000]'

export function Navbar() {
  return (
    <nav className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
      <div className="mx-auto flex w-full max-w-5xl gap-2 p-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          Search
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          History
        </NavLink>
      </div>
    </nav>
  )
}
