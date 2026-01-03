// WHAT: Home page of our application
// WHY: Entry point that users see

import { TaskList } from '@/components/task-list';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Task Manager
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Manage your tasks efficiently
        </p>
      </div>
      
      <TaskList />
    </main>
  );
}