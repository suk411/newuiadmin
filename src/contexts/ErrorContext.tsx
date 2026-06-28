import { createContext, useContext, useState, type ReactNode } from 'react'

interface ErrorContextValue {
  error: string | null
  setError: (err: string | null) => void
}

const ErrorContext = createContext<ErrorContextValue>({ error: null, setError: () => {} })

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null)
  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  return useContext(ErrorContext)
}
