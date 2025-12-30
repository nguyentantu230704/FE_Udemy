'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const { token } = useParams();
    const router = useRouter();

    // State quản lý form
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Toggle hiện pass
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validate Client
        if (password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Mật khẩu nhập lại không khớp!");
            return;
        }

        setLoading(true);
        try {
            await axiosClient.put(`/auth/resetpassword/${token}`, { password });
            toast.success("Đổi mật khẩu thành công!");
            setTimeout(() => router.push('/login'), 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi đặt lại mật khẩu");
            setLoading(false); // Chỉ tắt loading nếu lỗi, thành công thì giữ để chuyển trang
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
            <Toaster />
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Đặt mật khẩu mới</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Mật khẩu mới của bạn phải khác với mật khẩu cũ.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Ô nhập mật khẩu mới */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                                placeholder="Tối thiểu 6 ký tự"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Ô nhập lại mật khẩu */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 outline-none transition ${confirmPassword && password !== confirmPassword
                                        ? 'border-red-300 focus:ring-red-200'
                                        : 'border-gray-300 focus:ring-purple-500'
                                    }`}
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-red-500 text-xs mt-1 ml-1">Mật khẩu không khớp</p>
                        )}
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-purple-700 transition shadow-lg shadow-purple-200 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Cập nhật mật khẩu"}
                    </button>
                </form>
            </div>
        </div>
    );
}