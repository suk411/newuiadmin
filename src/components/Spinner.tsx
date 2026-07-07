export default function Spinner({ size = 16 }: { size?: number }) {
  return <span role="status" aria-label="Loading" className="loading-spinner" style={{ width: size, height: size }} />
}
