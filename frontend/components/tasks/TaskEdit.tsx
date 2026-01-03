// WHAT: Editable form for a task
// WHY: Separate edit logic from display logic

'use client';

import { useState } from 'react';
import { Task } from '@/lib/api';
import { CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from "sonner";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TaskEditProps {
  task: Task;
  onSave: (id: number, title: string, description: string) => Promise<void>;
  onCancel: () => void;
}

export function TaskEdit({ task, onSave, onCancel }: TaskEditProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      await onSave(task.id, title.trim(), description.trim());
      
      // 🎉 SUCCESS TOAST
      toast.success('Task updated successfully!', {
        description: 'Your changes have been saved.',
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      
      // ❌ ERROR TOAST
      toast.error('Failed to update task', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
      
      setIsSaving(false);
    }
  }

  // Keyboard shortcuts
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Edit Task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" onKeyDown={handleKeyDown}>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          disabled={isSaving}
          autoFocus
        />
        
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          disabled={isSaving}
        />
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Press Escape to cancel, Ctrl+Enter to save
          </p>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size={16} className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );
}