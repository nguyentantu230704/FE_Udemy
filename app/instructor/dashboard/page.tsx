'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { Loader2, Users, DollarSign, Award, Wallet, Percent, History, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface ISalesHistory {
    _id: string;
    date: string;
    student: { name: string; email: string; avatar?: string };
    courseTitle: string;
    grossAmount: number;
    netAmount: number;
}

interface IStats {
    grossRevenue: number;
    netRevenue: number;
    commissionRate: number;
    totalStudents: number;
    monthlyRevenue: { month: string; revenue: number }[];
    bestSellers: { _id: string; title: string; totalStudents: number; thumbnail: { url: string } }[];
    salesHistory: ISalesHistory[];
}

export default function InstructorDashboard() {
    const [stats, setStats] = useState<IStats | null>(null);
    const [loading, setLoading] = useState(true);

    // --- LOGIC PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Hiển thị 10 giao dịch trên 1 trang

    useEffect(() => {
        async function fetchStats() {
            try {
                const { data } = await axiosClient.get('/instructor/dashboard');
                if (data.success) setStats(data.data);
            } catch (error) {
                console.error("Lỗi tải thống kê");
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;
    if (!stats) return <div className="p-10 text-center">Chưa có dữ liệu thống kê.</div>;

    // Tính toán dữ liệu cho trang hiện tại
    const salesHistory = stats.salesHistory || [];
    const totalPages = Math.ceil(salesHistory.length / itemsPerPage);
    const currentData = salesHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan doanh thu</h1>

            {/* --- CÁC THẺ SỐ LIỆU --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><DollarSign className="w-5 h-5" /></div>
                        <p className="text-gray-500 text-sm font-medium">Doanh số bán khóa</p>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.grossRevenue)}</h3>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-xl shadow-md text-white flex flex-col justify-center transform hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg"><Wallet className="w-5 h-5" /></div>
                        <p className="text-purple-100 text-sm font-medium">Thực nhận của bạn</p>
                    </div>
                    <h3 className="text-2xl font-bold">{formatCurrency(stats.netRevenue)}</h3>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Percent className="w-5 h-5" /></div>
                        <p className="text-gray-500 text-sm font-medium">Tỉ lệ chia sẻ</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-gray-900">{100 - stats.commissionRate}%</h3>
                        <span className="text-sm text-gray-400 font-medium">/ Admin {stats.commissionRate}%</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600"><Users className="w-5 h-5" /></div>
                        <p className="text-gray-500 text-sm font-medium">Tổng học viên</p>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
                </div>
            </div>

            {/* --- BIỂU ĐỒ & TOP KHÓA HỌC --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Biểu đồ thu nhập thực nhận</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis width={100} tickFormatter={(value) => value.toLocaleString('vi-VN')} />
                                <Tooltip formatter={(value: number | undefined) => value ? value.toLocaleString('vi-VN') + ' đ' : '0 đ'} />
                                <Bar dataKey="revenue" fill="#9333ea" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" /> Top khóa học
                    </h3>
                    <div className="space-y-4">
                        {stats.bestSellers.map((course, index) => (
                            <div key={course._id} className="flex gap-3 items-center">
                                <div className="font-bold text-gray-400 w-4">#{index + 1}</div>
                                <img src={course.thumbnail?.url || '/placeholder.jpg'} alt="" className="w-12 h-12 rounded object-cover bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-800 truncate">{course.title}</h4>
                                    <p className="text-xs text-gray-500">{course.totalStudents} học viên</p>
                                </div>
                            </div>
                        ))}
                        {stats.bestSellers.length === 0 && <p className="text-gray-500 text-sm">Chưa có dữ liệu.</p>}
                    </div>
                </div>
            </div>

            {/* --- BẢNG CHI TIẾT LỊCH SỬ BÁN HÀNG CÓ PHÂN TRANG --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50 shrink-0">
                    <History className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-800">Lịch sử giao dịch chi tiết</h3>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse relative">
                        <thead className="bg-gray-100/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Thời gian</th>
                                <th className="p-4">Học viên</th>
                                <th className="p-4">Khóa học</th>
                                <th className="p-4 text-right">Giá bán</th>
                                <th className="p-4 text-right text-purple-700">Thực nhận</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentData.length > 0 ? (
                                currentData.map((item, index) => (
                                    <tr key={item._id || index} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {format(new Date(item.date), 'dd/MM/yyyy HH:mm')}
                                            </div>
                                        </td>
                                        <td className="p-4 min-w-[200px]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                                                    {item.student.avatar ? <img src={item.student.avatar} className="w-full h-full object-cover" /> : item.student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{item.student.name}</p>
                                                    <p className="text-xs text-gray-500">{item.student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-800 line-clamp-2 max-w-[200px]" title={item.courseTitle}>
                                            {item.courseTitle}
                                        </td>
                                        <td className="p-4 text-right text-sm text-gray-500 font-medium line-through">
                                            {formatCurrency(item.grossAmount)}
                                        </td>
                                        <td className="p-4 text-right text-sm font-bold text-purple-600 bg-purple-50/30">
                                            +{formatCurrency(item.netAmount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        Chưa có giao dịch nào được ghi nhận.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- ĐIỀU KHIỂN PHÂN TRANG --- */}
                {totalPages > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0">
                        <span className="text-sm text-gray-500">
                            Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, salesHistory.length)}</span> trong tổng số <span className="font-bold text-gray-900">{salesHistory.length}</span> giao dịch
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-1 px-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-9 h-9 rounded-lg font-bold text-sm transition ${currentPage === page
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}