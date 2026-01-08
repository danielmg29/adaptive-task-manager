/**
 * Tasks Page
 * 
 * Complete CRUD interface for Task model.
 * Demonstrates Adaptive Convergence in action:
 * - DynamicForm auto-generates from Task schema
 * - DynamicTable auto-generates from Task schema
 * - Add fields to Task model → UI updates automatically
 */

'use client';

import { useState, useEffect } from 'react';
import { DynamicForm } from '@/components/DynamicForm';
import { DynamicTable } from '@/components/DynamicTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/Task/`);

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const result = await response.json();
      setTasks(result.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle form submission (create or update)
  const handleSubmit = async (data: Record<string, any>) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const url = editingTask
        ? `${apiUrl}/api/Task/${editingTask.id}/`
        : `${apiUrl}/api/Task/`;

      const method = editingTask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      // Success: close form and refresh
      setShowForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  // Handle edit button click
  const handleEdit = (task: any) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const response = await fetch(`${apiUrl}/api/Task/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Success: refresh
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  // Handle create new button
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
          Manage your tasks with auto-generated forms and tables.
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
                submitLabel={editingTask ? 'Update Task' : 'Create Task'}
              />
            </CardContent>
          </Card>
        )}

        {/* Task List Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Tasks</CardTitle>
              <Button onClick={handleCreateNew} disabled={showForm}>
                {showForm ? 'Form Open' : 'Create New Task'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DynamicTable
              modelName="Task"
              data={tasks}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={fetchTasks}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}