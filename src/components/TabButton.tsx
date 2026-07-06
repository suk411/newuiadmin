import type { ReactNode } from 'react'
import './TabButton.css'

interface Props {
  active: boolean
  onClick: () => void
  children: ReactNode
}

export default function TabButton({ active, onClick, children }: Props) {
  return (
    <button type="button" role="tab" aria-selected={active} className={`tab-btn ${active ? 'tab-btn--active' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}
