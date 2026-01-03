// WHAT: Displays a task in read mode
// WHY: Separation of concerns - display vs edit logic

'use client';

import { Task } from '@/lib/api';
import { CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface TaskDisplayProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export function TaskDisplay({ task, onToggle, onEdit, onDelete }: TaskDisplayProps) {
  function handleDelete() {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  }

  return (
    <>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
        <div className="flex items-center space-x-4 flex-1">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task)}
          />
          <CardTitle 
            className={`cursor-pointer text-base md:text-lg ${
              task.completed ? 'line-through text-muted-foreground' : ''
            }`}
            onClick={() => onEdit(task)}
          >
            {task.title}
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2 ml-9 sm:ml-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </CardHeader>
      {task.description && (
        <CardContent>
          <p className="text-xs md:text-sm text-muted-foreground">
            {task.description}
          </p>
        </CardContent>
      )}
    </>
  );
}