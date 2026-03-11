'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AxiosError } from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import axiosClient from '../../utils/axiosClient';
import { IUser, ApiError } from '../../types';

// --- IMPORT GOOGLE LOGIN COMPONENT ---
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // --- MỚI: STATE GHI NHỚ ĐĂNG NHẬP ---
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    // --- LOGIC ĐĂNG NHẬP BẰNG TÀI KHOẢN THƯỜNG ---
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axiosClient.post<IUser>('/auth/login', { email, password });
            toast.success('Đăng nhập thành công!');

            // 💡 MỚI: Lựa chọn nơi lưu trữ dựa vào checkbox
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('token', data.token || '');
            storage.setItem('user', JSON.stringify(data));

            setTimeout(() => { window.location.href = '/'; }, 800);
        } catch (error) {
            const err = error as AxiosError<ApiError>;
            const mess = err.response?.data?.message || 'Email hoặc mật khẩu không đúng!';
            toast.error(mess);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC ĐĂNG NHẬP BẰNG GOOGLE ---
    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        try {
            const { data } = await axiosClient.post<any>('/auth/google', {
                credential: credentialResponse.credential
            });

            toast.success('Đăng nhập Google thành công!');

            // 💡 MỚI: Áp dụng logic lưu trữ thông minh cho cả Google Login
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('token', data.token || '');
            storage.setItem('user', JSON.stringify(data));

            setTimeout(() => { window.location.href = '/'; }, 800);
        } catch (error) {
            const err = error as AxiosError<ApiError>;
            toast.error(err.response?.data?.message || 'Lỗi đăng nhập bằng Google!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />

            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        Đăng nhập vào Udemy
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Tiếp tục hành trình học tập của bạn
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoFocus // 💡 MỚI: Tự động focus con trỏ
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {/* 💡 MỚI: Cột chặt ô checkbox với State */}
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                Ghi nhớ đăng nhập
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500">Quên mật khẩu?</a>
                        </div>
                    </div>

                    <div>
                        {/* 💡 MỚI: Vô hiệu hóa nút khi thiếu dữ liệu email/password */}
                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out ${(loading || !email || !password) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Đang xử lý...</> : 'Đăng nhập'}
                        </button>
                    </div>
                </form>

                {/* --- KHU VỰC NÚT ĐĂNG NHẬP GOOGLE --- */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Hoặc tiếp tục với
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error('Đăng nhập Google thất bại!')}
                            theme="outline"
                            size="large"
                            text="continue_with"
                            width="100%"
                        />
                    </div>
                </div>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="font-bold text-gray-900 hover:text-purple-600 transition">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}