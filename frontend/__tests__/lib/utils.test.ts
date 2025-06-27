import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      const result = cn('px-4', 'py-2', 'bg-blue-500')
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class', 'another-class')
      expect(result).toBe('base-class active-class another-class')
    })

    it('handles false conditional classes', () => {
      const isActive = false
      const result = cn('base-class', isActive && 'active-class', 'another-class')
      expect(result).toBe('base-class another-class')
    })

    it('handles undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'valid-class')
      expect(result).toBe('base-class valid-class')
    })

    it('merges conflicting Tailwind classes correctly', () => {
      const result = cn('px-4 px-2', 'py-2 py-4')
      // twMerge should resolve conflicts, keeping the last one
      expect(result).toContain('px-2')
      expect(result).toContain('py-4')
    })

    it('handles empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles array of classes', () => {
      const classes = ['px-4', 'py-2', 'bg-blue-500']
      const result = cn(classes)
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })

    it('handles object with boolean values', () => {
      const result = cn({
        'px-4': true,
        'py-2': true,
        'bg-red-500': false,
        'bg-blue-500': true
      })
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })
  })
})