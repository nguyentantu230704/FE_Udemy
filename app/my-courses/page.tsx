'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, BookOpen, PlayCircle, Search, AlertCircle } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse } from '@/types';

export default function MyCoursesPage() {
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const { data } = await axiosClient.get('/users/my-courses');
                if (data.success) {
                    setCourses(data.data);
                }
            } catch (error) {
                console.error("Lỗi tải khóa học của tôi", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, []);

    const filteredCourses = courses
        .filter(course => course && course._id)
        .filter(course => course.title?.toLowerCase().includes(searchTerm.toLowerCase()));

    // --- SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY ---
    const getLearnLink = (course: ICourse) => {
        // Ưu tiên dùng slug, nếu lỗi dữ liệu không có slug thì dùng _id
        const identifier = course.slug || course._id;

        // Trỏ đúng về đường dẫn: app/learning/[slug]
        return `/learning/${identifier}`;
    };
    // ----------------------------------

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-sans">

            {/* Header */}
            <div className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Học tập</h1>
                        <p className="text-gray-400">Các khóa học bạn đã đăng ký</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Tìm trong khóa học của bạn..."
                            className="pl-10 pr-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white w-full md:w-80 focus:outline-none focus:border-purple-500 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-8 overflow-x-auto">
                    <button className="py-4 border-b-2 border-black font-bold text-black whitespace-nowrap">Tất cả khóa học</button>
                    <button className="py-4 border-b-2 border-transparent text-gray-500 hover:text-black font-medium transition whitespace-nowrap">Đang học</button>
                    <button className="py-4 border-b-2 border-transparent text-gray-500 hover:text-black font-medium transition whitespace-nowrap">Đã hoàn thành</button>
                </div>
            </div>

            {/* Course List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredCourses.map((course) => (
                            <div key={course._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group h-full">

                                {/* 1. Thumbnail Link */}
                                <Link href={getLearnLink(course)} className="relative aspect-video overflow-hidden bg-gray-100 block">
                                    {course.thumbnail?.url ? (
                                        <img
                                            src={course.thumbnail.url}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-gray-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
                                    </div>
                                </Link>

                                {/* 2. Content */}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 min-h-[3rem]">
                                        <Link href={getLearnLink(course)} className="hover:text-purple-600 transition">
                                            {course.title}
                                        </Link>
                                    </h3>

                                    <p className="text-xs text-gray-500 mb-4 truncate">
                                        Giảng viên: {
                                            course.instructor && typeof course.instructor === 'object'
                                                ? (course.instructor as any).name
                                                : 'Udemy Instructor'
                                        }
                                    </p>

                                    {/* 3. Progress Bar & Button (SỬA ĐOẠN NÀY) */}
                                    <div className="mt-auto">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Tiến độ</span>
                                            {/* Hiển thị % từ API */}
                                            <span className="font-bold text-purple-600">
                                                {(course as any).progress || 0}%
                                            </span>
                                        </div>

                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
                                            {/* Update width theo % */}
                                            <div
                                                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${(course as any).progress || 0}%` }}
                                            ></div>
                                        </div>

                                        <Link
                                            href={getLearnLink(course)}
                                            className="block w-full text-center py-2.5 bg-purple-600 text-white font-bold text-sm rounded hover:bg-purple-700 transition shadow-sm hover:shadow"
                                        >
                                            {(course as any).progress === 100 ? 'Học lại' : 'Vào học ngay'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-center mb-4">
                            {searchTerm ? <AlertCircle className="w-16 h-16 text-gray-300" /> : <BookOpen className="w-16 h-16 text-gray-300" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {searchTerm ? 'Không tìm thấy kết quả nào' : 'Bạn chưa đăng ký khóa học nào'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? `Không có khóa học nào khớp với "${searchTerm}"` : 'Hãy khám phá các khóa học thú vị ngay hôm nay.'}
                        </p>
                        <Link
                            href="/"
                            className="bg-purple-600 text-white px-6 py-3 rounded-md font-bold hover:bg-purple-700 transition inline-block"
                        >
                            Khám phá khóa học mới
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}