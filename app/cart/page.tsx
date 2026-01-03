'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { ICourse } from '@/types';
import { Trash2, ShoppingCart, ArrowRight, Loader2, AlertTriangle, Ticket, X, AlertCircle } from 'lucide-react';
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

    // --- STATE COUPON ---
    const [couponCode, setCouponCode] = useState('');
    const [checkingCoupon, setCheckingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount: number } | null>(null);
    const [couponError, setCouponError] = useState(''); // State lưu lỗi riêng cho coupon

    // --- STATE UI ---
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
            const newCart = cartCourses.filter(c => c._id !== deleteId);
            setCartCourses(newCart);

            if (appliedCoupon) {
                setAppliedCoupon(null);
                setCouponCode('');
                toast('Giỏ hàng thay đổi, vui lòng áp dụng lại mã', { icon: 'ℹ️' });
            }

            setDeleteId(null);
        } catch (error) {
            console.error("Lỗi xóa khỏi giỏ hàng");
        } finally {
            setDeleting(false);
        }
    };

    // --- HÀM XỬ LÝ COUPON (MỚI) ---
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setCheckingCoupon(true);
        setCouponError(''); // Reset lỗi cũ

        try {
            const courseIds = cartCourses.map(c => c._id);
            const { data } = await axiosClient.post('/payment/check-coupon', {
                code: couponCode,
                courseIds
            });

            if (data.success) {
                const targetCourse = cartCourses.find(c => c._id === data.data.courseId);

                if (targetCourse) {
                    const discountValue = (targetCourse.price * data.data.discountPercent) / 100;
                    setAppliedCoupon({
                        code: data.data.code,
                        discount: discountValue
                    });
                    toast.success(`Áp dụng thành công!`);
                }
            }
        } catch (error: any) {
            setAppliedCoupon(null);
            // Lấy message lỗi từ backend (đã fix ở trên)
            const msg = error.response?.data?.message || "Mã không hợp lệ";
            setCouponError(msg); // Hiển thị lỗi đỏ dưới input
        } finally {
            setCheckingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
        toast.success("Đã gỡ bỏ mã giảm giá");
    };

    // --- HÀM XỬ LÝ THANH TOÁN ---
    const handleCheckout = async () => {
        if (cartCourses.length === 0) return;
        setProcessing(true);

        try {
            const { data } = await axiosClient.post('/payment/create_payment_url', {
                method: paymentMethod,
                items: cartCourses.map(c => c._id),
                couponCode: appliedCoupon?.code || null
            });

            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                toast.error("Không lấy được link thanh toán!");
            }

        } catch (error: any) {
            console.error("Lỗi thanh toán:", error);
            toast.error(error.response?.data?.message || "Lỗi khởi tạo thanh toán");
        } finally {
            setProcessing(false);
        }
    };

    const subTotal = cartCourses.reduce((sum, item) => sum + item.price, 0);
    const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalTotal = subTotal - discountAmount;

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-purple-600" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen relative">
            {/* Modal Xóa */}
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
                    {/* CỘT TRÁI: LIST ITEM */}
                    <div className="flex-1 space-y-4">
                        <p className="font-bold text-gray-700">{cartCourses.length} khóa học trong giỏ</p>
                        {cartCourses.map((item) => (
                            <div key={item._id} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow transition">
                                <Link href={`/course/${item.slug}`} className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    <img src={item.thumbnail?.url || '/placeholder.jpg'} className="w-full h-full object-cover" alt={item.title} />
                                </Link>
                                <div className="flex-1 flex justify-between">
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <Link href={`/course/${item.slug}`}>
                                                <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-purple-600 mb-1">{item.title}</h3>
                                            </Link>
                                            <p className="text-xs text-gray-500">Bởi {typeof item.instructor === 'object' ? item.instructor.name : 'Giảng viên'}</p>
                                        </div>
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

                    {/* CỘT PHẢI: CHECKOUT */}
                    <div className="lg:w-[400px]">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg sticky top-24 space-y-6">

                            {/* KHU VỰC COUPON (ĐÃ SỬA GIAO DIỆN) */}
                            <div>
                                <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm">
                                    <Ticket className="w-4 h-4 text-purple-600" /> Mã ưu đãi
                                </h3>

                                {!appliedCoupon ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => {
                                                    setCouponCode(e.target.value.toUpperCase());
                                                    if (couponError) setCouponError(''); // Xóa lỗi khi nhập lại
                                                }}
                                                placeholder="Nhập mã giảm giá"
                                                className={`flex-1 p-2.5 text-sm border rounded-lg outline-none uppercase transition
                                                    ${couponError
                                                        ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50 text-red-900'
                                                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
                                                    }`}
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={checkingCoupon || !couponCode}
                                                className="bg-gray-800 text-white px-4 rounded-lg font-bold text-sm hover:bg-gray-900 disabled:opacity-50 min-w-[80px] flex justify-center items-center"
                                            >
                                                {checkingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
                                            </button>
                                        </div>

                                        {/* HỘP THÔNG BÁO LỖI */}
                                        {couponError && (
                                            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-2 rounded border border-red-100 animate-in fade-in slide-in-from-top-1">
                                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs font-medium leading-relaxed">
                                                    {couponError}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-green-800 font-bold text-sm flex items-center gap-1">
                                                <Ticket className="w-3 h-3" /> {appliedCoupon.code}
                                            </p>
                                            <p className="text-green-600 text-xs">Đã giảm {appliedCoupon.discount.toLocaleString('vi-VN')} đ</p>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 p-1">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <hr className="border-gray-100" />

                            {/* TỔNG TIỀN */}
                            <div>
                                <div className="flex justify-between text-gray-500 text-sm mb-2">
                                    <span>Tạm tính:</span>
                                    <span>{subTotal.toLocaleString('vi-VN')} đ</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-600 text-sm mb-2">
                                        <span>Giảm giá:</span>
                                        <span>- {appliedCoupon.discount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-dashed mt-2">
                                    <span className="font-bold text-gray-800">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-purple-600">
                                        {finalTotal > 0 ? finalTotal.toLocaleString('vi-VN') : '0'} đ
                                    </span>
                                </div>
                            </div>

                            {/* PHƯƠNG THỨC THANH TOÁN */}
                            <div className="space-y-3">
                                <p className="font-bold text-gray-700 text-sm">Thanh toán qua:</p>

                                <div onClick={() => setPaymentMethod('vnpay')} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${paymentMethod === 'vnpay' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="w-5 h-5 rounded-full border flex items-center justify-center border-gray-400">
                                        {paymentMethod === 'vnpay' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                                    </div>
                                    <img src="https://vnpay.vn/assets/images/logo-icon/logo-primary.svg" alt="VNPay" className="h-6 object-contain" />
                                    <span className="text-sm font-medium">Ví VNPay</span>
                                </div>

                                <div onClick={() => setPaymentMethod('paypal')} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="w-5 h-5 rounded-full border flex items-center justify-center border-gray-400">
                                        {paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                                    </div>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 object-contain" />
                                    <span className="text-sm font-medium">PayPal</span>
                                </div>
                            </div>

                            <button onClick={handleCheckout} disabled={processing} className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-200">
                                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Thanh toán ngay <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}