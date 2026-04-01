'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { ICourse } from '@/types';
import { Trash2, ShoppingCart, ArrowRight, Loader2, AlertTriangle, Ticket, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import toast, { Toaster } from 'react-hot-toast';

export default function CartPage() {
    const [cartCourses, setCartCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);
    const { removeFromCart } = useCart();

    // --- STATE THANH TOÁN ---
    const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'paypal'>('vnpay');
    const [processing, setProcessing] = useState(false);

    // --- STATE UI ---
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // 💡 KIẾN TRÚC MỚI: QUẢN LÝ COUPON CHO TỪNG KHÓA HỌC
    // Key của các object này chính là courseId
    const [couponInputs, setCouponInputs] = useState<Record<string, string>>({});
    const [appliedCoupons, setAppliedCoupons] = useState<Record<string, { code: string; discountAmount: number }>>({});
    const [couponErrors, setCouponErrors] = useState<Record<string, string>>({});
    const [checkingCoupons, setCheckingCoupons] = useState<Record<string, boolean>>({});

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

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);

        try {
            await removeFromCart(deleteId);
            setCartCourses(cartCourses.filter(c => c._id !== deleteId));

            // Xóa luôn dữ liệu coupon của khóa học này nếu có
            if (appliedCoupons[deleteId]) {
                const newApplied = { ...appliedCoupons };
                delete newApplied[deleteId];
                setAppliedCoupons(newApplied);
            }

            setDeleteId(null);
            toast.success('Đã xóa khỏi giỏ hàng');
        } catch (error) {
            console.error("Lỗi xóa khỏi giỏ hàng");
        } finally {
            setDeleting(false);
        }
    };

    // --- HÀM XỬ LÝ COUPON ĐỘC LẬP ---
    const handleApplyCoupon = async (courseId: string) => {
        const code = couponInputs[courseId]?.trim();
        if (!code) return;

        setCheckingCoupons(prev => ({ ...prev, [courseId]: true }));
        setCouponErrors(prev => ({ ...prev, [courseId]: '' }));

        try {
            // Gọi API kiểm tra mã (truyền courseId vào mảng để tương thích backend)
            const { data } = await axiosClient.post('/payment/check-coupon', {
                code,
                courseId: courseId,
                courseIds: [courseId] // Gửi cả 2 dự phòng tùy phiên bản Backend của bạn
            });

            if (data.success) {
                const targetCourse = cartCourses.find(c => c._id === courseId);
                if (targetCourse) {
                    const discountValue = (targetCourse.price * data.data.discountPercent) / 100;

                    setAppliedCoupons(prev => ({
                        ...prev,
                        [courseId]: { code: data.data.code, discountAmount: discountValue }
                    }));

                    // Reset input
                    setCouponInputs(prev => ({ ...prev, [courseId]: '' }));
                    toast.success('Áp dụng mã thành công!');
                }
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Mã không hợp lệ";
            setCouponErrors(prev => ({ ...prev, [courseId]: msg }));
        } finally {
            setCheckingCoupons(prev => ({ ...prev, [courseId]: false }));
        }
    };

    const handleRemoveCoupon = (courseId: string) => {
        const newApplied = { ...appliedCoupons };
        delete newApplied[courseId];
        setAppliedCoupons(newApplied);
        setCouponErrors(prev => ({ ...prev, [courseId]: '' }));
        toast.success("Đã gỡ mã giảm giá");
    };

    // --- HÀM XỬ LÝ THANH TOÁN (GỬI MẢNG COUPON LÊN BE) ---
    const handleCheckout = async () => {
        if (cartCourses.length === 0) return;
        setProcessing(true);

        try {
            // Chuyển Object appliedCoupons thành Array theo đúng chuẩn Backend mới
            const appliedCouponsArray = Object.entries(appliedCoupons).map(([courseId, data]) => ({
                courseId: courseId,
                code: data.code
            }));

            const { data } = await axiosClient.post('/payment/create_payment_url', {
                method: paymentMethod,
                items: cartCourses.map(c => c._id),
                appliedCoupons: appliedCouponsArray // 💡 GỬI MẢNG MÃ GIẢM GIÁ
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

    // --- TÍNH TOÁN TỔNG TIỀN ---
    const subTotal = cartCourses.reduce((sum, item) => sum + item.price, 0);
    const totalDiscount = Object.values(appliedCoupons).reduce((sum, item) => sum + item.discountAmount, 0);
    const finalTotal = subTotal - totalDiscount;

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-purple-600" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen relative">
            <Toaster />
            {/* Modal Xóa */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa khỏi giỏ hàng?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Bạn có chắc muốn bỏ khóa học này ra khỏi giỏ hàng không?</p>
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
                    {/* CỘT TRÁI: DANH SÁCH KHÓA HỌC */}
                    <div className="flex-1 space-y-4">
                        <p className="font-bold text-gray-700">{cartCourses.length} khóa học trong giỏ</p>

                        {cartCourses.map((item) => {
                            const isFree = item.price === 0;
                            const applied = appliedCoupons[item._id];
                            const error = couponErrors[item._id];
                            const isChecking = checkingCoupons[item._id];

                            return (
                                <div key={item._id} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow transition">
                                    <Link href={`/course/${item.slug}`} className="w-full sm:w-36 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                        <img src={item.thumbnail?.url || '/placeholder.jpg'} className="w-full h-full object-cover" alt={item.title} />
                                    </Link>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Link href={`/course/${item.slug}`}>
                                                    <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-purple-600 mb-1">{item.title}</h3>
                                                </Link>
                                                <p className="text-xs text-gray-500 mb-2">Bởi {typeof item.instructor === 'object' ? item.instructor.name : 'Giảng viên'}</p>
                                            </div>
                                            <button onClick={() => setDeleteId(item._id)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg transition" title="Xóa">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mt-2 gap-4">
                                            {/* KHU VỰC NHẬP MÃ GIẢM GIÁ CHO TỪNG KHÓA */}
                                            <div className="w-full sm:w-auto flex-1">
                                                {!isFree && (
                                                    applied ? (
                                                        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                                                            <Ticket className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm font-bold text-green-700">{applied.code}</span>
                                                            <button onClick={() => handleRemoveCoupon(item._id)} className="text-gray-400 hover:text-red-500 ml-2">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-1 w-full max-w-xs">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Nhập mã ưu đãi"
                                                                    value={couponInputs[item._id] || ''}
                                                                    onChange={(e) => setCouponInputs(prev => ({ ...prev, [item._id]: e.target.value.toUpperCase() }))}
                                                                    className={`flex-1 p-2 text-sm border rounded-lg outline-none uppercase transition ${error ? 'border-red-500 bg-red-50' : 'focus:border-purple-500'}`}
                                                                />
                                                                <button
                                                                    onClick={() => handleApplyCoupon(item._id)}
                                                                    disabled={isChecking || !couponInputs[item._id]}
                                                                    className="bg-gray-100 text-gray-700 px-3 rounded-lg text-sm font-bold hover:bg-gray-200 disabled:opacity-50"
                                                                >
                                                                    {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
                                                                </button>
                                                            </div>
                                                            {error && <span className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</span>}
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            {/* KHU VỰC GIÁ TIỀN */}
                                            <div className="text-right flex flex-col items-end min-w-[120px]">
                                                {isFree ? (
                                                    <span className="font-bold text-purple-600 text-lg">Miễn phí</span>
                                                ) : applied ? (
                                                    <>
                                                        <span className="text-sm text-gray-400 line-through mb-0.5">{item.price.toLocaleString('vi-VN')} đ</span>
                                                        <span className="font-bold text-red-500 text-lg">{(item.price - applied.discountAmount).toLocaleString('vi-VN')} đ</span>
                                                    </>
                                                ) : (
                                                    <span className="font-bold text-purple-600 text-lg">{item.price.toLocaleString('vi-VN')} đ</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CỘT PHẢI: CHECKOUT (TỔNG KẾT HÓA ĐƠN) */}
                    <div className="lg:w-[350px]">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg sticky top-24 space-y-6">
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Tổng hóa đơn</h3>

                            <div>
                                <div className="flex justify-between text-gray-600 mb-3">
                                    <span>Tạm tính:</span>
                                    <span className="font-medium">{subTotal.toLocaleString('vi-VN')} đ</span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 mb-3">
                                        <span>Tổng giảm giá:</span>
                                        <span className="font-bold">- {totalDiscount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                                    <span className="font-bold text-gray-800">Thanh toán:</span>
                                    <span className="text-2xl font-bold text-purple-600">
                                        {finalTotal > 0 ? finalTotal.toLocaleString('vi-VN') : '0'} đ
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-200">
                                <p className="font-bold text-gray-700 text-sm">Phương thức thanh toán:</p>
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

                            <button onClick={handleCheckout} disabled={processing} className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
                                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Thanh toán ngay <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}