import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Font chữ đẹp giống Udemy
import './globals.css';
import Header from '../components/Header'; // Import Header
import Footer from '../components/Footer'; // Import Footer

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Udemy Clone - Học trực tuyến',
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
        {/* Header luôn nằm trên cùng */}
        <Header />

        {/* Phần nội dung chính sẽ thay đổi tùy theo trang */}
        {/* min-h-screen giúp đẩy Footer xuống đáy nếu nội dung ngắn */}
        <main className="min-h-screen bg-white text-gray-900">
          {children}
        </main>

        {/* Footer luôn nằm dưới cùng */}
        <Footer />
      </body>
    </html>
  );
}