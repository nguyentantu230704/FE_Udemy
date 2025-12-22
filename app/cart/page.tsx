'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { ICourse } from '@/types';
import { Trash2, ShoppingCart, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function CartPage() {
    const [cartCourses, setCartCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);
    const { removeFromCart } = useCart();

    // --- STATE CHO MODAL XÓA ---
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    // ---------------------------

    useEffect(() => {
        loadCartData();
    }, []);

    const loadCartData = async () => {
        try {
            const { data } = await axiosClient.get('/users/cart');
            if (data.success) setCartCourses(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 1. Hàm mở Modal
    const openDeleteModal = (id: string) => {
        setDeleteId(id);
    };

    // 2. Hàm thực hiện xóa (khi bấm nút Xóa trong Modal)
    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);

        try {
            await removeFromCart(deleteId); // Gọi hàm context để update header

            // Cập nhật UI local (xóa item khỏi danh sách đang hiển thị)
            setCartCourses(prev => prev.filter(c => c._id !== deleteId));

            // Đóng modal
            setDeleteId(null);
        } catch (error) {
            console.error("Lỗi xóa khỏi giỏ hàng");
        } finally {
            setDeleting(false);
        }
    };

    const totalPrice = cartCourses.reduce((sum, item) => sum + item.price, 0);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-purple-600" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen relative">

            {/* --- MODAL XÁC NHẬN XÓA --- */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 transition-all">
                        <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa khỏi giỏ hàng?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Bạn có chắc muốn bỏ khóa học này ra khỏi giỏ hàng không?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* --------------------------- */}

            <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

            {cartCourses.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-6">Giỏ hàng của bạn đang trống.</p>
                    <Link href="/" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LIST ITEMS */}
                    <div className="flex-1 space-y-4">
                        <p className="font-bold text-gray-700">{cartCourses.length} khóa học trong giỏ</p>
                        {cartCourses.map((item) => (
                            <div key={item._id} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow transition">
                                <Link href={`/course/${item.slug}`} className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    <img src={item.thumbnail?.url} className="w-full h-full object-cover" alt={item.title} />
                                </Link>
                                <div className="flex-1 flex justify-between">
                                    <div>
                                        <Link href={`/course/${item.slug}`}>
                                            <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-purple-600 mb-1">{item.title}</h3>
                                        </Link>
                                        <p className="text-xs text-gray-500">Bởi {typeof item.instructor === 'object' ? item.instructor.name : 'Giảng viên'}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-between">
                                        <span className="font-bold text-purple-600">
                                            {item.price === 0 ? 'Miễn phí' : item.price.toLocaleString('vi-VN') + ' đ'}
                                        </span>

                                        {/* NÚT XÓA: Gọi hàm mở Modal */}
                                        <button
                                            onClick={() => openDeleteModal(item._id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition flex items-center gap-1 text-sm font-medium"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" /> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CHECKOUT BOX */}
                    <div className="lg:w-1/3">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg sticky top-24">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Tổng cộng</h2>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                                {totalPrice.toLocaleString('vi-VN')} đ
                            </div>
                            <p className="text-sm text-gray-500 mb-6 line-through decoration-gray-400 decoration-2">
                                {(totalPrice * 1.2).toLocaleString('vi-VN')} đ
                                <span className="no-underline ml-2 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-xs">-20%</span>
                            </p>

                            <button
                                onClick={() => toast("Tính năng thanh toán đang phát triển!")}
                                className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                            >
                                Thanh toán <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}