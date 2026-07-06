import { useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useExportBar } from './ExportBarContext'
import ExportButton from './ExportButton'

export interface TagItem {
  path: string
  title: string
}

interface Props {
  tags: TagItem[]
  onClose: (path: string) => void
}

export const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/recharge': 'Recharge List',
  '/withdrawals': 'Withdrawals',
  '/transactions': 'Transactions',
  '/users': 'Users',
  '/bets': 'Bet Records',
  '/logs': 'Admin Logs',
  '/settings': 'Settings',
  '/agency': 'Agency',
  '/wingo': 'Wingo',
  '/telegram-bot': 'Telegram Bot',
}

export default function TagsView({ tags, onClose }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { exportProps } = useExportBar()

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current
      const active = el.querySelector('.tags-view-item.active') as HTMLElement | null
      if (active) {
        active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
      }
    }
  }, [location.pathname])

  return (
    <div className="tags-view" role="tablist" aria-label="Page tabs">
      <div className="tags-view__scroll" ref={scrollRef}>
        {tags.map((tag) => {
          const isActive = location.pathname === tag.path
          return (
            <button
              key={tag.path}
              role="tab"
              aria-selected={isActive}
              className={`tags-view-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(tag.path)}
            >
              {tag.title}
              {tags.length > 1 && (
                <span
                  className="tags-view-item-close"
                  role="button"
                  tabIndex={0}
                  aria-label={`Close ${tag.title} tab`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose(tag.path)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      onClose(tag.path)
                    }
                  }}
                >
                  ✕
                </span>
              )}
            </button>
          )
        })}
      </div>
      {exportProps && (
        <div className="tags-view__export">
          <ExportButton columns={exportProps.columns} data={exportProps.data} filename={exportProps.filename} />
        </div>
      )}
    </div>
  )
}