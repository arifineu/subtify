import { Fragment, type ReactNode } from 'react'
import type { SearchResult } from '../types'
import { buildYouTubeLink, formatTimestamp } from '../utils/youtube'

interface ResultItemProps {
  result: SearchResult
  videoId: string
  query: string
}

function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim()
  if (!q) return text

  const lower = text.toLowerCase()
  const needle = q.toLowerCase()
  const nodes: ReactNode[] = []
  let cursor = 0
  let key = 0

  while (cursor < text.length) {
    const idx = lower.indexOf(needle, cursor)
    if (idx === -1) {
      nodes.push(<Fragment key={key++}>{text.slice(cursor)}</Fragment>)
      break
    }
    if (idx > cursor) {
      nodes.push(<Fragment key={key++}>{text.slice(cursor, idx)}</Fragment>)
    }
    nodes.push(
      <mark key={key++} className="rounded bg-[#ff0000] px-0.5 text-white">
        {text.slice(idx, idx + needle.length)}
      </mark>
    )
    cursor = idx + needle.length
  }

  return nodes
}

export function ResultItem({ result, videoId, query }: ResultItemProps) {
  const href = buildYouTubeLink(videoId, result.line.start)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-between rounded-[8px] border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-left transition-colors hover:border-[#ff0000]"
    >
      <span className="truncate pr-3 text-sm text-[#f1f1f1]">
        {highlightMatch(result.line.text, query)}
      </span>
      <span className="shrink-0 font-mono text-sm text-[#aaaaaa]">
        {formatTimestamp(result.line.start)}
      </span>
    </a>
  )
}
