import type { ReactNode } from 'react'

const activeStyle = {
  padding: '6px 19px', fontSize: 11, fontWeight: 600,
  border: '1px solid #d0d0d0',
  borderRadius: 4,
  background: '#f97316',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  cursor: 'pointer', color: '#fff',
  transition: 'all 0.15s',
}

const inactiveStyle = {
  padding: '6px 19px', fontSize: 11, fontWeight: 600,
  border: '1px solid transparent',
  borderRadius: 4,
  background: '#f0f0f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  cursor: 'pointer', color: '#909399',
  transition: 'all 0.15s',
}

interface Props {
  active: boolean
  onClick: () => void
  children: ReactNode
}

export default function TabButton({ active, onClick, children }: Props) {
  return (
    <button type="button" style={active ? activeStyle : inactiveStyle} onClick={onClick}>
      {children}
    </button>
  )
}