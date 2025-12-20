'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Plus, Loader2 } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse, IUser } from '@/types';

export default function InstructorDashboard() {
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<IUser | null>(null);

    useEffect(() => {
        // Lấy user từ local storage để lọc khóa học của chính mình
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const fetchCourses = async () => {
            try {
                // Gọi API lấy tất cả
                const { data } = await axiosClient.get('/courses');
                if (data.success) {
                    setCourses(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Lọc khóa học của giảng viên hiện tại
    const myCourses = courses.filter(c => {
        // Logic lọc: Nếu instructor là object (đã populate) thì so sánh _id, nếu là string thì so sánh trực tiếp
        const instructorId = typeof c.instructor === 'object' ? c.instructor._id : c.instructor;
        return user && instructorId === user._id;
    });

    if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h1>
                <Link href="/instructor/courses/create" className="bg-purple-600 text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-purple-700">
                    <Plus className="w-5 h-5" /> Tạo khóa mới
                </Link>
            </div>

            {myCourses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">Bạn chưa có khóa học nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map((course) => (
                        <div key={course._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:shadow-md transition">
                            <div className="h-40 bg-gray-200 relative">
                                <img src={course.thumbnail?.url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{course.title}</h3>
                                <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-100">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {course.isPublished ? 'Đã Public' : 'Bản nháp'}
                                    </span>
                                    <Link href={`/instructor/courses/${course._id}/manage`} className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                        <Edit className="w-4 h-4" /> Quản lý
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}