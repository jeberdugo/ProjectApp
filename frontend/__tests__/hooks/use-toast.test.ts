import { renderHook, act } from '@testing-library/react'
import { useToast, toast, reducer } from '@/hooks/use-toast'

describe('useToast', () => {
  beforeEach(() => {
    // Clear any existing toasts - this will be handled by individual tests
  })

  it('starts with empty toasts array', () => {
    const { result } = renderHook(() => useToast())
    
    expect(result.current.toasts).toEqual([])
  })

  it('adds a toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'Test Description'
      })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Test Toast',
      description: 'Test Description',
      open: true
    })
  })

  it('adds toast with all properties', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Error Toast',
        description: 'Something went wrong',
        variant: 'destructive'
      })
    })

    expect(result.current.toasts[0]).toMatchObject({
      title: 'Error Toast',
      description: 'Something went wrong',
      variant: 'destructive'
    })
  })

  it('dismisses a toast by id', () => {
    const { result } = renderHook(() => useToast())

    let toastId: string

    act(() => {
      const toastResult = result.current.toast({
        title: 'Test Toast'
      })
      toastId = toastResult.id
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.dismiss(toastId)
    })

    expect(result.current.toasts[0].open).toBe(false)
  })

  it('dismisses all toasts when no id provided', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ title: 'Toast 1' })
      result.current.toast({ title: 'Toast 2' })
    })

    // Should only keep 1 toast due to TOAST_LIMIT
    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.toasts[0].open).toBe(false)
  })

  it('limits number of toasts to TOAST_LIMIT', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ title: 'Toast 1' })
      result.current.toast({ title: 'Toast 2' })
    })

    // Should only keep the most recent toast (TOAST_LIMIT = 1)
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Toast 2')
  })
})

describe('toast function', () => {
  it('returns toast object with id and methods', () => {
    const toastResult = toast({ title: 'Test' })

    expect(toastResult).toHaveProperty('id')
    expect(toastResult).toHaveProperty('dismiss')
    expect(toastResult).toHaveProperty('update')
    expect(typeof toastResult.id).toBe('string')
    expect(typeof toastResult.dismiss).toBe('function')
    expect(typeof toastResult.update).toBe('function')
  })

  it('generates unique ids', () => {
    const toast1 = toast({ title: 'Test 1' })
    const toast2 = toast({ title: 'Test 2' })

    expect(toast1.id).not.toBe(toast2.id)
  })

  it('dismiss method works', () => {
    const { result } = renderHook(() => useToast())
    
    let toastResult: any

    act(() => {
      toastResult = toast({ title: 'Test' })
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      toastResult.dismiss()
    })

    expect(result.current.toasts[0].open).toBe(false)
  })

  it('update method works', () => {
    const { result } = renderHook(() => useToast())
    
    let toastResult: any

    act(() => {
      toastResult = toast({ title: 'Original Title' })
    })

    expect(result.current.toasts[0].title).toBe('Original Title')

    act(() => {
      toastResult.update({ title: 'Updated Title' })
    })

    expect(result.current.toasts[0].title).toBe('Updated Title')
  })
})

describe('reducer', () => {
  const initialState = { toasts: [] }

  it('handles ADD_TOAST action', () => {
    const toast = {
      id: '1',
      title: 'Test Toast',
      open: true,
      onOpenChange: jest.fn()
    }

    const action = {
      type: 'ADD_TOAST' as const,
      toast
    }

    const newState = reducer(initialState, action)

    expect(newState.toasts).toHaveLength(1)
    expect(newState.toasts[0]).toBe(toast)
  })

  it('handles UPDATE_TOAST action', () => {
    const existingToast = {
      id: '1',
      title: 'Original',
      open: true,
      onOpenChange: jest.fn()
    }

    const state = { toasts: [existingToast] }

    const action = {
      type: 'UPDATE_TOAST' as const,
      toast: { id: '1', title: 'Updated' }
    }

    const newState = reducer(state, action)

    expect(newState.toasts[0].title).toBe('Updated')
    expect(newState.toasts[0].id).toBe('1')
  })

  it('handles DISMISS_TOAST action for specific toast', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true, onOpenChange: jest.fn() }
    const toast2 = { id: '2', title: 'Toast 2', open: true, onOpenChange: jest.fn() }
    
    const state = { toasts: [toast1, toast2] }

    const action = {
      type: 'DISMISS_TOAST' as const,
      toastId: '1'
    }

    const newState = reducer(state, action)

    expect(newState.toasts[0].open).toBe(false)
    expect(newState.toasts[1].open).toBe(true)
  })

  it('handles DISMISS_TOAST action for all toasts', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true, onOpenChange: jest.fn() }
    const toast2 = { id: '2', title: 'Toast 2', open: true, onOpenChange: jest.fn() }
    
    const state = { toasts: [toast1, toast2] }

    const action = {
      type: 'DISMISS_TOAST' as const
    }

    const newState = reducer(state, action)

    expect(newState.toasts.every(t => t.open === false)).toBe(true)
  })

  it('handles REMOVE_TOAST action for specific toast', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true, onOpenChange: jest.fn() }
    const toast2 = { id: '2', title: 'Toast 2', open: true, onOpenChange: jest.fn() }
    
    const state = { toasts: [toast1, toast2] }

    const action = {
      type: 'REMOVE_TOAST' as const,
      toastId: '1'
    }

    const newState = reducer(state, action)

    expect(newState.toasts).toHaveLength(1)
    expect(newState.toasts[0].id).toBe('2')
  })

  it('handles REMOVE_TOAST action for all toasts', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true, onOpenChange: jest.fn() }
    const toast2 = { id: '2', title: 'Toast 2', open: true, onOpenChange: jest.fn() }
    
    const state = { toasts: [toast1, toast2] }

    const action = {
      type: 'REMOVE_TOAST' as const
    }

    const newState = reducer(state, action)

    expect(newState.toasts).toHaveLength(0)
  })

  it('respects TOAST_LIMIT when adding toasts', () => {
    const existingToast = {
      id: '1',
      title: 'Existing',
      open: true,
      onOpenChange: jest.fn()
    }

    const state = { toasts: [existingToast] }

    const newToast = {
      id: '2',
      title: 'New Toast',
      open: true,
      onOpenChange: jest.fn()
    }

    const action = {
      type: 'ADD_TOAST' as const,
      toast: newToast
    }

    const newState = reducer(state, action)

    // Should only keep 1 toast (TOAST_LIMIT = 1)
    expect(newState.toasts).toHaveLength(1)
    expect(newState.toasts[0]).toBe(newToast)
  })
})