'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Search, ShoppingCart, Bell, Menu, LogOut, Loader2,
    LayoutDashboard, Award, ShieldCheck // 💡 THÊM: Award (Logo) và ShieldCheck (Icon tra cứu)
} from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { IUser } from '@/types';
import UserAvatar from './UserAvatar';
import { useCart } from '@/context/CartContext';

interface CategorySimple {
    _id: string;
    name: string;
    slug: string;
}

export default function Header() {
    const router = useRouter();
    const { cartCount } = useCart();

    const [user, setUser] = useState<IUser | null>(null);
    const [keyword, setKeyword] = useState('');
    const [categories, setCategories] = useState<CategorySimple[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    const loadUserFromStorage = () => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            } else {
                setUser(null);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

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

                {/* Khu vực 1: Mobile Menu & LOGO MỚI */}
                <div className="flex items-center gap-4">
                    <button className="md:hidden p-2 hover:bg-gray-100 rounded-full transition">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>

                    {/* 💡 LOGO ĐỒNG BỘ VỚI CHỨNG CHỈ */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <div className="w-9 h-9 bg-purple-700 rounded-lg flex items-center justify-center text-white shadow-md group-hover:bg-purple-800 transition-colors">
                            <Award className="w-5 h-5" />
                        </div>
                        <div className="hidden sm:flex flex-col justify-center">
                            <span className="text-xl font-black text-gray-900 uppercase tracking-wide leading-none">SmartLMS</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Platform</span>
                        </div>
                    </Link>
                </div>

                {/* Khu vực 2: Menu điều hướng (Categories & Xác thực) */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Categories Dropdown */}
                    <div className="relative group h-full flex items-center py-5">
                        <button className="text-sm font-bold text-gray-700 hover:text-purple-600 transition flex items-center">
                            Danh mục
                        </button>
                        <div className="absolute top-full left-0 pt-0 w-64 hidden group-hover:block transition-all">
                            <div className="bg-white border border-gray-200 shadow-xl rounded-b-md py-2 mt-0">
                                {loadingCats ? (
                                    <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto w-4 h-4 text-purple-600" /></div>
                                ) : categories.length > 0 ? (
                                    categories.map(cat => (
                                        <Link key={cat._id} href={`/search?category=${cat._id}`} className="block px-4 py-3 hover:bg-purple-50 text-sm font-medium text-gray-700 hover:text-purple-700 transition">
                                            {cat.name}
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-gray-500 text-center">Chưa có danh mục</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 💡 LINK TRA CỨU CHỨNG CHỈ CÔNG KHAI */}
                    <Link href="/verify" className="text-sm font-bold text-gray-700 hover:text-purple-600 transition flex items-center gap-1.5 group">
                        <ShieldCheck className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        Xác thực
                    </Link>
                </div>

                {/* Khu vực 3: Thanh tìm kiếm */}
                <form onSubmit={handleSearch} className="flex-1 hidden lg:flex relative max-w-xl mx-4">
                    <button type="submit" className="absolute inset-y-0 left-3 flex items-center text-gray-400 hover:text-purple-600 transition">
                        <Search className="w-4 h-4" />
                    </button>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                        placeholder="Tìm kiếm khóa học..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </form>

                {/* Khu vực 4: Các nút thao tác (Giỏ hàng, User) */}
                <div className="flex items-center gap-1 sm:gap-3">

                    {user && user.role === 'instructor' && (
                        <Link href="/instructor/courses" className="hidden xl:block text-sm font-bold text-gray-700 hover:text-purple-600 transition mr-2">
                            Dạy học trên SmartLMS
                        </Link>
                    )}

                    {/* Giỏ hàng */}
                    <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full relative text-gray-600 transition">
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Link href="/my-courses" className="hidden md:flex flex-col items-center group px-2 py-1 rounded-md hover:bg-purple-50 transition">
                                <span className="text-sm font-bold text-gray-700 group-hover:text-purple-700">Khóa học của tôi</span>
                            </Link>

                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
                                <Bell className="w-5 h-5" />
                            </button>

                            {/* Dropdown User */}
                            <div className="relative group cursor-pointer h-full flex items-center py-2">
                                <UserAvatar src={user.avatar} name={user.name} className="w-8 h-8 border-2 border-transparent transition group-hover:border-purple-600" />

                                <div className="absolute right-0 top-full pt-1 w-64 hidden group-hover:block z-50">
                                    <div className="bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">

                                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                                            <UserAvatar src={user.avatar} name={user.name} className="w-10 h-10 border-transparent" fontSize="text-lg" />
                                            <div className="overflow-hidden flex-1">
                                                <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="py-2">
                                            {user.role === 'admin' && (
                                                <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-sm font-bold text-purple-700 transition border-b border-gray-100">
                                                    <LayoutDashboard className="w-4 h-4" /> Trang quản trị
                                                </Link>
                                            )}

                                            <Link href="/profile" className="block px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-purple-700 transition">
                                                Hồ sơ cá nhân
                                            </Link>
                                            <Link href="/my-courses" className="block px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-purple-700 transition">
                                                Quá trình học tập
                                            </Link>
                                            <Link href="/settings" className="block px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-purple-700 transition">
                                                Cài đặt tài khoản
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-100 py-2">
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-bold text-red-600 flex items-center gap-2 transition">
                                                <LogOut className="w-4 h-4" /> Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 ml-2">
                            <Link href="/login" className="px-4 py-2 text-sm font-bold rounded-full text-gray-700 hover:bg-gray-100 transition">Đăng nhập</Link>
                            <Link href="/register" className="px-5 py-2 text-sm font-bold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition shadow-md hover:shadow-lg">Đăng ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}