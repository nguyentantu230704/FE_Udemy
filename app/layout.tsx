import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Font chữ đẹp 
import './globals.css';
import Header from '../components/Header'; // Import Header
import Footer from '../components/Footer'; // Import Footer
import { CartProvider } from '@/context/CartContext'; // Import mới
import Script from 'next/script';

import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart LMS - Học trực tuyến',
  description: 'Nền tảng học lập trình tốt nhất',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <CartProvider>
            <Header />

            <main className="min-h-screen bg-white text-gray-900">
              {children}
              <Script
                src="https://platform-api.sharethis.com/js/sharethis.js#property=69af9fd4a66a5988ab6aaff9&product=sop"
                strategy="lazyOnload"
              />
            </main>

            <Footer />
          </CartProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}