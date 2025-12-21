'use client';

import Link from 'next/link';
import { ICourse } from '@/types';
import { Star, Users, BookOpen } from 'lucide-react';

interface Props {
    course: ICourse;
}

export default function CourseCard({ course }: Props) {
    // Helper lấy tên giảng viên an toàn
    const instructorName = typeof course.instructor === 'object' ? course.instructor.name : 'Giảng viên';
    const categoryName = typeof course.category === 'object' ? course.category.name : 'General';

    // Format giá tiền
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
            {/* 1. Thumbnail */}
            <Link href={`/course/${course.slug}`} className="relative block overflow-hidden aspect-video">
                <img
                    src={course.thumbnail?.url || 'https://via.placeholder.com/600x400'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badge Danh mục */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-gray-700 shadow-sm">
                    {categoryName}
                </div>
            </Link>

            {/* 2. Content */}
            <div className="p-4 flex flex-col flex-1">
                <Link href={`/course/${course.slug}`}>
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-purple-700 transition-colors h-[3rem]">
                        {course.title}
                    </h3>
                </Link>

                <p className="text-xs text-gray-500 mb-3">
                    Bởi <span className="font-semibold">{instructorName}</span>
                </p>

                {/* Rating & Students Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 mt-auto">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                        <span className="text-sm">{course.averageRating ? course.averageRating.toFixed(1) : "0.0"}</span>
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-gray-400 font-normal ml-1">
                            ({course.ratingCount || 0})
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{course.totalStudents || 0} học viên</span>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <div className="font-bold text-lg text-gray-900">
                        {course.price === 0 ? <span className="text-green-600">Miễn phí</span> : formatPrice(course.price)}
                    </div>

                    {/* (Optional) Nút xem nhanh */}
                    <Link href={`/course/${course.slug}`} className="text-purple-600 font-bold text-sm hover:underline">
                        Chi tiết
                    </Link>
                </div>
            </div>
        </div>
    );
}