'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { Loader2, TrendingUp, Users, DollarSign, Award } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface IStats {
    totalRevenue: number;
    totalStudents: number;
    monthlyRevenue: { month: string; revenue: number }[];
    bestSellers: { _id: string; title: string; totalStudents: number; thumbnail: { url: string } }[];
}

export default function InstructorDashboard() {
    const [stats, setStats] = useState<IStats | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;
    if (!stats) return <div className="p-10 text-center">Chưa có dữ liệu thống kê.</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan doanh thu</h1>

            {/* 1. Các thẻ số liệu tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex items-center gap-4">
                    <div className="p-4 bg-purple-100 rounded-full text-purple-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Tổng doanh thu</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString('vi-VN')} đ</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center gap-4">
                    <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Tổng học viên</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex items-center gap-4">
                    <div className="p-4 bg-green-100 rounded-full text-green-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Thu nhập trung bình/khóa</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {stats.bestSellers.length > 0 ? (stats.totalRevenue / stats.bestSellers.length).toLocaleString('vi-VN') : 0} đ
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Biểu đồ doanh thu */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Biểu đồ thu nhập theo tháng</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis width={100}
                                    tickFormatter={(value) => value.toLocaleString('vi-VN')} />
                                <Tooltip
                                    formatter={(value: number | undefined) =>
                                        value ? value.toLocaleString('vi-VN') + ' đ' : '0 đ'
                                    }
                                />
                                <Bar dataKey="revenue" fill="#9333ea" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Top khóa học bán chạy */}
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
        </div>
    );
}