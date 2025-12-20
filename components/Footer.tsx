import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Grid Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div className="flex flex-col gap-2">
                        <Link href="#" className="text-sm hover:underline">Udemy Business</Link>
                        <Link href="#" className="text-sm hover:underline">Dạy học trên Udemy</Link>
                        <Link href="#" className="text-sm hover:underline">Tải ứng dụng</Link>
                        <Link href="#" className="text-sm hover:underline">Giới thiệu</Link>
                        <Link href="#" className="text-sm hover:underline">Hãy liên hệ với chúng tôi</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Link href="#" className="text-sm hover:underline">Nghề nghiệp</Link>
                        <Link href="#" className="text-sm hover:underline">Blog</Link>
                        <Link href="#" className="text-sm hover:underline">Trợ giúp và Hỗ trợ</Link>
                        <Link href="#" className="text-sm hover:underline">Đơn vị liên kết</Link>
                        <Link href="#" className="text-sm hover:underline">Nhà đầu tư</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Link href="#" className="text-sm hover:underline">Điều khoản</Link>
                        <Link href="#" className="text-sm hover:underline">Chính sách quyền riêng tư</Link>
                        <Link href="#" className="text-sm hover:underline">Cài đặt cookie</Link>
                        <Link href="#" className="text-sm hover:underline">Sơ đồ trang web</Link>
                        <Link href="#" className="text-sm hover:underline">Tuyên bố về khả năng tiếp cận</Link>
                    </div>

                    {/* Language Selector (Demo) */}
                    <div className="flex flex-col gap-4 items-start">
                        <button className="flex items-center gap-2 border border-white px-4 py-2 text-sm hover:bg-gray-800 transition">
                            <Globe className="w-4 h-4" />
                            <span>Tiếng Việt</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700">
                    <div className="mb-4 md:mb-0">
                        <span className="text-2xl font-bold text-white">
                            Udemy<span className="text-gray-400">Clone</span>
                        </span>
                    </div>
                    <div className="text-xs text-gray-400">
                        © 2025 Udemy Clone, Inc. Create by <span className="underline decoration-green-400 decoration-1 underline-offset-3">
                            DevTeam
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}