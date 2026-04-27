export type FormatToken = 'dd' | 'MM' | 'yyyy'

export interface ParsedFormat {
  /** Ordered list of tokens as they appear in the format. */
  tokens: FormatToken[]
  /** Anchored regex that matches a fully-formed date and captures each token's digits. */
  regex: RegExp
  /** Total number of digit placeholders in the format. */
  digitCount: number
}

const TOKEN_CHARS: ReadonlySet<string> = new Set(['d', 'M', 'y'])

/**
 * Decompose a format string like `dd/MM/yyyy` into its tokens, a matching regex,
 * and a count of digit placeholders. Unrecognized sequences are treated as literal
 * separators.
 */
export function parseFormat(format: string): ParsedFormat {
  const tokens: FormatToken[] = []
  let regex = '^'
  let digitCount = 0
  let i = 0
  while (i < format.length) {
    if (format.slice(i, i + 2) === 'dd') {
      tokens.push('dd')
      regex += '(\\d{2})'
      digitCount += 2
      i += 2
    } else if (format.slice(i, i + 2) === 'MM') {
      tokens.push('MM')
      regex += '(\\d{2})'
      digitCount += 2
      i += 2
    } else if (format.slice(i, i + 4) === 'yyyy') {
      tokens.push('yyyy')
      regex += '(\\d{4})'
      digitCount += 4
      i += 4
    } else {
      regex += format[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      i++
    }
  }
  regex += '$'
  return { tokens, regex: new RegExp(regex), digitCount }
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

/** Format a Date using tokens `dd`, `MM`, `yyyy`. Tokens are replaced in order (yyyy, MM, dd) so they never collide. */
export function formatDate(date: Date, format: string): string {
  return format
    .replace(/yyyy/g, String(date.getFullYear()))
    .replace(/MM/g, pad(date.getMonth() + 1, 2))
    .replace(/dd/g, pad(date.getDate(), 2))
}

/** Parse a single date string under the given format. Returns `null` if the string does not match or the resulting date would roll over (e.g. 31/02). */
export function parseDate(input: string, format: string): Date | null {
  const { tokens, regex } = parseFormat(format)
  const match = input.match(regex)
  if (!match) return null
  let day = 0
  let month = 0
  let year = 0
  tokens.forEach((tok, idx) => {
    const value = parseInt(match[idx + 1], 10)
    if (tok === 'dd') day = value
    else if (tok === 'MM') month = value
    else year = value
  })
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

export function formatRange(
  start: Date | undefined,
  end: Date | undefined,
  format: string,
  separator: string,
): string {
  if (!start || !end) return ''
  return `${formatDate(start, format)}${separator}${formatDate(end, format)}`
}

export function parseRange(
  input: string,
  format: string,
  separator: string,
): { start: Date | null; end: Date | null } {
  const idx = input.indexOf(separator)
  if (idx === -1) return { start: null, end: null }
  return {
    start: parseDate(input.slice(0, idx), format),
    end: parseDate(input.slice(idx + separator.length), format),
  }
}

/**
 * Given a raw digit stream and a date-range template (`format` + `separator` + `format`),
 * return the display string with separators eagerly inserted. Example:
 *   applyMask('1504', 'dd/MM/yyyy', ' - ') → '15/04'
 *   applyMask('15042026', 'dd/MM/yyyy', ' - ') → '15/04/2026 - '
 */
export function applyMask(digits: string, format: string, separator: string): string {
  const template = `${format}${separator}${format}`
  let output = ''
  let digitIdx = 0
  for (let i = 0; i < template.length; i++) {
    const ch = template[i]
    if (TOKEN_CHARS.has(ch)) {
      if (digitIdx >= digits.length) break
      output += digits[digitIdx]
      digitIdx++
    } else {
      // Literal separator character — only emit once there's some content,
      // so we never start the display with a dangling separator.
      if (output === '') break
      output += ch
    }
  }
  return output
}

/** Count digit placeholders in a full range template. */
export function countRangeDigits(format: string, separator: string): number {
  const template = `${format}${separator}${format}`
  let count = 0
  for (const ch of template) if (TOKEN_CHARS.has(ch)) count++
  return count
}
