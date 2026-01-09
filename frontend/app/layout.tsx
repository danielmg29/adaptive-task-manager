import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Adaptive Task Manager',
  description: 'Task management system built with Adaptive Convergence',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
              <div className="container mx-auto px-4 py-3 md:py-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="text-lg md:text-xl font-bold text-primary">
                    Adaptive Task Manager
                  </Link>
                  <div className="flex gap-2 md:gap-4">
                    <Link
                      href="/tasks"
                      className="text-sm font-medium hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-secondary"
                    >
                      Tasks
                    </Link>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main>{children}</main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}