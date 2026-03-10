'use client';
import { useState } from 'react';
import { Users, BookOpen, DollarSign, CreditCard, Wallet, History, Calendar, Percent, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface ITransaction {
    _id: string;
    date: string;
    student: { name: string; email: string; avatar?: string };
    courseTitle: string;
    instructorName: string;
    grossAmount: number;
    adminCommissionRate: number;
    adminAmount: number;
}

interface Props {
    stats: {
        totalUsers: number;
        totalCourses: number;
        totalRevenue: number;
        totalProfit: number;
        pendingPayouts: number;
        recentTransactions: ITransaction[];
    };
}

export default function AdminStats({ stats }: Props) {
    // --- LOGIC PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Hiển thị 10 giao dịch trên 1 trang

    const transactions = stats.recentTransactions || [];
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    // Cắt mảng dữ liệu để lấy đúng 10 item của trang hiện tại
    const currentData = transactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>

            {/* --- CÁC THẺ SỐ LIỆU --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Tổng người dùng" value={stats.totalUsers} icon={<Users className="w-6 h-6 text-blue-600" />} color="bg-blue-50 border-blue-200" />
                <StatCard title="Tổng khóa học" value={stats.totalCourses} icon={<BookOpen className="w-6 h-6 text-purple-600" />} color="bg-purple-50 border-purple-200" />
                <StatCard title="Tổng dòng tiền (GMV)" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign className="w-6 h-6 text-gray-600" />} color="bg-gray-50 border-gray-200" />
                <StatCard title="Lợi nhuận nền tảng" value={formatCurrency(stats.totalProfit)} icon={<Wallet className="w-6 h-6 text-emerald-600" />} color="bg-emerald-50 border-emerald-200" />
                <StatCard title="Yêu cầu rút tiền" value={stats.pendingPayouts} icon={<CreditCard className="w-6 h-6 text-orange-600" />} color="bg-orange-50 border-orange-200" />
            </div>

            {/* --- BẢNG LỊCH SỬ GIAO DỊCH TOÀN SÀN --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50 shrink-0">
                    <History className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-bold text-gray-800">Lịch sử giao dịch toàn hệ thống</h3>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse relative">
                        <thead className="bg-gray-100/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Thời gian</th>
                                <th className="p-4">Học viên</th>
                                <th className="p-4">Khóa học / Giảng viên</th>
                                <th className="p-4 text-right">Giá bán</th>
                                <th className="p-4 text-center">Deal</th>
                                <th className="p-4 text-right text-emerald-700">Admin thu</th>
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
                                                    {item.student.avatar ? <img src={item.student.avatar} className="w-full h-full object-cover" alt="avatar" /> : item.student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{item.student.name}</p>
                                                    <p className="text-xs text-gray-500">{item.student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1" title={item.courseTitle}>
                                                {item.courseTitle}
                                            </p>
                                            <p className="text-xs text-purple-600 font-medium mt-0.5">
                                                Bởi: {item.instructorName}
                                            </p>
                                        </td>
                                        <td className="p-4 text-right text-sm text-gray-500 font-medium">
                                            {formatCurrency(item.grossAmount)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold border border-orange-200">
                                                <Percent className="w-3 h-3" /> {item.adminCommissionRate}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-sm font-bold text-emerald-600 bg-emerald-50/30">
                                            +{formatCurrency(item.adminAmount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Hệ thống chưa ghi nhận giao dịch nào.
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
                            Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, transactions.length)}</span> trong tổng số <span className="font-bold text-gray-900">{transactions.length}</span> giao dịch
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
                                                ? 'bg-blue-600 text-white shadow-md'
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

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className={`p-4 xl:p-6 rounded-xl border ${color} shadow-sm flex flex-col justify-center bg-white hover:shadow-md transition`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] xl:text-xs font-bold text-gray-500 uppercase tracking-wider line-clamp-1">{title}</p>
                <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 shrink-0">{icon}</div>
            </div>
            <p className="text-xl xl:text-2xl font-extrabold text-gray-900 truncate">{value}</p>
        </div>
    );
}