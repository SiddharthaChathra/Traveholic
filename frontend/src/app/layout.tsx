import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Coastal Erosion Intelligence Platform',
  description: 'Real-time coastal erosion monitoring and forecasting for Mangalore Coast',
  keywords: ['coastal erosion', 'shoreline monitoring', 'Mangalore', 'Karnataka', 'AI', 'satellite'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}