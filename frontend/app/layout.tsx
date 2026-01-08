import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

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
        <div className="min-h-screen bg-background">
          {/* Navigation */}
          <nav className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                  Adaptive Task Manager
                </Link>
                <div className="flex gap-4">
                  <Link
                    href="/tasks"
                    className="text-sm font-medium hover:underline"
                  >
                    Tasks
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          {/* Main Content */}
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}