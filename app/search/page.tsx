'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, SearchX, Filter } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse } from '@/types';
import CourseCard from '@/components/CourseCard';

// Component con để bọc trong Suspense (Bắt buộc với Next.js App Router khi dùng useSearchParams)
function SearchContent() {
    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword');
    const categoryId = searchParams.get('category');

    const [courses, setCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                // Tạo query string: /courses?keyword=...&category=...
                let url = '/courses?';
                if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
                if (categoryId) url += `category=${categoryId}`;

                const { data } = await axiosClient.get(url);
                if (data.success) {
                    setCourses(data.data);
                }
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [keyword, categoryId]); // Chạy lại khi URL thay đổi

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                {keyword ? (
                    <>Kết quả tìm kiếm cho: <span className="text-purple-600">"{keyword}"</span></>
                ) : categoryId ? (
                    <>Danh sách khóa học theo danh mục</>
                ) : (
                    <>Tất cả khóa học</>
                )}
            </h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <SearchX className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-700">Không tìm thấy kết quả nào</h2>
                    <p className="text-gray-500 mt-2">Hãy thử tìm từ khóa khác hoặc xem danh mục khác.</p>
                </div>
            )}
        </div>
    );
}

// Export chính bọc Suspense để tránh lỗi build
export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Đang tải bộ lọc...</div>}>
            <SearchContent />
        </Suspense>
    )
}