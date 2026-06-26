import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Todo',
  description: 'Your brutally honest AI todo list',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}