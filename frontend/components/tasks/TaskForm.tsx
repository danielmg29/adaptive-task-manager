// WHAT: Form for creating new tasks
// WHY: Separated from list for reusability and clarity
// ADAPTIVE CONVERGENCE: This will become DynamicForm next week

'use client';

import { useState } from 'react';
import { taskAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from "sonner";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TaskFormProps {
  onTaskCreated: (task: any) => void; // Callback when task is created
}

export function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newTask = await taskAPI.create({
        title: title.trim(),
        description: description.trim(),
        completed: false,
      });
      
      // Clear form
      setTitle('');
      setDescription('');
      
      // Notify parent component
      onTaskCreated(newTask);
      
      // 🎉 SUCCESS TOAST
      toast.success('Task created successfully!', {
        description: `"${newTask.title}" has been added to your list.`,
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      
      // ❌ ERROR TOAST
      toast.error('Failed to create task', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Keyboard shortcut: Ctrl+Enter to submit
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e as any);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Press Ctrl+Enter to submit
            </p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={16} className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}