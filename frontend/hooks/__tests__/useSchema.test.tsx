/**
 * useSchema Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useSchema } from '../useSchema'

// Mock fetch
global.fetch = jest.fn()

// Mock environment variables
const originalEnv = process.env

describe('useSchema', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_URL: 'http://localhost:8000'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should fetch schema successfully', async () => {
    const mockSchema = {
      model_name: 'Task',
      app_label: 'tasks',
      fields: [
        {
          name: 'title',
          type: 'CharField',
          required: true,
          max_length: 200,
        },
      ],
      verbose_name: 'Task',
      verbose_name_plural: 'Tasks',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSchema,
    })

    const { result } = renderHook(() => useSchema('Task'))

    // Initially loading
    expect(result.current.loading).toBe(true)
    expect(result.current.schema).toBe(null)

    // Wait for data
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.schema).toEqual(mockSchema)
    expect(result.current.error).toBe(null)
  })

  it('should handle fetch error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    })

    const { result } = renderHook(() => useSchema('NonExistent'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.schema).toBe(null)
    expect(result.current.error).not.toBe(null)
    expect(result.current.error?.message).toContain('Failed to fetch schema')
  })

  it('should handle network error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    )

    const { result } = renderHook(() => useSchema('Task'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error?.message).toBe('Network error')
  })

  it('should refetch when model name changes', async () => {
    const mockTaskSchema = {
      model_name: 'Task',
      fields: [],
      verbose_name: 'Task',
      verbose_name_plural: 'Tasks',
    }

    const mockUserSchema = {
      model_name: 'User',
      fields: [],
      verbose_name: 'User',
      verbose_name_plural: 'Users',
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTaskSchema,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserSchema,
      })

    const { result, rerender } = renderHook(
      ({ modelName }) => useSchema(modelName),
      { initialProps: { modelName: 'Task' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.schema?.model_name).toBe('Task')

    // Change model name
    rerender({ modelName: 'User' })

    await waitFor(() => {
      expect(result.current.schema?.model_name).toBe('User')
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})