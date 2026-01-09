/**
 * DynamicTable Component Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DynamicTable } from '../DynamicTable'

// Mock hooks
jest.mock('@/hooks/useSchema', () => ({
  useSchema: jest.fn(() => ({
    schema: {
      model_name: 'Task',
      fields: [
        { name: 'id', type: 'BigAutoField' },
        { name: 'title', type: 'CharField', required: true },
        { name: 'completed', type: 'BooleanField', required: false },
        { name: 'priority', type: 'CharField', required: true },
        { name: 'created_at', type: 'DateTimeField' },
      ],
      verbose_name: 'Task',
      verbose_name_plural: 'Tasks',
    },
    loading: false,
    error: null,
  })),
}))

jest.mock('@/hooks/useBreakpoint', () => ({
  useIsMobile: jest.fn(() => false),
}))

describe('DynamicTable', () => {
  const mockData = [
    {
      id: 1,
      title: 'Task 1',
      completed: false,
      priority: 'high',
      created_at: '2024-01-01T10:00:00Z',
    },
    {
      id: 2,
      title: 'Task 2',
      completed: true,
      priority: 'medium',
      created_at: '2024-01-02T10:00:00Z',
    },
  ]

  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render table with data', () => {
    render(
      <DynamicTable
        modelName="Task"
        data={mockData}
      />
    )

    // Check table headers
    expect(screen.getByText(/title/i)).toBeInTheDocument()
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
    expect(screen.getByText(/priority/i)).toBeInTheDocument()

    // Check data rows
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
  })

  it('should show empty state when no data', () => {
    render(
      <DynamicTable
        modelName="Task"
        data={[]}
      />
    )

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument()
  })

  it('should show loading skeleton while loading', () => {
    render(
      <DynamicTable
        modelName="Task"
        data={[]}
        loading={true}
      />
    )

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should render edit and delete buttons when handlers provided', () => {
    render(
      <DynamicTable
        modelName="Task"
        data={mockData}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })

    expect(editButtons).toHaveLength(2)
    expect(deleteButtons).toHaveLength(2)
  })

  it('should call onEdit with correct item', async () => {
    const user = userEvent.setup()

    render(
      <DynamicTable
        modelName="Task"
        data={mockData}
        onEdit={mockOnEdit}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    expect(mockOnEdit).toHaveBeenCalledWith(mockData[0])
  })

  it('should show confirmation before deleting', async () => {
    const user = userEvent.setup()
    global.confirm = jest.fn(() => true)

    render(
      <DynamicTable
        modelName="Task"
        data={mockData}
        onDelete={mockOnDelete}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])

    expect(global.confirm).toHaveBeenCalled()
    expect(mockOnDelete).toHaveBeenCalledWith(1)
  })

  it('should not delete if user cancels confirmation', async () => {
    const user = userEvent.setup()
    global.confirm = jest.fn(() => false)

    render(
      <DynamicTable
        modelName="Task"
        data={mockData}
        onDelete={mockOnDelete}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])

    expect(global.confirm).toHaveBeenCalled()
    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('should format boolean values correctly', () => {
    render(
      <DynamicTable
        modelName="Task"
        data={mockData}
      />
    )

    // Task 1 is not completed (should show ✗)
    // Task 2 is completed (should show ✓)
    const cells = screen.getAllByRole('cell')
    const booleanCells = cells.filter(cell => 
      cell.textContent === '✓' || cell.textContent === '✗'
    )

    expect(booleanCells.length).toBeGreaterThan(0)
  })

  it('should render mobile card view on mobile', () => {
    // Mock mobile viewport
    jest.mocked(require('@/hooks/useBreakpoint').useIsMobile).mockReturnValue(true)

    render(
      <DynamicTable
        modelName="Task"
        data={mockData}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    // Should not render table
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    // Should render cards (check for task titles in card format)
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
  })
})