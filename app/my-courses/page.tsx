'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, BookOpen } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse } from '@/types';
import CourseCard from '@/components/CourseCard'; // Tái sử dụng Card

export default function MyCoursesPage() {
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header khu vực học tập */}
            <div className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h1 className="text-3xl font-bold mb-2">Học tập</h1>
                    <p className="text-gray-300">Các khóa học bạn đã đăng ký</p>
                </div>
            </div>

            {/* Danh sách khóa học */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {courses.map((course) => (
                            // Lưu ý: CourseCard mặc định link tới trang chi tiết (/course/slug)
                            // Nhưng ở trang này, bấm vào nên bay thẳng vào trang học (/learning/slug)
                            // Chúng ta sẽ bọc CourseCard bằng thẻ div để ghi đè hành vi click, hoặc sửa CourseCard.
                            // Cách đơn giản nhất: Tự render card đơn giản ở đây hoặc cứ để nó link về chi tiết rồi bấm "Vào học".
                            // Ở đây mình sẽ dùng CourseCard, khi user bấm vào sẽ ra trang chi tiết, 
                            // ở trang chi tiết nút "Mua ngay" đã biến thành "Vào học ngay" (Logic chúng ta đã làm lúc nãy).
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-center mb-4">
                            <BookOpen className="w-16 h-16 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa đăng ký khóa học nào</h3>
                        <p className="text-gray-500 mb-6">Hãy khám phá các khóa học thú vị ngay hôm nay.</p>
                        <Link
                            href="/"
                            className="bg-purple-600 text-white px-6 py-3 rounded-md font-bold hover:bg-purple-700 transition"
                        >
                            Khám phá khóa học
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}