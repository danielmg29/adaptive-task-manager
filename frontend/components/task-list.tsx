// WHAT: Orchestrates task list with create/edit/delete operations
// WHY: Main container that manages state and coordinates child components
// ADAPTIVE CONVERGENCE: This becomes DynamicTable next week

'use client';

import { useEffect, useState } from 'react';
import { taskAPI, Task } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TaskForm } from './tasks/TaskForm';
import { TaskItem } from './tasks/TaskItem';
import { toast } from "sonner";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);
  
  async function fetchTasks() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskAPI.getAll();
      setTasks(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }

  function handleTaskCreated(newTask: Task) {
    setTasks([newTask, ...tasks]);
  }

  async function handleToggle(task: Task) {
    try {
      const updatedTask = await taskAPI.update(task.id, {
        completed: !task.completed,
      });
      
      setTasks(tasks.map(t => 
        t.id === task.id ? updatedTask : t
      ));
      
      // 🎉 SUCCESS TOAST
      toast.success(
        updatedTask.completed ? 'Task completed! 🎉' : 'Task reopened',
        {
          description: `"${updatedTask.title}"`,
        }
      );
      
    } catch (err) {
      console.error('Toggle task error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      
      // ❌ ERROR TOAST
      toast.error('Failed to update task', {
        description: 'Please try again.',
      });
    }
  }

  function handleEdit(task: Task) {
    setEditingTaskId(task.id);
  }

  async function handleSave(id: number, title: string, description: string) {
    const updatedTask = await taskAPI.update(id, { title, description });
    
    setTasks(tasks.map(t => 
      t.id === id ? updatedTask : t
    ));
    
    setEditingTaskId(null);
  }

  function handleCancelEdit() {
    setEditingTaskId(null);
  }

  async function handleDelete(id: number) {
    try {
      // Find task before deleting (for toast message)
      const taskToDelete = tasks.find(t => t.id === id);
      
      await taskAPI.delete(id);
      setTasks(tasks.filter(t => t.id !== id));
      
      // 🎉 SUCCESS TOAST
      toast.success('Task deleted', {
        description: taskToDelete ? `"${taskToDelete.title}" has been removed.` : undefined,
      });
      
    } catch (err) {
      console.error('Delete task error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      
      // ❌ ERROR TOAST
      toast.error('Failed to delete task', {
        description: 'Please try again.',
      });
    }
  }
  
  return (
    <div className="space-y-6">
      <TaskForm onTaskCreated={handleTaskCreated} />

      {loading && (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <LoadingSpinner size={32} className="text-primary" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      )}
      
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchTasks} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
      
      {!loading && !error && tasks.length === 0 && (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">
            No tasks yet. Create one to get started!
          </p>
        </div>
      )}
      
      {!loading && !error && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isEditing={editingTaskId === task.id}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancelEdit={handleCancelEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}