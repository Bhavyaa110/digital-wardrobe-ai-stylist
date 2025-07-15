import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "../components/ui/toaster"
import { WardrobeProvider } from '../context/WardrobeContext';

export const metadata: Metadata = {
  title: 'Fitzy Wardrobe',
  description: 'Your digital wardrobe stylist',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Pacifico&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        <WardrobeProvider>
          {children}
          <Toaster />
        </WardrobeProvider>
      </body>
    </html>
  );
}
