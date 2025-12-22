'use client';

import { ICourse, IUser } from '@/types';
import { PlayCircle, Smartphone, Loader2, Award, Infinity, Edit } from 'lucide-react'; // Thêm icon Edit
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/utils/axiosClient';
import { useCart } from '@/context/CartContext';

interface Props {
    course: ICourse;
}

export default function CourseSidebar({ course }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<IUser | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    const { addToCart } = useCart();
    const [isInCart, setIsInCart] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            checkStatus(parsedUser._id);
        }
    }, []);

    // Helper lấy ID giảng viên an toàn
    const instructorId = typeof course.instructor === 'object' ? course.instructor._id : course.instructor;

    // --- LOGIC MỚI: KIỂM TRA QUYỀN SỞ HỮU ---
    // User là chủ sở hữu nếu ID khớp với ID giảng viên của khóa học
    const isOwner = user && user._id === instructorId;
    // ----------------------------------------

    const checkStatus = async (userId: string) => {
        try {
            // Check enrolled
            const { data: enrollData } = await axiosClient.get('/users/my-courses');
            if (enrollData.success) {
                if (enrollData.data.find((c: ICourse) => c._id === course._id)) setIsEnrolled(true);
            }
            // Check cart
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
        if (isEnrolled || isOwner) return; // Nếu là chủ thì ko cần thêm giỏ

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

    return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden sticky top-24">
            {/* Thumbnail */}
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

                {/* --- KHU VỰC NÚT BẤM (ĐÃ CẬP NHẬT) --- */}
                <div className="flex flex-col gap-3">

                    {/* TRƯỜNG HỢP 1: Đã mua HOẶC Là Giảng Viên -> Vào học */}
                    {isEnrolled || isOwner ? (
                        <>
                            <button
                                onClick={() => router.push(`/learning/${course.slug}`)}
                                className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-800 transition flex justify-center items-center gap-2"
                            >
                                <PlayCircle className="w-5 h-5" />
                                {isOwner ? 'Vào học (Chế độ giảng viên)' : 'Vào học ngay'}
                            </button>

                            {/* Nếu là giảng viên, hiển thị thêm nút sửa khóa học */}
                            {isOwner && (
                                <button
                                    onClick={() => router.push(`/instructor/courses/${course._id}/manage`)} // Link tới trang quản lý (nếu có)
                                    className="w-full bg-white text-purple-600 border border-purple-600 font-bold py-3 px-4 rounded-md hover:bg-purple-50 transition flex justify-center items-center gap-2"
                                >
                                    <Edit className="w-5 h-5" /> Quản lý khóa học này
                                </button>
                            )}
                        </>
                    ) : (
                        // TRƯỜNG HỢP 2: Khách vãng lai -> Mua
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
                {/* ------------------------------------------- */}

                <p className="text-center text-xs text-gray-500 mt-4">Đảm bảo hoàn tiền trong 30 ngày</p>

                <div className="mt-6 space-y-3">
                    <h4 className="font-bold text-sm text-gray-900">Khóa học này bao gồm:</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center gap-2"><Infinity className="w-4 h-4" /> Truy cập trọn đời</li>
                        <li className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> Truy cập trên mobile và TV</li>
                        <li className="flex items-center gap-2"><Award className="w-4 h-4" /> Cấp chứng chỉ hoàn thành</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}