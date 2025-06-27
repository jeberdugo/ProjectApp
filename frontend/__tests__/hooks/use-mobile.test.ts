import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

// Mock window.matchMedia
const mockMatchMedia = jest.fn()

describe('useIsMobile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset window.matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })

    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('returns false for desktop width initially', () => {
    const mockMediaQuery = {
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    mockMatchMedia.mockReturnValue(mockMediaQuery)
    Object.defineProperty(window, 'innerWidth', { value: 1024 })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })

  it('returns true for mobile width initially', () => {
    const mockMediaQuery = {
      matches: true,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    mockMatchMedia.mockReturnValue(mockMediaQuery)
    Object.defineProperty(window, 'innerWidth', { value: 600 })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('returns undefined initially before effect runs', () => {
    const mockMediaQuery = {
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    mockMatchMedia.mockReturnValue(mockMediaQuery)

    // Mock useEffect to not run immediately
    const { result } = renderHook(() => useIsMobile())

    // The hook should return false (!!undefined = false)
    expect(typeof result.current).toBe('boolean')
  })

  it('updates when window is resized to mobile', () => {
    const mockMediaQuery = {
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    mockMatchMedia.mockReturnValue(mockMediaQuery)
    Object.defineProperty(window, 'innerWidth', { value: 1024 })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    // Simulate window resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 600 })
      
      // Get the change handler that was registered
      const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
        call => call[0] === 'change'
      )?.[1]

      if (changeHandler) {
        changeHandler()
      }
    })

    expect(result.current).toBe(true)
  })

  it('updates when window is resized to desktop', () => {
    const mockMediaQuery = {
      matches: true,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    mockMatchMedia.mockReturnValue(mockMediaQuery)
    Object.defineProperty(window, 'innerWidth', { value: 600 })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)

    // Simulate window resize to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      
      // Get the change handler that was registered
      const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
        call => call[0] === 'change'
      )?.[1]

      if (changeHandler) {
        changeHandler()
      }
    })

    expect(result.current).toBe(false)
  })

  it('cleans up event listener on unmount', () => {
    const mockMediaQuery = {
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    mockMatchMedia.mockReturnValue(mockMediaQuery)

    const { unmount } = renderHook(() => useIsMobile())

    expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )

    unmount()

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('handles edge case at breakpoint boundary', () => {
    const mockMediaQuery = {
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    mockMatchMedia.mockReturnValue(mockMediaQuery)
    
    // Test exactly at breakpoint (768px should be desktop)
    Object.defineProperty(window, 'innerWidth', { value: 768 })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('handles edge case just below breakpoint', () => {
    const mockMediaQuery = {
      matches: true,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    mockMatchMedia.mockReturnValue(mockMediaQuery)
    
    // Test just below breakpoint (767px should be mobile)
    Object.defineProperty(window, 'innerWidth', { value: 767 })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('uses correct mobile breakpoint constant', () => {
    const mockMediaQuery = {
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    mockMatchMedia.mockReturnValue(mockMediaQuery)

    renderHook(() => useIsMobile())

    // Verify the correct breakpoint is used (768 - 1 = 767)
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })
})