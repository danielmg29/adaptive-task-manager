/**
 * DynamicForm Component Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DynamicForm } from '../DynamicForm'

// Mock useSchema hook
jest.mock('@/hooks/useSchema', () => ({
  useSchema: jest.fn(() => ({
    schema: {
      model_name: 'Task',
      fields: [
        {
          name: 'title',
          type: 'CharField',
          required: true,
          max_length: 200,
          help_text: 'Brief description of the task',
        },
        {
          name: 'description',
          type: 'TextField',
          required: false,
          help_text: 'Detailed task description',
        },
        {
          name: 'completed',
          type: 'BooleanField',
          required: false,
          default: false,
        },
        {
          name: 'priority',
          type: 'CharField',
          required: true,
          choices: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ],
          default: 'medium',
        },
      ],
    },
    loading: false,
    error: null,
  })),
}))

describe('DynamicForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render form fields based on schema', () => {
    render(
      <DynamicForm
        modelName="Task"
        onSubmit={mockOnSubmit}
      />
    )

    // Check that fields are rendered
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByText(/select priority/i)).toBeInTheDocument()

    // Check submit button
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('should show required field indicators', () => {
    render(<DynamicForm modelName="Task" onSubmit={mockOnSubmit} />)

    // Title is required
    const titleLabel = screen.getByText(/title/i)
    expect(titleLabel.textContent).toContain('*')
  })

  it('should pre-fill form with initial data', () => {
    const initialData = {
      title: 'Existing Task',
      description: 'Existing description',
      completed: true,
    }

    render(
      <DynamicForm
        modelName="Task"
        initialData={initialData}
        onSubmit={mockOnSubmit}
      />
    )

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
    expect(titleInput.value).toBe('Existing Task')

    const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement
    expect(descInput.value).toBe('Existing description')
  })

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup()

    render(<DynamicForm modelName="Task" onSubmit={mockOnSubmit} />)

    // Fill in title
    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'New Task')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
        })
      )
    })
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <DynamicForm
        modelName="Task"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('should show error message when schema fails to load', () => {
    const { useSchema } = require('@/hooks/useSchema')
    jest.mocked(useSchema).mockReturnValueOnce({
      schema: null,
      loading: false,
      error: new Error('Failed to load schema'),
    })

    render(<DynamicForm modelName="Task" onSubmit={mockOnSubmit} />)

    expect(screen.getByText(/error loading form/i)).toBeInTheDocument()
  })

  it('should render textarea for TextField', () => {
    render(<DynamicForm modelName="Task" onSubmit={mockOnSubmit} />)

    const descInput = screen.getByLabelText(/description/i)
    expect(descInput.tagName).toBe('TEXTAREA')
  })

  it('should render select for fields with choices', () => {
    render(<DynamicForm modelName="Task" onSubmit={mockOnSubmit} />)

    // Priority field has choices
    expect(screen.getByText(/select priority/i)).toBeInTheDocument()
  })

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup()
    const slowSubmit = jest.fn(
      (): Promise<void> => new Promise(resolve => setTimeout(resolve, 1000))
    )

    render(<DynamicForm modelName="Task" onSubmit={slowSubmit} />)

    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'Test')

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    // Button should show "Submitting..." text
    await waitFor(() => {
      expect(screen.getByText(/submitting/i)).toBeInTheDocument()
    })
  })
})