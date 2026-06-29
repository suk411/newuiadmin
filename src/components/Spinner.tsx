import { LineSpinner } from 'ldrs/react'
import 'ldrs/react/LineSpinner.css'

export default function Spinner({ size = 16 }: { size?: number }) {
  return <LineSpinner size={String(size)} stroke="3" speed="1" color="black" />
}
