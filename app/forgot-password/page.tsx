'use client';
import { useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false); // Trạng thái đã gửi thành công

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosClient.post('/auth/forgotpassword', { email });
            setIsSent(true); // Chuyển sang giao diện thông báo thành công
            toast.success("Đã gửi email hướng dẫn!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi gửi email");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
            <Toaster />
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                {/* Header Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center animate-bounce-slow">
                        <KeyRound className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                {!isSent ? (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Quên mật khẩu?</h2>
                        <p className="text-center text-gray-500 mb-8 text-sm">
                            Đừng lo, chuyện thường ấy mà. Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn lấy lại mật khẩu.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="nhap@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Gửi link đặt lại mật khẩu"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Kiểm tra email của bạn</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Chúng tôi đã gửi link đặt lại mật khẩu tới <b>{email}</b>.
                        </p>
                        <button
                            onClick={() => window.open('https://gmail.com', '_blank')}
                            className="w-full bg-purple-50 text-purple-700 font-bold py-3 rounded-xl mb-4 hover:bg-purple-100 transition"
                        >
                            Mở Gmail ngay
                        </button>
                    </div>
                )}

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition font-medium">
                        <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}