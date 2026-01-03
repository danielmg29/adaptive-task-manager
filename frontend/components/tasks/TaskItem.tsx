// WHAT: Container for a single task (display or edit mode)
// WHY: Manages the display/edit mode toggle

'use client';

import { Task } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { TaskDisplay } from './TaskDisplay';
import { TaskEdit } from './TaskEdit';

interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onSave: (id: number, title: string, description: string) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: (id: number) => void;
}

export function TaskItem({
  task,
  isEditing,
  onToggle,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
}: TaskItemProps) {
  return (
    <Card className="task-card animate-slide-in">
      {isEditing ? (
        <TaskEdit
          task={task}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      ) : (
        <TaskDisplay
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </Card>
  );
}