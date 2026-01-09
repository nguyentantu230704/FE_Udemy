'use client';
import { Users, BookOpen, DollarSign, CreditCard, Wallet } from 'lucide-react';

interface Props {
    stats: {
        totalUsers: number;
        totalCourses: number;
        totalRevenue: number; // Tổng doanh số (100%)
        totalProfit: number;  // Lợi nhuận Admin (30%) - MỚI
        pendingPayouts: number;
    };
}

export default function AdminStats({ stats }: Props) {
    return (
        <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan hệ thống</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* 1. Tổng người dùng */}
                <StatCard
                    title="Tổng người dùng"
                    value={stats.totalUsers}
                    icon={<Users className="w-8 h-8 text-blue-600" />}
                    color="bg-blue-50 border-blue-200"
                />

                {/* 2. Tổng khóa học */}
                <StatCard
                    title="Tổng khóa học"
                    value={stats.totalCourses}
                    icon={<BookOpen className="w-8 h-8 text-purple-600" />}
                    color="bg-purple-50 border-purple-200"
                />

                {/* 3. Tổng doanh số (GMV - 100% tiền qua sàn) */}
                <StatCard
                    title="Tổng dòng tiền (GMV)"
                    value={`${stats.totalRevenue.toLocaleString('vi-VN')} đ`}
                    icon={<DollarSign className="w-8 h-8 text-gray-600" />}
                    color="bg-gray-50 border-gray-200"
                />

                {/* 4. LỢI NHUẬN ADMIN (30% - QUAN TRỌNG NHẤT) */}
                {/* Đây là phần bạn đang cần hiển thị */}
                <StatCard
                    title="Lợi nhuận ròng (30%)"
                    value={`${stats.totalProfit.toLocaleString('vi-VN')} đ`}
                    icon={<Wallet className="w-8 h-8 text-emerald-600" />}
                    color="bg-emerald-50 border-emerald-200"
                />

                {/* 5. Yêu cầu rút tiền */}
                <StatCard
                    title="Yêu cầu rút tiền"
                    value={stats.pendingPayouts}
                    icon={<CreditCard className="w-8 h-8 text-orange-600" />}
                    color="bg-orange-50 border-orange-200"
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className={`p-6 rounded-xl border ${color} shadow-sm flex items-center justify-between bg-white hover:shadow-md transition`}>
            <div>
                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            </div>
            <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100">{icon}</div>
        </div>
    );
}