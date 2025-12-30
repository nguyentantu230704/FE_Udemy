'use client';

import Link from 'next/link';
import { XCircle, RefreshCcw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function FailedContent() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message') || "Giao dịch đã bị hủy hoặc xảy ra lỗi.";

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
                <p className="text-gray-500 mb-8 px-4">
                    {decodeURIComponent(message)}
                </p>

                <div className="space-y-3">
                    <Link
                        href="/cart"
                        className="block w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" /> Thử lại
                    </Link>
                    <Link
                        href="/"
                        className="block w-full text-gray-500 font-bold py-3 hover:text-gray-700 transition text-sm"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={<div className="text-center p-10">Đang xử lý...</div>}>
            <FailedContent />
        </Suspense>
    )
}