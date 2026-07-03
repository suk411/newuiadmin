import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ExportColumn } from '../utils/export'

export interface ExportProps {
  columns: ExportColumn[]
  data: Record<string, unknown>[]
  filename: string
  loading?: boolean
}

interface ExportBarContextValue {
  exportProps: ExportProps | null
  setExportProps: (props: ExportProps | null) => void
}

const ExportBarContext = createContext<ExportBarContextValue>({ exportProps: null, setExportProps: () => {} })

export function ExportBarProvider({ children }: { children: ReactNode }) {
  const [exportProps, setExportProps] = useState<ExportProps | null>(null)
  return (
    <ExportBarContext.Provider value={{ exportProps, setExportProps }}>
      {children}
    </ExportBarContext.Provider>
  )
}

export function useExportBar() {
  return useContext(ExportBarContext)
}