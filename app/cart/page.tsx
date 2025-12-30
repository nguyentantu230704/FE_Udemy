'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { ICourse } from '@/types';
import { Trash2, ShoppingCart, ArrowRight, Loader2, AlertTriangle, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function CartPage() {
    const [cartCourses, setCartCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);
    const { removeFromCart } = useCart();

    // --- STATE THANH TOÁN ---
    const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'paypal'>('vnpay');
    const [processing, setProcessing] = useState(false);
    // ------------------------

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

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

    const openDeleteModal = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);

        try {
            await removeFromCart(deleteId);
            setCartCourses(prev => prev.filter(c => c._id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error("Lỗi xóa khỏi giỏ hàng");
        } finally {
            setDeleting(false);
        }
    };

    // --- HÀM XỬ LÝ THANH TOÁN ---
    const handleCheckout = async () => {
        if (cartCourses.length === 0) return;
        setProcessing(true);

        try {
            // 1. Gọi API tạo Payment Link
            const { data } = await axiosClient.post('/payment/create', {
                method: paymentMethod,
                description: `Thanh toan don hang ${new Date().getTime()}`,
            });

            // 2. Kiểm tra và Redirect (SỬA LẠI ĐOẠN NÀY)
            // Backend trả về: { success: true, data: { redirectUrl: '...' } }
            // Nên cần lấy data.data.redirectUrl
            if (data.success && data.data && data.data.redirectUrl) {
                window.location.href = data.data.redirectUrl;
            } else {
                toast.error("Không lấy được link thanh toán!");
                console.error("Phản hồi lỗi từ server:", data);
            }

        } catch (error: any) {
            console.error("Lỗi thanh toán:", error);
            toast.error(error.response?.data?.message || "Lỗi khởi tạo thanh toán");
        } finally {
            setProcessing(false);
        }
    };
    // ----------------------------

    const totalPrice = cartCourses.reduce((sum, item) => sum + item.price, 0);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-purple-600" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen relative">
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
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">Hủy</button>
                            <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2">
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                        <button onClick={() => openDeleteModal(item._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition flex items-center gap-1 text-sm font-medium" title="Xóa">
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

                            {/* --- PHẦN CHỌN PHƯƠNG THỨC THANH TOÁN --- */}
                            <div className="mb-6 space-y-3">
                                <p className="font-bold text-gray-700 text-sm">Chọn phương thức thanh toán:</p>

                                <div
                                    onClick={() => setPaymentMethod('vnpay')}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${paymentMethod === 'vnpay' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="w-5 h-5 rounded-full border flex items-center justify-center border-gray-400">
                                        {paymentMethod === 'vnpay' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                                    </div>
                                    <img src="https://vnpay.vn/assets/images/logo-icon/logo-primary.svg" alt="VNPay" className="h-6 object-contain" />
                                    <span className="text-sm font-medium">Ví VNPay</span>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('paypal')}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="w-5 h-5 rounded-full border flex items-center justify-center border-gray-400">
                                        {paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                                    </div>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 object-contain" />
                                    <span className="text-sm font-medium">PayPal</span>
                                </div>
                            </div>
                            {/* ----------------------------------------- */}

                            <button
                                onClick={handleCheckout}
                                disabled={processing}
                                className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Thanh toán ngay <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}