const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string) {
  return emailPattern.test(email)
}

export function requireFields<T extends Record<string, unknown>>(input: T, fields: string[]) {
  for (const field of fields) {
    const value = input[field]
    if (typeof value !== 'string' || value.trim().length === 0) {
      return `${field} is required`
    }
  }

  return null
}
