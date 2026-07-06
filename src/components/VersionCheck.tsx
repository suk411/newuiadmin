import { useEffect, useRef } from 'react'
import { useToast } from '../contexts/ToastContext'

const VERSION_KEY = 'app_version'
const TS_KEY = 'app_version_check_ts'
const CHECK_INTERVAL = 5 * 60 * 1000
const AUTO_RELOAD_DELAY = 3000

export default function VersionCheck() {
  const { toast } = useToast()
  const warnedRef = useRef(false)

  useEffect(() => {
    const check = async () => {
      const lastTs = parseInt(localStorage.getItem(TS_KEY) || '0', 10)
      if (Date.now() - lastTs < CHECK_INTERVAL) return

      try {
        const res = await fetch(`/version.json?t=${Date.now()}`)
        const { version } = await res.json()
        const stored = localStorage.getItem(VERSION_KEY)

        if (stored && stored !== version && !warnedRef.current) {
          warnedRef.current = true
          localStorage.setItem(VERSION_KEY, version)
          toast(
            `New version ${version} available — reloading`,
            'success',
            { label: 'Refresh Now', onClick: () => { warnedRef.current = false; window.location.reload() } }
          )
          setTimeout(() => { warnedRef.current = false; window.location.reload() }, AUTO_RELOAD_DELAY)
        } else if (!stored) {
          localStorage.setItem(VERSION_KEY, version)
        }

        localStorage.setItem(TS_KEY, String(Date.now()))
      } catch {}
    }

    check()
    const id = setInterval(check, CHECK_INTERVAL)
    return () => clearInterval(id)
  }, [toast])

  return null
}
