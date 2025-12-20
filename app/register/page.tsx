'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AxiosError } from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import axiosClient from '../../utils/axiosClient';
import { IUser, ApiError } from '../../types';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axiosClient.post<IUser>('/auth/register', {
                name,
                email,
                password,
                role: 'student'
            });

            toast.success('Tạo tài khoản thành công!');
            localStorage.setItem('token', data.token || '');
            localStorage.setItem('user', JSON.stringify(data));

            setTimeout(() => {
                window.location.href = '/';
            }, 800);

        } catch (error) {
            const err = error as AxiosError<ApiError>;
            const mess = err.response?.data?.message || 'Có lỗi xảy ra!';
            toast.error(mess);
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
                        Đăng ký và bắt đầu học
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Tạo tài khoản để truy cập hàng ngàn khóa học
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        {/* Input Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Họ và tên
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition"
                                placeholder="Ví dụ: Nguyễn Văn A"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Input Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Input Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mật khẩu
                            </label>
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
                            <p className="mt-1 text-xs text-gray-500">Mật khẩu nên có ít nhất 6 ký tự.</p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                'Đăng ký'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="font-bold text-gray-900 hover:text-purple-600 transition">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}