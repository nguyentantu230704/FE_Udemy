'use client';
import { LayoutDashboard, Users, List, DollarSign, LogOut, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    pendingPayouts?: number;
}

export default function AdminSidebar({ activeTab, setActiveTab, pendingPayouts = 0 }: Props) {
    const router = useRouter();

    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'users', label: 'Người dùng', icon: <Users className="w-5 h-5" /> },
        { id: 'categories', label: 'Danh mục', icon: <List className="w-5 h-5" /> },
        { id: 'payouts', label: 'Rút tiền', icon: <DollarSign className="w-5 h-5" />, badge: pendingPayouts },
        { id: 'courses', label: 'Khóa học', icon: <BookOpen className="w-5 h-5" /> }
    ];

    return (
        <div className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col min-h-screen">
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-blue-400">Admin Panel</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 font-medium ${activeTab === item.id
                            ? 'bg-blue-600 text-white shadow-lg translate-x-1'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {item.icon} <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {item.badge}
                            </span>
                        ) : null}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <LogOut className="w-5 h-5" /> Về trang chủ
                </button>
            </div>
        </div>
    );
}