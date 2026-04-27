import { describe, it, expect } from 'vitest'
import {
  applyMask,
  countRangeDigits,
  formatDate,
  formatRange,
  parseDate,
  parseFormat,
  parseRange,
} from './mask-utils'

describe('parseFormat', () => {
  it('identifies tokens and their digit counts', () => {
    const { tokens, digitCount } = parseFormat('dd/MM/yyyy')
    expect(tokens).toEqual(['dd', 'MM', 'yyyy'])
    expect(digitCount).toBe(8)
  })

  it('supports alternate orderings', () => {
    const { tokens } = parseFormat('yyyy-MM-dd')
    expect(tokens).toEqual(['yyyy', 'MM', 'dd'])
  })

  it('builds a regex that matches the format exactly', () => {
    const { regex } = parseFormat('dd/MM/yyyy')
    expect(regex.test('15/04/2026')).toBe(true)
    expect(regex.test('1/4/2026')).toBe(false)
    expect(regex.test('15-04-2026')).toBe(false)
  })
})

describe('formatDate', () => {
  it('zero-pads day and month', () => {
    expect(formatDate(new Date(2026, 0, 5), 'dd/MM/yyyy')).toBe('05/01/2026')
  })

  it('supports yyyy-MM-dd', () => {
    expect(formatDate(new Date(2026, 3, 15), 'yyyy-MM-dd')).toBe('2026-04-15')
  })
})

describe('parseDate', () => {
  it('parses a valid date', () => {
    const d = parseDate('15/04/2026', 'dd/MM/yyyy')
    expect(d?.getFullYear()).toBe(2026)
    expect(d?.getMonth()).toBe(3)
    expect(d?.getDate()).toBe(15)
  })

  it('returns null for malformed input', () => {
    expect(parseDate('15-04-2026', 'dd/MM/yyyy')).toBeNull()
    expect(parseDate('15/4/2026', 'dd/MM/yyyy')).toBeNull()
    expect(parseDate('', 'dd/MM/yyyy')).toBeNull()
  })

  it('returns null for invalid dates (overflow)', () => {
    expect(parseDate('31/02/2026', 'dd/MM/yyyy')).toBeNull()
    expect(parseDate('00/04/2026', 'dd/MM/yyyy')).toBeNull()
    expect(parseDate('15/13/2026', 'dd/MM/yyyy')).toBeNull()
  })
})

describe('formatRange / parseRange', () => {
  it('returns empty string when either date is missing', () => {
    expect(formatRange(undefined, new Date(), 'dd/MM/yyyy', ' - ')).toBe('')
    expect(formatRange(new Date(), undefined, 'dd/MM/yyyy', ' - ')).toBe('')
  })

  it('roundtrips through format/parse', () => {
    const start = new Date(2026, 3, 5)
    const end = new Date(2026, 3, 15)
    const text = formatRange(start, end, 'dd/MM/yyyy', ' - ')
    expect(text).toBe('05/04/2026 - 15/04/2026')
    const parsed = parseRange(text, 'dd/MM/yyyy', ' - ')
    expect(parsed.start?.getTime()).toBe(start.getTime())
    expect(parsed.end?.getTime()).toBe(end.getTime())
  })

  it('returns nulls when the separator is missing', () => {
    expect(parseRange('05/04/2026', 'dd/MM/yyyy', ' - ')).toEqual({ start: null, end: null })
  })
})

describe('applyMask', () => {
  const FORMAT = 'dd/MM/yyyy'
  const SEP = ' - '

  it('returns empty for no digits', () => {
    expect(applyMask('', FORMAT, SEP)).toBe('')
  })

  it('builds progressively as digits are typed', () => {
    expect(applyMask('1', FORMAT, SEP)).toBe('1')
    expect(applyMask('15', FORMAT, SEP)).toBe('15/')
    expect(applyMask('1504', FORMAT, SEP)).toBe('15/04/')
    expect(applyMask('150420', FORMAT, SEP)).toBe('15/04/20')
    expect(applyMask('15042026', FORMAT, SEP)).toBe('15/04/2026 - ')
    expect(applyMask('150420262', FORMAT, SEP)).toBe('15/04/2026 - 2')
  })

  it('completes a full range', () => {
    expect(applyMask('1504202620042026', FORMAT, SEP)).toBe('15/04/2026 - 20/04/2026')
  })

  it('caps at the template length', () => {
    // 17 digits: the 17th is ignored because the template holds only 16 placeholders
    expect(applyMask('15042026200420260', FORMAT, SEP)).toBe('15/04/2026 - 20/04/2026')
  })
})

describe('countRangeDigits', () => {
  it('returns 16 for dd/MM/yyyy range', () => {
    expect(countRangeDigits('dd/MM/yyyy', ' - ')).toBe(16)
  })
})
