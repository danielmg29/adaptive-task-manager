/**
 * DynamicForm Component
 * 
 * Automatically generates a form based on Django model schema.
 * 
 * Adaptive Convergence Principle:
 * - Backend defines fields once in models.py
 * - Frontend reads schema and generates form automatically
 * - Add/remove fields in backend → form updates automatically
 * 
 * Supports:
 * - All Django field types (CharField, TextField, BooleanField, etc.)
 * - Field validation (required, max_length)
 * - Choices (renders as select dropdowns)
 * - Help text (renders as field descriptions)
 */

'use client';

import { useSchema } from '@/hooks/useSchema';
import { FieldSchema } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, FormEvent } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DynamicFormProps {
  modelName: string;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function DynamicForm({
  modelName,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
}: DynamicFormProps) {
  const { schema, loading, error } = useSchema(modelName);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [submitting, setSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Update form data when field changes
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Render error state
  if (error || !schema) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">
          Error loading form: {error?.message || 'Schema not found'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {schema.fields.map((field) => (
        <DynamicField
          key={field.name}
          field={field}
          value={formData[field.name]}
          onChange={(value) => handleFieldChange(field.name, value)}
        />
      ))}

      <div className="flex gap-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : submitLabel}
        </Button>

        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

/**
 * DynamicField Component
 * 
 * Renders the appropriate input based on field type.
 */
interface DynamicFieldProps {
  field: FieldSchema;
  value: any;
  onChange: (value: any) => void;
}

function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  // Skip auto-generated fields
  if (field.name === 'id' || field.type === 'AutoField' || field.type === 'BigAutoField') {
    return null;
  }

  // Skip auto timestamp fields
  if (field.name === 'created_at' || field.name === 'updated_at') {
    return null;
  }

  // Render field based on type
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {formatFieldLabel(field.name)}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {renderInput(field, value, onChange)}

      {field.help_text && (
        <p className="text-sm text-muted-foreground">{field.help_text}</p>
      )}
    </div>
  );
}

/**
 * Render appropriate input based on field type
 */
function renderInput(field: FieldSchema, value: any, onChange: (value: any) => void) {
  const inputId = field.name;

  // Handle fields with choices (render as select)
  if (field.choices && field.choices.length > 0) {
    return (
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger id={inputId}>
          <SelectValue placeholder={`Select ${formatFieldLabel(field.name)}`} />
        </SelectTrigger>
        <SelectContent>
          {field.choices.map((choice) => (
            <SelectItem key={choice.value} value={choice.value}>
              {choice.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Handle different field types
  switch (field.type) {
    case 'TextField':
      return (
        <Textarea
          id={inputId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder={`Enter ${formatFieldLabel(field.name)}`}
        />
      );

    case 'BooleanField':
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={inputId}
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor={inputId} className="font-normal">
            {field.help_text || formatFieldLabel(field.name)}
          </Label>
        </div>
      );

    case 'IntegerField':
    case 'BigIntegerField':
    case 'SmallIntegerField':
      return (
        <Input
          type="number"
          id={inputId}
          value={value || ''}
          onChange={(e) => onChange(parseInt(e.target.value) || '')}
          required={field.required}
          placeholder={`Enter ${formatFieldLabel(field.name)}`}
        />
      );

    case 'DecimalField':
    case 'FloatField':
      return (
        <Input
          type="number"
          step="0.01"
          id={inputId}
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || '')}
          required={field.required}
          placeholder={`Enter ${formatFieldLabel(field.name)}`}
        />
      );

    case 'DateField':
      return (
        <Input
          type="date"
          id={inputId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );

    case 'DateTimeField':
      return (
        <Input
          type="datetime-local"
          id={inputId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );

    case 'EmailField':
      return (
        <Input
          type="email"
          id={inputId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder={`Enter ${formatFieldLabel(field.name)}`}
        />
      );

    case 'URLField':
      return (
        <Input
          type="url"
          id={inputId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder={`Enter ${formatFieldLabel(field.name)}`}
        />
      );

    case 'CharField':
    default:
      return (
        <Input
          type="text"
          id={inputId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          maxLength={field.max_length}
          placeholder={`Enter ${formatFieldLabel(field.name)}`}
        />
      );
  }
}

/**
 * Format field name for display
 * Example: "due_date" → "Due Date"
 */
function formatFieldLabel(fieldName: string): string {
  return fieldName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}