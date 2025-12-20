'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, List, PlusCircle, LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Hook điều hướng
import { IUser } from '@/types'; // Import type User


export default function InstructorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);


    const sidebarItems = [
        { icon: LayoutDashboard, label: 'Bảng điều khiển', href: '/instructor/courses' },
        { icon: PlusCircle, label: 'Tạo khóa học mới', href: '/instructor/courses/create' },
        { icon: BarChart, label: 'Doanh thu (Coming soon)', href: '#' },
    ];

    useEffect(() => {
        // 1. Lấy user từ LocalStorage
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            // Chưa đăng nhập -> Đá về login
            router.push('/login');
            return;
        }

        const user: IUser = JSON.parse(storedUser);

        // 2. Kiểm tra Role
        if (user.role !== 'instructor' && user.role !== 'admin') {
            // Không phải giảng viên -> Đá về trang chủ
            router.push('/');
        } else {
            // Cho phép hiển thị
            setAuthorized(true);
        }
    }, []);

    // Nếu chưa check xong quyền thì chưa hiện nội dung (tránh nháy giao diện)
    if (!authorized) return null;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar bên trái */}
            <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 font-bold text-2xl tracking-tight">
                    Instructor<span className="text-purple-400">Studio</span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Link href="/" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition">
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm">Về trang chủ</span>
                    </Link>
                </div>
            </aside>

            {/* Nội dung chính bên phải */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}