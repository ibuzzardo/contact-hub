import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'ContactHub',
  description: 'Multi-page contact manager with SQLite backend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-64 min-h-screen flex flex-col bg-background-light overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}