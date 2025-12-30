'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight, Copy, Loader2, BookOpen } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import toast from 'react-hot-toast';

// Định nghĩa kiểu dữ liệu đơn giản cho Transaction
interface ITransactionDetail {
    _id: string;
    orderId: string;
    transactionId: string; // Đây là mã PayPal/VNPay
    amount: number;
    items: {
        _id: string;
        title: string;
        slug: string;
        thumbnail?: { url: string };
        price: number;
    }[];
    status: string;
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || searchParams.get('vnp_TxnRef');

    const [transaction, setTransaction] = useState<ITransactionDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        const fetchTransaction = async () => {
            try {
                // Gọi API Backend chúng ta vừa tạo ở Bước 1
                const { data } = await axiosClient.get(`/payment/transaction/${orderId}`);
                if (data.success) {
                    setTransaction(data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy chi tiết đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [orderId]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã sao chép mã!");
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-500">Đang kiểm tra đơn hàng...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                {/* Header Xanh */}
                <div className="bg-green-600 p-8 text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Thanh toán thành công!</h1>
                    <p className="text-green-100">Cảm ơn bạn đã tin tưởng và ủng hộ.</p>
                </div>

                <div className="p-8">
                    {/* Thông tin Mã giao dịch (Transaction ID) */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Chi tiết giao dịch</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Mã đơn hàng (Order ID)</p>
                                <div className="font-mono font-bold text-gray-800 flex items-center gap-2">
                                    {orderId}
                                    <button onClick={() => orderId && copyToClipboard(orderId)} title="Sao chép">
                                        <Copy className="w-3 h-3 text-gray-400 hover:text-purple-600" />
                                    </button>
                                </div>
                            </div>

                            {/* ĐÂY LÀ PHẦN BẠN MUỐN HIỂN THỊ */}
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Mã tham chiếu (Transaction ID)</p>
                                <div className="font-mono font-bold text-purple-600 flex items-center gap-2">
                                    {transaction?.transactionId || "Đang cập nhật..."}
                                    {transaction?.transactionId && (
                                        <button onClick={() => copyToClipboard(transaction.transactionId)} title="Sao chép">
                                            <Copy className="w-3 h-3 text-gray-400 hover:text-purple-600" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách khóa học vừa mua */}
                    {transaction?.items && transaction.items.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                                Khóa học đã kích hoạt ({transaction.items.length})
                            </h3>
                            <div className="space-y-3">
                                {transaction.items.map((course) => (
                                    <div key={course._id} className="flex gap-4 p-3 rounded-lg border border-gray-100 hover:shadow-md transition bg-white">
                                        <div className="w-20 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                            <img
                                                src={course.thumbnail?.url || 'https://via.placeholder.com/150'}
                                                alt={course.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 line-clamp-1">{course.title}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-sm text-green-600 font-bold">Đã thanh toán</span>
                                                <Link
                                                    href={`/learning/${course.slug}`}
                                                    className="text-xs font-bold text-white bg-purple-600 px-3 py-1.5 rounded-full hover:bg-purple-700 transition"
                                                >
                                                    Học ngay
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nút điều hướng */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/my-courses"
                            className="block w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition text-center shadow-lg"
                        >
                            Đến trang Học tập của tôi
                        </Link>
                        <Link
                            href="/"
                            className="block w-full text-gray-500 font-bold py-3 hover:bg-gray-50 rounded-xl transition text-center flex items-center justify-center gap-2"
                        >
                            Về trang chủ <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="text-center p-10">Đang xử lý kết quả...</div>}>
            <SuccessContent />
        </Suspense>
    )
}