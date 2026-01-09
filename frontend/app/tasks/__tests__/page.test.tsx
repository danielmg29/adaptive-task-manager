/**
 * Tasks Page Integration Tests - Final Working Version
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock fetch
global.fetch = jest.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock environment variables
const originalEnv = process.env

// Mock all the dependencies at the top level
jest.mock('@/hooks/useCRUD', () => ({
  useCRUD: () => ({
    data: [],
    pagination: { page: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false },
    isLoading: false,
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  }),
}))

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => 'md',
  useMediaQuery: () => false,
  useIsMobile: () => false,
}))

jest.mock('@/components/ui/button', () => {
  return function MockButton({ children, ...props }: any) {
    return <button {...props}>{children}</button>
  }
})

jest.mock('@/components/ui/card', () => ({
  Card: function MockCard({ children, ...props }: any) {
    return <div {...props}>{children}</div>
  },
  CardHeader: function MockCardHeader({ children, ...props }: any) {
    return <div {...props}>{children}</div>
  },
  CardTitle: function MockCardTitle({ children, ...props }: any) {
    return <div {...props}>{children}</div>
  },
  CardContent: function MockCardContent({ children, ...props }: any) {
    return <div {...props}>{children}</div>
  },
}))

jest.mock('@/components/DynamicForm', () => {
  return function MockDynamicForm({ 
    modelName, 
    initialData, 
    onSubmit, 
    onCancel, 
    submitLabel 
  }: any) {
    return (
      <div data-testid="dynamic-form">
        <button onClick={() => onSubmit(initialData)}>{submitLabel}</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    )
  }
})

jest.mock('@/components/DynamicTable', () => {
  return function MockDynamicTable({ 
    modelName, 
    data, 
    loading, 
    onEdit, 
    onDelete 
  }: any) {
    return (
      <div data-testid="dynamic-table">
        {loading ? (
          <div>Loading...</div>
        ) : (
          data.map((item: any) => (
            <div key={item.id}>
              <span>{item.title}</span>
              <button onClick={() => onEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    )
  }
})

jest.mock('@/components/Pagination', () => {
  return function MockPagination({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    disabled 
  }: any) {
    return (
      <div data-testid="pagination">
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    )
  }
})

jest.mock('@/components/ResponsiveContainer', () => {
  return function MockResponsiveContainer({ children }: any) {
    return <div data-testid="responsive-container">{children}</div>
  }
})

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' ')
}))

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

// Wrapper component with QueryClient
function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Import TasksPage after all mocks are set up
import TasksPage from '../page'

describe('TasksPage', () => {
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

  it('should render page title and description', () => {
    // Mock empty task list
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        page: 1,
        total_pages: 1,
        total_count: 0,
        has_next: false,
        has_previous: false,
      }),
    })

    render(<TasksPage />, { wrapper: Wrapper })

    expect(screen.getByText(/task management/i)).toBeInTheDocument()
    expect(screen.getByText(/manage your tasks/i)).toBeInTheDocument()
  })

  it('should show create new task button', () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        page: 1,
        total_pages: 1,
        total_count: 0,
        has_next: false,
        has_previous: false,
      }),
    })

    render(<TasksPage />, { wrapper: Wrapper })

    expect(
      screen.getByRole('button', { name: /create new task/i })
    ).toBeInTheDocument()
  })

  it('should fetch and display tasks', async () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Test Task 1',
        description: 'Description 1',
        completed: false,
        priority: 'high',
      },
      {
        id: 2,
        title: 'Test Task 2',
        description: 'Description 2',
        completed: true,
        priority: 'medium',
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockTasks,
        page: 1,
        total_pages: 1,
        total_count: 2,
        has_next: false,
        has_previous: false,
      }),
    })

    render(<TasksPage />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      expect(screen.getByText('Test Task 2')).toBeInTheDocument()
    })
  })

  it('should show form when create button is clicked', async () => {
    const user = userEvent.setup()

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        page: 1,
        total_pages: 1,
        total_count: 0,
        has_next: false,
        has_previous: false,
      }),
    })

    render(<TasksPage />, { wrapper: Wrapper })

    const createButton = screen.getByRole('button', { name: /create new task/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText(/create new task/i)).toBeInTheDocument()
    })
  })

  it('should display total task count', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        page: 1,
        total_pages: 1,
        total_count: 42,
        has_next: false,
        has_previous: false,
      }),
    })

    render(<TasksPage />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByText(/42 total tasks/i)).toBeInTheDocument()
    })
  })
})