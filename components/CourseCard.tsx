import Link from 'next/link';
import { Star } from 'lucide-react';
import { ICourse } from '@/types';

interface Props {
    course: ICourse;
}

export default function CourseCard({ course }: Props) {
    // Định dạng giá tiền Việt Nam
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <Link href={`/course/${course.slug}`} className="group h-full block">
            <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">

                {/* 1. Thumbnail Image */}
                <div className="relative aspect-video overflow-hidden bg-gray-200">
                    <img
                        src={course.thumbnail?.url || 'https://via.placeholder.com/300x200'}
                        alt={course.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* 2. Content */}
                <div className="flex flex-col flex-1 p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-1">
                        {course.title}
                    </h3>

                    <p className="text-xs text-gray-500 mb-2 truncate">
                        {typeof course.instructor === 'object' ? course.instructor.name : 'Giảng viên'}
                    </p>

                    {/* Rating giả lập (Vì DB chưa có rating) */}
                    <div className="flex items-center gap-1 mb-2">
                        <span className="font-bold text-sm text-yellow-700">4.5</span>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <span className="text-xs text-gray-400">(1,234)</span>
                    </div>

                    <div className="mt-auto">
                        <div className="font-bold text-gray-900 text-lg">
                            {course.price === 0 ? 'Miễn phí' : formatPrice(course.price)}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}