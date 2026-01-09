import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto py-8 md:py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 md:space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Adaptive Task Manager
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with Adaptive Convergence philosophy: Schema-driven development
            with zero redundancy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/tasks">
              <Button size="lg" className="w-full sm:w-auto">
                View Tasks
              </Button>
            </Link>
            
            <a
              href="https://github.com/danielmg29/adaptive-task-manager"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View on GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-8">
          <Card className="interactive-card">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <CardTitle className="text-lg md:text-xl">Schema-Driven</CardTitle>
            </CardHeader>
            <CardContent className="text-sm md:text-base text-muted-foreground">
              Backend defines models once. Frontend adapts automatically with zero
              manual synchronization.
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <CardTitle className="text-lg md:text-xl">Zero Redundancy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm md:text-base text-muted-foreground">
              One dynamic form works for all models. No boilerplate, no duplication,
              infinite scalability.
            </CardContent>
          </Card>

          <Card className="interactive-card sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <CardTitle className="text-lg md:text-xl">Performance First</CardTitle>
            </CardHeader>
            <CardContent className="text-sm md:text-base text-muted-foreground">
              Optimistic updates, intelligent caching, and 20x faster perceived
              performance.
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <div className="pt-8 md:pt-12 border-t">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 md:mb-8">
            Built With
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Django', desc: 'Python backend' },
              { name: 'Next.js', desc: 'React framework' },
              { name: 'PostgreSQL', desc: 'Database' },
              { name: 'React Query', desc: 'Data caching' },
            ].map((tech) => (
              <div
                key={tech.name}
                className="text-center p-4 rounded-lg bg-muted/50"
              >
                <p className="font-semibold text-sm md:text-base">{tech.name}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}