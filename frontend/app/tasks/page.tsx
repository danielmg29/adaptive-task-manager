/**
 * Tasks Page (Performance Optimized)
 * 
 * Now using React Query for:
 * - Automatic caching
 * - Optimistic updates
 * - Background refetching
 * - Request deduplication
 */

'use client';

import { useState } from 'react';
import { DynamicForm } from '@/components/DynamicForm';
import { DynamicTable } from '@/components/DynamicTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRUD } from '@/hooks/useCRUD';
import { Pagination } from '@/components/Pagination';

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Use React Query for data management
  const {
    data: tasks,
    pagination,
    isLoading,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCRUD('Task', {
    page: currentPage,
    pageSize: 50,
  });

  // Handle form submission
  const handleSubmit = async (data: Record<string, any>) => {
    if (editingTask) {
      // Update existing task
      update(
        { id: editingTask.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingTask(null);
          },
        }
      );
    } else {
      // Create new task
      create(data, {
        onSuccess: () => {
          setShowForm(false);
        },
      });
    }
  };

  // Handle edit
  const handleEdit = (task: any) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = (id: number) => {
    remove(id);
  };

  // Handle create new
  const handleCreateNew = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your tasks with optimized caching and instant updates.
        </p>
      </div>

      <div className="space-y-6">
        {/* Create/Edit Form Card */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicForm
                modelName="Task"
                initialData={editingTask || {}}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel={
                  editingTask
                    ? isUpdating
                      ? 'Updating...'
                      : 'Update Task'
                    : isCreating
                    ? 'Creating...'
                    : 'Create Task'
                }
              />
            </CardContent>
          </Card>
        )}

        {/* Task List Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Tasks</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {pagination.totalCount} total tasks
                </p>
              </div>
              <Button
                onClick={handleCreateNew}
                disabled={showForm || isCreating}
              >
                {showForm ? 'Form Open' : 'Create New Task'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DynamicTable
              modelName="Task"
              data={tasks}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
                disabled={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}