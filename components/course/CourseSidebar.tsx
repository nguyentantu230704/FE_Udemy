'use client'; // Nhớ thêm dòng này vì chúng ta dùng hook

import { ICourse, IUser } from '@/types';
import { PlayCircle, Award, Infinity, Smartphone, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/utils/axiosClient';
import toast from 'react-hot-toast';

interface Props {
    course: ICourse;
}

export default function CourseSidebar({ course }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<IUser | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    // 1. Kiểm tra trạng thái User khi component load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            checkEnrollment(parsedUser._id);
        }
    }, []);

    // Hàm kiểm tra xem user đã mua khóa này chưa (Gọi API hoặc check local nếu có lưu)
    // Ở đây mình check nhanh bằng API getMyCourses hoặc check trong user object nếu bạn có lưu enrolledCourses trong local storage
    const checkEnrollment = async (userId: string) => {
        try {
            const { data } = await axiosClient.get('/users/my-courses');
            if (data.success) {
                const myCourses = data.data; // Mảng các khóa học object
                // Kiểm tra xem ID khóa học hiện tại có nằm trong danh sách đã mua ko
                const found = myCourses.find((c: ICourse) => c._id === course._id);
                if (found) setIsEnrolled(true);
            }
        } catch (error) {
            console.error("Lỗi check enrollment");
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // 2. Xử lý sự kiện Enroll
    const handleEnroll = async () => {
        // Nếu chưa đăng nhập -> đá về Login
        if (!user) {
            toast.error("Vui lòng đăng nhập để đăng ký học");
            router.push('/login');
            return;
        }

        // Nếu đã mua rồi -> Chuyển sang trang học (Chúng ta sẽ tạo trang này ở bước sau)
        if (isEnrolled) {
            router.push(`/learning/${course.slug}`);
            return;
        }

        // Logic mua mới
        setLoading(true);
        try {
            await axiosClient.post('/users/enroll', { courseId: course._id });
            toast.success("Đăng ký thành công! Đang vào lớp...");
            setIsEnrolled(true);

            // Chuyển hướng sau 1s
            setTimeout(() => {
                router.push(`/learning/${course.slug}`);
            }, 1000);

        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi đăng ký");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden sticky top-24">

            {/* Thumbnail / Video Preview */}
            <div className="relative aspect-video bg-gray-900 cursor-pointer group">
                <img
                    src={course.thumbnail?.url || 'https://via.placeholder.com/600x400'}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full p-4 shadow-lg group-hover:scale-110 transition">
                        <PlayCircle className="w-8 h-8 text-gray-900" fill="currentColor" />
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                        {course.price === 0 ? 'Miễn phí' : formatPrice(course.price)}
                    </span>
                </div>

                {/* NÚT HÀNH ĐỘNG CHÍNH */}
                <div className="flex flex-col gap-3">
                    {isEnrolled ? (
                        <button
                            onClick={() => router.push(`/learning/${course.slug}`)}
                            className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-800 transition"
                        >
                            Vào học ngay
                        </button>
                    ) : (
                        <button
                            onClick={handleEnroll}
                            disabled={loading}
                            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 transition flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Mua ngay'}
                        </button>
                    )}

                    {!isEnrolled && (
                        <button className="w-full bg-white text-gray-900 border border-gray-900 font-bold py-3 px-4 rounded-md hover:bg-gray-50 transition">
                            Thêm vào giỏ hàng
                        </button>
                    )}
                </div>

                <p className="text-center text-xs text-gray-500 mt-4">Đảm bảo hoàn tiền trong 30 ngày</p>

                {/* ... (Phần lợi ích bên dưới giữ nguyên) ... */}
                <div className="mt-6 space-y-3">
                    <h4 className="font-bold text-sm text-gray-900">Khóa học này bao gồm:</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center gap-2">
                            <PlayCircle className="w-4 h-4" /> Truy cập trọn đời
                        </li>
                        <li className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" /> Truy cập trên mobile và TV
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}