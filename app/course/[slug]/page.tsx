'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, AlertCircle, Check, Loader2, Globe } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse } from '@/types';

// Import các component con
import CourseSidebar from '@/components/course/CourseSidebar';
import Curriculum from '@/components/course/Curriculum';

export default function CourseDetailPage() {
    const params = useParams();
    const [course, setCourse] = useState<ICourse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await axiosClient.get(`/courses/${params.slug}`);
                if (data.success) {
                    setCourse(data.data);
                }
            } catch (error) {
                console.error("Lỗi tải khóa học", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchCourse();
        }
    }, [params.slug]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
    );

    if (!course) return (
        <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">
            <AlertCircle className="mr-2" /> Không tìm thấy khóa học
        </div>
    );

    return (
        <div className="bg-white">
            {/* 1. HERO SECTION (Phần Banner Đen) */}
            <div className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-8">
                    {/* Cột trái Hero */}
                    <div className="lg:w-2/3 space-y-4">
                        {/* Breadcrumb */}
                        <div className="text-purple-300 text-sm font-bold flex gap-2">
                            <span>{typeof course.category === 'object' ? course.category.name : 'Development'}</span>
                            <span>/</span>
                            <span>{course.title}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                            {course.title}
                        </h1>

                        <p className="text-lg text-gray-100">
                            {course.description.substring(0, 150)}...
                        </p>

                        {/* Rating Info */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 font-bold rounded text-xs">Bestseller</span>
                            <span className="text-yellow-400 font-bold">4.8</span>
                            <div className="flex text-yellow-400">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <span className="text-blue-300 underline">(2,300 đánh giá)</span>
                            <span className="text-white"> • 5,000 học viên</span>
                        </div>

                        {/* Instructor Info */}
                        <div className="text-sm">
                            Được tạo bởi <span className="text-blue-300 underline cursor-pointer">
                                {typeof course.instructor === 'object' ? course.instructor.name : 'Instructor'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-200">
                            <div className="flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Cập nhật lần cuối 12/2024
                            </div>
                            <div className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                Tiếng Việt
                            </div>
                        </div>
                    </div>

                    {/* Cột phải Hero (Để trống trên Desktop vì Sidebar sẽ đè lên, nhưng hiện trên mobile) */}
                    <div className="lg:hidden">
                        {/* Mobile placeholder cho ảnh */}
                        <img src={course.thumbnail?.url} className="w-full rounded-lg" alt="" />
                    </div>
                </div>
            </div>

            {/* 2. BODY CONTENT (Phần nội dung chính) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-12 relative">

                    {/* Cột trái (Chi tiết) */}
                    <div className="lg:w-2/3">

                        {/* What you'll learn */}
                        <div className="border border-gray-300 p-6 rounded-md mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bạn sẽ học được gì</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                                <div className="flex gap-2"><Check className="w-5 h-5 text-gray-700 flex-shrink-0" /> Xây dựng ứng dụng thực tế</div>
                                <div className="flex gap-2"><Check className="w-5 h-5 text-gray-700 flex-shrink-0" /> Làm chủ tư duy lập trình</div>
                                <div className="flex gap-2"><Check className="w-5 h-5 text-gray-700 flex-shrink-0" /> Fullstack với công nghệ mới nhất</div>
                                <div className="flex gap-2"><Check className="w-5 h-5 text-gray-700 flex-shrink-0" /> Tự tin đi xin việc</div>
                            </div>
                        </div>

                        {/* Curriculum Component */}
                        <Curriculum sections={course.sections} />

                        {/* Description */}
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả khóa học</h2>
                            <div className="prose max-w-none text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {course.description}
                            </div>
                        </div>

                        {/* Instructor Bio (Giản lược) */}
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Giảng viên</h2>
                            <div className="flex gap-4">
                                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                    <img
                                        src={typeof course.instructor === 'object' && course.instructor.avatar ? course.instructor.avatar : 'https://placehold.co/600x400/EEE/31343C'}
                                        alt="empty"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-purple-600 underline">
                                        {typeof course.instructor === 'object' ? course.instructor.name : 'Giảng viên'}
                                    </h3>
                                    <p className="text-gray-500 text-sm">Senior Developer & Instructor</p>
                                    <p className="text-sm mt-2 text-gray-700">
                                        Giảng viên có nhiều năm kinh nghiệm trong lĩnh vực lập trình và đào tạo...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải (Sidebar Sticky) */}
                    <div className="lg:w-1/3 hidden lg:block relative">
                        {/* Chúng ta cần một thẻ div bao ngoài để tính toán vị trí absolute/sticky nếu cần */}
                        <div className="absolute top-[-250px] right-0 w-full z-10">
                            <CourseSidebar course={course} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}