import * as dateFns from 'date-fns'

export function isDateFormatValid (date: string, dateFormat: string): boolean {
  if (!date || !dateFormat) return false

  const dateInstance = new Date(date)
  return dateFns.format(dateInstance, dateFormat) === date
}
