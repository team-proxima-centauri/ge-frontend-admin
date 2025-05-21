import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthGuard from '@/components/AuthGuard';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Groceryease Admin',
  description: 'Admin dashboard for Groceryease',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className='flex h-screen bg-gray-50 antialiased'>
        <AuthGuard>
          {/* The Sidebar will be conditionally rendered inside AuthGuard based on pathname */}
          <div className='flex-1 flex flex-col overflow-hidden'>
            <main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8'>
              {children}
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}

