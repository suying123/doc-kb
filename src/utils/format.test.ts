import { describe, expect, it } from 'vitest'
import { formatDate, formatFileSize } from './format'

describe('formatFileSize', () => {
  it('returns 0 B for zero and invalid values', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(-1)).toBe('0 B')
    expect(formatFileSize(Number.NaN)).toBe('0 B')
  })

  it('formats bytes, KB and MB', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(1024)).toBe('1.0 KB')
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
  })
})

describe('formatDate', () => {
  it('formats an ISO string as yyyy-MM-dd HH:mm', () => {
    expect(formatDate('2026-11-01T09:05:00')).toBe('2026-11-01 09:05')
  })

  it('returns a placeholder for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('-')
  })
})
