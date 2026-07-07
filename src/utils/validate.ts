export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

type Rule = (value: unknown, label: string) => string | null

export function required(): Rule {
  return (v, label) => (v == null || v === '' ? `${label} is required` : null)
}

export function numeric(): Rule {
  return (v, label) => (v != null && v !== '' && isNaN(Number(v)) ? `${label} must be numeric` : null)
}

export function min(n: number): Rule {
  return (v, label) => (v != null && v !== '' && Number(v) < n ? `${label} must be at least ${n}` : null)
}

export function max(n: number): Rule {
  return (v, label) => (v != null && v !== '' && Number(v) > n ? `${label} must be at most ${n}` : null)
}

export function oneOf(options: readonly string[]): Rule {
  return (v, label) => (v != null && v !== '' && !options.includes(String(v)) ? `${label} must be one of: ${options.join(' | ')}` : null)
}

export function futureDate(): Rule {
  return (v, label) => {
    if (v == null || v === '') return null
    const d = new Date(String(v))
    return isNaN(d.getTime()) || d <= new Date() ? `${label} must be a future date` : null
  }
}

export function check(label: string, value: unknown, ...rules: Rule[]): void {
  for (const rule of rules) {
    const err = rule(value, label)
    if (err) throw new ValidationError(err)
  }
}
