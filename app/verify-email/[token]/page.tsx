'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axiosClient from '@/utils/axiosClient';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
    const { token } = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const verify = async () => {
            try {
                // Gọi API kích hoạt
                const { data } = await axiosClient.put(`/auth/verifyemail/${token}`);

                // Nếu backend trả về token đăng nhập luôn, lưu vào localStorage
                if (data.data && data.data.token) {
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('user', JSON.stringify(data.data));
                    // dispatch user vào context nếu có dùng context
                }

                setStatus('success');
                setTimeout(() => {
                    router.push('/login'); // Chuyển về trang chủ sau 3s
                }, 3000);

            } catch (error) {
                setStatus('error');
            }
        };

        if (token) verify();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                        <h2 className="text-xl font-bold">Đang xác thực email...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Kích hoạt thành công!</h2>
                        <p className="text-gray-500 mt-2">Tài khoản của bạn đã sẵn sàng. Đang chuyển hướng...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-12 h-12 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Kích hoạt thất bại</h2>
                        <p className="text-gray-500 mt-2">Link xác thực không hợp lệ hoặc đã hết hạn.</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                        >
                            Về trang đăng nhập
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}