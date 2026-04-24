import { describe, it, expect } from 'vitest'
import {
  isSameDay,
  isSameMonth,
  prevMonth,
  nextMonth,
  orderDates,
  getMonthName,
  getWeekdayNames,
  generateMonthGrid,
  yearMonthFromDate,
  compareYearMonth,
  getMonthShortName,
} from './calendar-utils'

describe('isSameDay', () => {
  it('returns true for the same date', () => {
    expect(isSameDay(new Date(2026, 3, 15), new Date(2026, 3, 15))).toBe(true)
  })

  it('returns true regardless of time', () => {
    const a = new Date(2026, 3, 15, 10, 30)
    const b = new Date(2026, 3, 15, 22, 0)
    expect(isSameDay(a, b)).toBe(true)
  })

  it('returns false for different days', () => {
    expect(isSameDay(new Date(2026, 3, 15), new Date(2026, 3, 16))).toBe(false)
  })

  it('returns false for same day different month', () => {
    expect(isSameDay(new Date(2026, 3, 15), new Date(2026, 4, 15))).toBe(false)
  })

  it('returns false for same day different year', () => {
    expect(isSameDay(new Date(2026, 3, 15), new Date(2025, 3, 15))).toBe(false)
  })
})

describe('isSameMonth', () => {
  it('returns true when date is in the given year/month', () => {
    expect(isSameMonth(new Date(2026, 3, 15), { year: 2026, month: 4 })).toBe(true)
  })

  it('returns false for different month', () => {
    expect(isSameMonth(new Date(2026, 3, 15), { year: 2026, month: 3 })).toBe(false)
  })

  it('returns false for different year same month', () => {
    expect(isSameMonth(new Date(2025, 3, 15), { year: 2026, month: 4 })).toBe(false)
  })
})

describe('prevMonth', () => {
  it('goes from April to March', () => {
    expect(prevMonth({ year: 2026, month: 4 })).toEqual({
      year: 2026,
      month: 3,
    })
  })

  it('wraps from January to December of previous year', () => {
    expect(prevMonth({ year: 2026, month: 1 })).toEqual({
      year: 2025,
      month: 12,
    })
  })
})

describe('nextMonth', () => {
  it('goes from April to May', () => {
    expect(nextMonth({ year: 2026, month: 4 })).toEqual({
      year: 2026,
      month: 5,
    })
  })

  it('wraps from December to January of next year', () => {
    expect(nextMonth({ year: 2026, month: 12 })).toEqual({
      year: 2027,
      month: 1,
    })
  })
})

describe('orderDates', () => {
  it('returns [earlier, later] when a < b', () => {
    const a = new Date(2026, 2, 5)
    const b = new Date(2026, 3, 10)
    const [start, end] = orderDates(a, b)
    expect(start).toBe(a)
    expect(end).toBe(b)
  })

  it('returns [earlier, later] when b < a', () => {
    const a = new Date(2026, 3, 10)
    const b = new Date(2026, 2, 5)
    const [start, end] = orderDates(a, b)
    expect(start).toBe(b)
    expect(end).toBe(a)
  })

  it('returns same order for equal dates', () => {
    const a = new Date(2026, 3, 10)
    const b = new Date(2026, 3, 10)
    const [start, end] = orderDates(a, b)
    expect(start).toBe(a)
    expect(end).toBe(b)
  })
})

describe('getMonthName', () => {
  it('returns the month name in French by default', () => {
    const name = getMonthName(1)
    expect(name.toLowerCase()).toBe('janvier')
  })

  it('returns the month name for a given locale', () => {
    const name = getMonthName(4, 'en-US')
    expect(name.toLowerCase()).toBe('april')
  })
})

describe('getWeekdayNames', () => {
  it('returns 7 weekday names starting with Monday', () => {
    const names = getWeekdayNames('en-US')
    expect(names).toHaveLength(7)
    expect(names[0].toLowerCase()).toContain('mon')
    expect(names[6].toLowerCase()).toContain('sun')
  })
})

describe('generateMonthGrid', () => {
  it('returns 6 rows of 7 days', () => {
    const grid = generateMonthGrid(2026, 4) // April 2026
    expect(grid).toHaveLength(6)
    for (const row of grid) {
      expect(row).toHaveLength(7)
    }
  })

  it('starts on a Monday', () => {
    const grid = generateMonthGrid(2026, 4)
    // First cell should be a Monday
    expect(grid[0][0].getDay()).toBe(1) // Monday
  })

  it('contains all days of the month', () => {
    const grid = generateMonthGrid(2026, 4) // April 2026 has 30 days
    const aprilDays = grid.flat().filter((d) => d.getMonth() === 3 && d.getFullYear() === 2026)
    expect(aprilDays).toHaveLength(30)
  })

  it('includes padding days from adjacent months', () => {
    // April 2026 starts on Wednesday, so Mon/Tue should be March 30/31
    const grid = generateMonthGrid(2026, 4)
    expect(grid[0][0].getMonth()).toBe(2) // March
    expect(grid[0][0].getDate()).toBe(30)
    expect(grid[0][1].getMonth()).toBe(2) // March
    expect(grid[0][1].getDate()).toBe(31)
  })

  it('handles February in a leap year', () => {
    const grid = generateMonthGrid(2024, 2) // Feb 2024, leap year
    const febDays = grid.flat().filter((d) => d.getMonth() === 1 && d.getFullYear() === 2024)
    expect(febDays).toHaveLength(29)
  })

  it('handles February in a non-leap year', () => {
    const grid = generateMonthGrid(2026, 2)
    const febDays = grid.flat().filter((d) => d.getMonth() === 1 && d.getFullYear() === 2026)
    expect(febDays).toHaveLength(28)
  })
})

describe('yearMonthFromDate', () => {
  it('extracts year and 1-indexed month', () => {
    expect(yearMonthFromDate(new Date(2026, 3, 15))).toEqual({
      year: 2026,
      month: 4,
    })
  })
})

describe('compareYearMonth', () => {
  it('returns -1 when a is before b', () => {
    expect(compareYearMonth({ year: 2026, month: 3 }, { year: 2026, month: 4 })).toBe(-1)
  })

  it('returns 1 when a is after b', () => {
    expect(compareYearMonth({ year: 2026, month: 5 }, { year: 2026, month: 4 })).toBe(1)
  })

  it('returns 0 when equal', () => {
    expect(compareYearMonth({ year: 2026, month: 4 }, { year: 2026, month: 4 })).toBe(0)
  })

  it('handles cross-year comparison', () => {
    expect(compareYearMonth({ year: 2025, month: 12 }, { year: 2026, month: 1 })).toBe(-1)
    expect(compareYearMonth({ year: 2027, month: 1 }, { year: 2026, month: 12 })).toBe(1)
  })
})

describe('getMonthShortName', () => {
  it('returns a short month name in French by default', () => {
    const name = getMonthShortName(1)
    expect(name.toLowerCase()).toContain('janv')
  })

  it('returns a short month name for a given locale', () => {
    const name = getMonthShortName(4, 'en-US')
    expect(name.toLowerCase()).toContain('apr')
  })
})
