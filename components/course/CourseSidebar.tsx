'use client';

import { ICourse, IUser } from '@/types';
import { PlayCircle, Smartphone, Loader2, Award, Infinity, Edit, CheckCircle } from 'lucide-react'; // 💡 MỚI: Thêm CheckCircle
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/utils/axiosClient';
import { useCart } from '@/context/CartContext';
import { InlineShareButtons } from 'sharethis-reactjs';
import toast from 'react-hot-toast'; // 💡 MỚI: Import toast để hiện thông báo

interface Props {
    course: ICourse;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fe-udemyclone.vercel.app';

export default function CourseSidebar({ course }: Props) {
    const currentCourseUrl = `${siteUrl}/course/${course.slug}`;

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<IUser | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    const { addToCart } = useCart();
    const [isInCart, setIsInCart] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                checkStatus(parsedUser._id);
            }
        }
    }, []);

    const instructorId = typeof course.instructor === 'object' ? course.instructor._id : course.instructor;
    const isOwner = user && user._id === instructorId;

    const checkStatus = async (userId: string) => {
        try {
            const { data: enrollData } = await axiosClient.get('/users/my-courses');
            if (enrollData.success) {
                if (enrollData.data.find((c: ICourse) => c._id === course._id)) setIsEnrolled(true);
            }
            const { data: cartData } = await axiosClient.get('/users/cart');
            if (cartData.success) {
                if (cartData.data.find((c: ICourse) => c._id === course._id)) setIsInCart(true);
            }
        } catch (error) { console.error("Lỗi check status"); }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleAddToCart = async () => {
        if (!user) { router.push('/login'); return; }
        if (isEnrolled || isOwner) return;

        setLoading(true);
        const success = await addToCart(course._id);
        if (success) setIsInCart(true);
        setLoading(false);
    };

    const handleBuyNow = async () => {
        if (!user) { router.push('/login'); return; }
        if (!isInCart) await addToCart(course._id);
        router.push('/cart');
    };

    // 💡 LOGIC MỚI: XỬ LÝ ĐĂNG KÝ MIỄN PHÍ BỎ QUA THANH TOÁN
    const handleEnrollFree = async () => {
        if (!user) {
            toast('Vui lòng đăng nhập để đăng ký khóa học', { icon: '👋' });
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axiosClient.post('/payment/enroll-free', { courseId: course._id });
            if (data.success) {
                toast.success("Đăng ký thành công! Đang chuyển vào lớp học...");
                setIsEnrolled(true);
                // Chuyển thẳng vào phòng học sau 1.5 giây
                setTimeout(() => {
                    router.push(`/learning/${course.slug}`);
                }, 1500);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi đăng ký khóa học");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden sticky top-24">
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
                {/* 💡 CẬP NHẬT GIAO DIỆN CHỮ MIỄN PHÍ NỔI BẬT */}
                <div className="flex items-center justify-center gap-3 mb-4"> {/* Thêm justify-center để căn giữa */}
                    {course.price === 0 ? (
                        <span className="font-inter text-2xl font-semibold text-green-700 uppercase tracking-wide"> {/* Sử dụng font-inter, text-2xl, font-semibold, text-green-700 và tracking-wide */}
                            Miễn phí
                        </span>
                    ) : (
                        <span className="font-inter text-2xl font-bold text-gray-950"> {/* Áp dụng tương tự cho giá tiền */}
                            {formatPrice(course.price)}
                        </span>
                    )
                    }
                </div>

                <div className="flex flex-col gap-3">
                    {/* TRƯỜNG HỢP 1: Đã mua / Là Giảng Viên -> Vào học */}
                    {isEnrolled || isOwner ? (
                        <>
                            <button
                                onClick={() => router.push(`/learning/${course.slug}`)}
                                className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-800 transition flex justify-center items-center gap-2"
                            >
                                <PlayCircle className="w-5 h-5" />
                                {isOwner ? 'Vào học (Chế độ giảng viên)' : 'Vào học ngay'}
                            </button>

                            {isOwner && (
                                <button
                                    onClick={() => router.push(`/instructor/courses/${course._id}/manage`)}
                                    className="w-full bg-white text-purple-600 border border-purple-600 font-bold py-3 px-4 rounded-md hover:bg-purple-50 transition flex justify-center items-center gap-2"
                                >
                                    <Edit className="w-5 h-5" /> Quản lý khóa học này
                                </button>
                            )}
                        </>
                    ) : course.price === 0 ? (
                        // 💡 TRƯỜNG HỢP 2: KHÓA HỌC MIỄN PHÍ (Bypass Giỏ hàng)
                        <button
                            onClick={handleEnrollFree}
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><CheckCircle className="w-5 h-5" /> Đăng ký học miễn phí</>}
                        </button>
                    ) : (
                        // TRƯỜNG HỢP 3: KHÓA TRẢ PHÍ
                        <>
                            <button
                                onClick={handleBuyNow}
                                className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 transition"
                            >
                                Mua ngay
                            </button>

                            {isInCart ? (
                                <button
                                    onClick={() => router.push('/cart')}
                                    className="w-full bg-green-50 text-green-700 border border-green-200 font-bold py-3 px-4 rounded-md hover:bg-green-100 transition"
                                >
                                    Đã thêm vào giỏ (Xem)
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={loading}
                                    className="w-full bg-white text-gray-900 border border-gray-900 font-bold py-3 px-4 rounded-md hover:bg-gray-50 transition flex justify-center items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Thêm vào giỏ hàng'}
                                </button>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Chia sẻ khóa học:</p>
                    <InlineShareButtons
                        key={course.slug}
                        config={{
                            alignment: 'center', color: 'social', enabled: true, font_size: 14, language: 'vi', show_total: false, labels: null, radius: 16, size: 42, padding: 10,
                            networks: ['facebook', 'twitter', 'reddit', 'messenger', 'sharethis'],
                            url: currentCourseUrl,
                            title: `${course.title} | SmartLMS`,
                            image: course.thumbnail?.url || '',
                            description: course.description,
                        }}
                    />
                </div>

                <div className="mt-6 space-y-3">
                    <h4 className="font-bold text-sm text-gray-900">Khóa học này bao gồm:</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center gap-2"><Infinity className="w-4 h-4" /> Truy cập trọn đời</li>
                        <li className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> Học mọi lúc mọi nơi</li>
                        <li className="flex items-center gap-2"><Award className="w-4 h-4" /> Cấp chứng chỉ hoàn thành</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}