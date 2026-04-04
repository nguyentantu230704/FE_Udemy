'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, Award } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function VerifyPortalPage() {
    const [code, setCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();

        // Cắt khoảng trắng 2 đầu và viết hoa toàn bộ ký tự
        const cleanCode = code.trim().toUpperCase();

        if (!cleanCode) {
            toast.error('Vui lòng nhập mã chứng chỉ!');
            return;
        }

        setIsSearching(true);

        // Chuyển hướng người dùng sang trang chi tiết chứng chỉ
        // Nếu mã sai, trang đích sẽ tự động hiện thông báo lỗi và có nút quay lại đây
        router.push(`/certificate/${cleanCode}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <Toaster position="top-center" />

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-500">

                {/* Header Section - Đồng bộ Logo Award */}
                <div className="bg-purple-700 p-8 text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <Award className="w-48 h-48 absolute -top-10 -right-10 text-white transform rotate-12" />
                    </div>

                    <div className="relative z-10 flex justify-center mb-4">
                        <div className="bg-white p-3 rounded-full shadow-lg">
                            <ShieldCheck className="w-8 h-8 text-purple-700" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2 relative z-10">
                        Xác Thực Chứng Chỉ
                    </h1>
                    <p className="text-purple-200 text-sm relative z-10">
                        Hệ thống tra cứu văn bằng chính thức của SmartLMS
                    </p>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    <form onSubmit={handleVerify} className="flex flex-col gap-5">
                        <div>
                            <label htmlFor="certCode" className="block text-sm font-bold text-gray-700 mb-2">
                                Mã chứng chỉ (Certificate ID)
                            </label>
                            <div className="relative">
                                <input
                                    id="certCode"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="VD: UC-A1B2C3D4"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 font-mono uppercase placeholder:normal-case"
                                    disabled={isSearching}
                                    autoComplete="off"
                                />
                                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Mã chứng chỉ thường nằm ở góc dưới cùng bên trái của bản PDF.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSearching}
                            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isSearching
                                ? 'bg-purple-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                        >
                            {isSearching ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Tra Cứu Ngay
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Section */}
                <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} SmartLMS. Mọi chứng chỉ đều được lưu trữ bảo mật bằng công nghệ mã hóa.
                    </p>
                </div>
            </div>
        </div>
    );
}