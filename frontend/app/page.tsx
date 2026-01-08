import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Adaptive Task Manager
        </h1>
        <p className="text-xl text-muted-foreground">
          Built with Adaptive Convergence philosophy: Schema-driven development
          with zero redundancy.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/tasks">
            <Button size="lg">View Tasks</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Schema-Driven</CardTitle>
            </CardHeader>
            <CardContent>
              Backend defines models once. Frontend adapts automatically.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zero Redundancy</CardTitle>
            </CardHeader>
            <CardContent>
              One dynamic form works for all models. No boilerplate code.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance First</CardTitle>
            </CardHeader>
            <CardContent>
              Functional programming, efficient queries, optimized rendering.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}