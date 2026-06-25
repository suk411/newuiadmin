import { useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

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
  '/gift-codes': 'Gift Codes',
  '/logs': 'Admin Logs',
  '/vip-config': 'VIP Config',
  '/turnover-config': 'Turnover Config',
  '/agency': 'Agency',
  '/wingo': 'Wingo',
}

export default function TagsView({ tags, onClose }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

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
    <div className="tags-view">
      <div className="tags-view__scroll" ref={scrollRef}>
        {tags.map((tag) => {
          const isActive = location.pathname === tag.path
          return (
            <span
              key={tag.path}
              className={`tags-view-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(tag.path)}
            >
              {tag.title}
              {tags.length > 1 && (
                <span
                  className="tags-view-item-close"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose(tag.path)
                  }}
                >
                  ✕
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
