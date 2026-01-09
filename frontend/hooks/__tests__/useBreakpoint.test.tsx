/**
 * useBreakpoint Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { useBreakpoint, useIsMobile } from '../useBreakpoint'

describe('useBreakpoint', () => {
  it('should return mobile on small screen', () => {
    // Set window width to 375px
    global.innerWidth = 375

    const { result } = renderHook(() => useBreakpoint())

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe('mobile')
  })

  it('should return md on tablet screen', () => {
    global.innerWidth = 768

    const { result } = renderHook(() => useBreakpoint())

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe('md')
  })

  it('should return lg on desktop screen', () => {
    global.innerWidth = 1024

    const { result } = renderHook(() => useBreakpoint())

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe('lg')
  })

  it('should update on window resize', () => {
    global.innerWidth = 375
    const { result } = renderHook(() => useBreakpoint())

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe('mobile')

    // Resize to desktop
    act(() => {
      global.innerWidth = 1280
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe('xl')
  })
})

describe('useIsMobile', () => {
  it('should return true on mobile', () => {
    // Mock matchMedia to return true for mobile query
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 768px)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return false on desktop', () => {
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })
})