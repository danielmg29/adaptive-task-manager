/**
 * DynamicTable Component
 * 
 * Automatically generates a data table based on Django model schema.
 * 
 * Features:
 * - Auto-generates columns from schema
 * - Pagination
 * - Loading states
 * - Action buttons (edit, delete)
 * - Empty states
 */

'use client';

import React from 'react';
import { useSchema } from '@/hooks/useSchema';
import { FieldSchema } from '@/types/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { useEffect, useState } from 'react';

interface DynamicTableProps {
  modelName: string;
  data?: any[];
  loading?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
  onRefresh?: () => void;
}

export function DynamicTable({
  modelName,
  data = [],
  loading = false,
  onEdit,
  onDelete,
  onRefresh,
}: DynamicTableProps) {
  const { schema, loading: schemaLoading, error } = useSchema(modelName);
  const isMobile = useIsMobile();

  // Combined loading state
  const isLoading = loading || schemaLoading;

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Render error state
  if (error || !schema) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">
          Error loading table: {error?.message || 'Schema not found'}
        </p>
      </div>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-600">
          No {schema.verbose_name_plural.toLowerCase()} found.
        </p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" className="mt-4">
            Refresh
          </Button>
        )}
      </div>
    );
  }

  // Get displayable fields (exclude auto fields and timestamps for brevity)
  const displayFields = schema.fields.filter(
    (field) =>
      field.name !== 'id' &&
      field.type !== 'AutoField' &&
      field.type !== 'BigAutoField' &&
      field.name !== 'updated_at'
  );
  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.id || index}
            className="rounded-lg border bg-card p-4 space-y-3 interactive-card"
          >
            {/* ID Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">
                #{item.id}
              </span>
              {(onEdit || onDelete) && (
                <div className="flex gap-2">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (
                          confirm(
                            `Delete this ${schema.verbose_name.toLowerCase()}?`
                          )
                        ) {
                          onDelete(item.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-2">
              {displayFields.slice(0, 4).map((field) => (
                <div key={field.name} className="text-sm">
                  <span className="text-muted-foreground">
                    {formatFieldLabel(field.name)}:{' '}
                  </span>
                  <span className="font-medium">
                    {formatCellValue(item[field.name], field)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop Table View (existing code)
  return (
    <div className="rounded-lg border responsive-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            {displayFields.map((field) => (
              <TableHead key={field.name}>
                {formatFieldLabel(field.name)}
              </TableHead>
            ))}
            {(onEdit || onDelete) && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id || index}>
              <TableCell className="font-medium">{item.id}</TableCell>

              {displayFields.map((field) => (
                <TableCell key={field.name}>
                  {formatCellValue(item[field.name], field)}
                </TableCell>
              ))}

              {(onEdit || onDelete) && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(item)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete this ${schema.verbose_name.toLowerCase()}?`
                            )
                          ) {
                            onDelete(item.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Format cell value based on field type
 */
function formatCellValue(value: any, field: FieldSchema): string {
  if (value === null || value === undefined) {
    return '-';
  }

  switch (field.type) {
    case 'BooleanField':
      return value ? '✓' : '✗';

    case 'DateField':
    case 'DateTimeField':
      return new Date(value).toLocaleDateString();

    case 'DecimalField':
    case 'FloatField':
      return typeof value === 'number' ? value.toFixed(2) : value;

    default:
      // Truncate long text
      const strValue = String(value);
      return strValue.length > 50
        ? strValue.substring(0, 50) + '...'
        : strValue;
  }
}

/**
 * Format field name for display
 */
function formatFieldLabel(fieldName: string): string {
  return fieldName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}