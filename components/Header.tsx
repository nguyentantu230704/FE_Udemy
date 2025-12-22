'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Search, ShoppingCart, Bell, Menu, LogOut, Loader2,
    LayoutDashboard // <--- Đã thêm icon này
} from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { IUser } from '@/types';
import UserAvatar from './UserAvatar';
import { useCart } from '@/context/CartContext'; // <--- Import Context Giỏ hàng

interface CategorySimple {
    _id: string;
    name: string;
    slug: string;
}

export default function Header() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cartCount } = useCart(); // <--- Lấy số lượng giỏ hàng từ Context

    const [user, setUser] = useState<IUser | null>(null);
    const [keyword, setKeyword] = useState('');
    const [categories, setCategories] = useState<CategorySimple[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    const loadUserFromStorage = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            setUser(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('userUpdated'));
        window.location.href = '/login';
    };

    useEffect(() => {
        loadUserFromStorage();

        // Fetch Categories
        const fetchCategories = async () => {
            try {
                const { data } = await axiosClient.get('/categories');
                if (data.success) setCategories(data.data);
            } catch (error) {
                console.error("Lỗi tải danh mục menu");
            } finally {
                setLoadingCats(false);
            }
        };
        fetchCategories();

        const handleUserUpdate = () => loadUserFromStorage();
        window.addEventListener('userUpdated', handleUserUpdate);
        return () => window.removeEventListener('userUpdated', handleUserUpdate);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (keyword.trim()) {
            router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                {/* Logo & Mobile Menu */}
                <div className="flex items-center gap-4">
                    <button className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <Link href="/" className="flex-shrink-0">
                        <span className="text-2xl font-bold text-gray-900">
                            Udemy<span className="text-purple-600">Clone</span>
                        </span>
                    </Link>
                </div>

                {/* Categories */}
                <div className="hidden md:block relative group h-full flex items-center">
                    <button className="text-sm font-medium text-gray-700 hover:text-purple-600 transition h-full flex items-center">
                        Danh mục
                    </button>
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 pt-0 w-64 hidden group-hover:block transition-all">
                        <div className="bg-white border border-gray-200 shadow-xl rounded-b-md py-2 mt-0">
                            {loadingCats ? (
                                <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto w-4 h-4" /></div>
                            ) : categories.length > 0 ? (
                                categories.map(cat => (
                                    <Link key={cat._id} href={`/search?category=${cat._id}`} className="block px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 hover:text-purple-600">
                                        {cat.name}
                                    </Link>
                                ))
                            ) : (
                                <div className="p-2 text-sm text-gray-500 text-center">Chưa có danh mục</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 hidden md:flex relative max-w-2xl">
                    <button type="submit" className="absolute inset-y-0 left-3 flex items-center text-gray-400 hover:text-gray-600">
                        <Search className="w-4 h-4" />
                    </button>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-gray-50 placeholder-gray-500"
                        placeholder="Tìm kiếm khóa học..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </form>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Link cho Giảng viên */}
                    {user && user.role === 'instructor' && (
                        <Link href="/instructor/courses" className="hidden lg:block text-sm font-medium text-gray-700 hover:text-purple-600">
                            Dạy học trên Udemy
                        </Link>
                    )}

                    {/* --- CART ICON (Đã tích hợp Context) --- */}
                    <Link href="/cart" className="p-2 hover:text-purple-600 relative text-gray-600 transition">
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    {/* --------------------------------------- */}

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link href="/my-courses" className="hidden md:flex flex-col items-center group">
                                <span className="text-sm text-gray-600 group-hover:text-purple-600">Khóa học của tôi</span>
                            </Link>

                            <button className="p-2 hover:text-purple-600">
                                <Bell className="w-5 h-5" />
                            </button>

                            {/* User Menu Dropdown */}
                            <div className="relative group cursor-pointer h-full flex items-center">
                                <UserAvatar src={user.avatar} name={user.name} className="w-8 h-8 border-2 border-transparent transition group-hover:border-purple-600" />

                                <div className="absolute right-0 top-full pt-2 w-64 hidden group-hover:block z-50">
                                    <div className="bg-white border border-gray-200 shadow-xl rounded-md overflow-hidden">

                                        {/* Header Info */}
                                        <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
                                            <UserAvatar src={user.avatar} name={user.name} className="w-10 h-10 border-transparent" fontSize="text-lg" />
                                            <div className="overflow-hidden flex-1">
                                                <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="py-2">
                                            {/* --- NÚT ADMIN DASHBOARD (MỚI) --- */}
                                            {user.role === 'admin' && (
                                                <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-sm font-bold text-purple-700 transition border-b border-gray-100">
                                                    <LayoutDashboard className="w-4 h-4" /> Trang quản trị
                                                </Link>
                                            )}
                                            {/* -------------------------------- */}

                                            <Link href="/profile" className="block px-4 py-2 hover:bg-purple-50 text-sm text-gray-700 hover:text-purple-700 transition">
                                                Hồ sơ cá nhân
                                            </Link>
                                            <Link href="/my-courses" className="block px-4 py-2 hover:bg-purple-50 text-sm text-gray-700 hover:text-purple-700 transition">
                                                Quá trình học tập
                                            </Link>
                                            <Link href="/settings" className="block px-4 py-2 hover:bg-purple-50 text-sm text-gray-700 hover:text-purple-700 transition">
                                                Cài đặt tài khoản
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-100 py-2">
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2 transition font-medium">
                                                <LogOut className="w-4 h-4" /> Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="px-4 py-2 text-sm font-bold border border-gray-900 text-gray-900 hover:bg-gray-100">Đăng nhập</Link>
                            <Link href="/register" className="px-4 py-2 text-sm font-bold bg-gray-900 text-white border border-gray-900 hover:bg-gray-800">Đăng ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}