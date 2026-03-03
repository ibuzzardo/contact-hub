import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'ContactHub - University of Sydney AI Hub',
  description: 'A modern CRM application for the University of Sydney AI Hub team.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-64 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}