'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, AlertCircle, Check, Loader2, Globe, BookOpen } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse } from '@/types';
import { Toaster } from 'react-hot-toast';

// Import các component con
import CourseSidebar from '@/components/course/CourseSidebar';
import Curriculum from '@/components/course/Curriculum';
import ReviewsSection from '@/components/course/ReviewsSection';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                <p className="text-gray-500 font-medium">Đang tải dữ liệu khóa học...</p>
            </div>
        </div>
    );

    if (!course) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-red-500 font-bold bg-gray-50">
            <AlertCircle className="w-12 h-12 mb-2" />
            <p>Không tìm thấy khóa học này.</p>
        </div>
    );

    const totalLessons = course.sections.reduce((acc, sec) => acc + sec.lessons.length, 0);

    // Helper lấy tên giảng viên
    const instructorName = typeof course.instructor === 'object' ? course.instructor.name : 'Giảng viên';
    // Helper lấy avatar giảng viên
    const instructorAvatar = typeof course.instructor === 'object' ? course.instructor.avatar : null;

    // --- LOGIC MỚI: LẤY CHỮ CÁI CỦA TÊN (TỪ CUỐI CÙNG) ---
    const getAvatarLabel = (name: string) => {
        // Tách chuỗi thành mảng các từ dựa vào khoảng trắng
        const parts = name.trim().split(' ');
        // Nếu mảng có phần tử, lấy phần tử cuối cùng (Tên), rồi lấy ký tự đầu
        if (parts.length > 0) {
            return parts[parts.length - 1].charAt(0).toUpperCase();
        }
        // Fallback nếu chuỗi rỗng
        return name.charAt(0).toUpperCase();
    };
    // -----------------------------------------------------

    return (
        <div className="bg-gray-50 min-h-screen pb-20">

            {/* TOASTER */}
            <Toaster position="top-center" containerStyle={{ zIndex: 100000 }} />

            {/* 1. HERO SECTION */}
            <div className="bg-gray-900 text-white py-10 lg:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/3 space-y-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
                            <span className="hover:text-purple-200 cursor-pointer transition">
                                {typeof course.category === 'object' ? course.category.name : 'Development'}
                            </span>
                            <span className="text-gray-500">/</span>
                            <span className="text-gray-300 truncate max-w-[200px]">{course.title}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                            {course.title}
                        </h1>

                        <p className="text-lg text-gray-300 line-clamp-2 leading-relaxed">
                            {course.description}
                        </p>

                        {/* Rating Info & Stats */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold text-xs uppercase tracking-wide">
                                Bestseller
                            </div>

                            <div className="flex items-center gap-1 text-yellow-400">
                                {/* HIỂN THỊ ĐIỂM TRUNG BÌNH THẬT */}
                                <span className="font-bold text-base">
                                    {course.averageRating ? course.averageRating.toFixed(1) : "0.0"}
                                </span>

                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.round(course.averageRating || 0) ? 'fill-current' : 'text-gray-500'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* HIỂN THỊ SỐ LƯỢNG ĐÁNH GIÁ THẬT */}
                            <span className="text-purple-300 hover:text-purple-200 cursor-pointer underline decoration-1 underline-offset-2">
                                ({course.ratingCount || 0} đánh giá)
                            </span>

                            {/* Số học viên (Cũng nên lấy từ DB nếu có, tạm thời để course.students.length hoặc giữ nguyên) */}
                            <span className="text-gray-300">• {course.totalStudents || 0} học viên</span>
                        </div>

                        <div className="text-sm text-gray-300">
                            Được tạo bởi <span className="text-purple-300 hover:text-purple-200 underline cursor-pointer font-medium ml-1">
                                {instructorName}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-white font-medium pt-2">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>Cập nhật 12/2024</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span>Tiếng Việt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>{totalLessons} bài học</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:hidden">
                        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-700">
                            <img src={course.thumbnail?.url} className="w-full object-cover" alt={course.title} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. BODY CONTENT */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="flex flex-col lg:flex-row gap-10 relative">

                    <div className="lg:w-2/3 space-y-10">
                        {/* What you'll learn */}
                        <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-xl shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bạn sẽ học được gì</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                {[
                                    "Xây dựng các ứng dụng web thực tế từ con số 0",
                                    "Làm chủ tư duy lập trình và giải quyết vấn đề",
                                    "Thành thạo các công nghệ mới nhất hiện nay",
                                    "Tự tin apply vào các công ty công nghệ lớn",
                                    "Tối ưu hóa hiệu suất và bảo mật ứng dụng",
                                    "Làm việc với API và cơ sở dữ liệu chuyên nghiệp"
                                ].map((item, index) => (
                                    <div key={index} className="flex gap-3 items-start">
                                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Curriculum */}
                        <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-xl shadow-sm">
                            <Curriculum sections={course.sections} />
                        </div>

                        {/* Description */}
                        <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-xl shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả khóa học</h2>
                            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                {course.description}
                            </div>
                        </div>

                        {/* INSTRUCTOR BIO */}
                        <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-xl shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Giảng viên</h2>
                            <div className="flex flex-col sm:flex-row gap-6">
                                {/* AVATAR AREA */}
                                <div className="w-28 h-28 bg-purple-100 rounded-full overflow-hidden flex-shrink-0 border-2 border-purple-200 flex items-center justify-center">
                                    {instructorAvatar ? (
                                        <img
                                            src={instructorAvatar}
                                            alt={instructorName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        // Sử dụng hàm getAvatarLabel để lấy chữ cái
                                        <span className="text-4xl font-bold text-purple-600 uppercase">
                                            {getAvatarLabel(instructorName)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-xl text-purple-700 hover:underline cursor-pointer mb-1">
                                        {instructorName}
                                    </h3>
                                    <p className="text-gray-500 text-sm font-medium mb-4">Senior Developer & Professional Instructor</p>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Giảng viên có nhiều năm kinh nghiệm trong lĩnh vực lập trình và đào tạo. Đã từng làm việc tại các tập đoàn lớn và tham gia nhiều dự án thực tế. Phong cách giảng dạy dễ hiểu, tập trung vào thực hành và tư duy giải quyết vấn đề.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-xl shadow-sm">
                            <ReviewsSection courseId={course._id} />
                        </div>
                    </div>

                    <div className="lg:w-1/3 hidden lg:block relative">
                        <div className="sticky top-24 z-30 -mt-[350px]">
                            <CourseSidebar course={course} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}