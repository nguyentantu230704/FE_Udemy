'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';
import { Trash2, Plus, Ticket, Eye, X, AlertTriangle, Users } from 'lucide-react';
import { format } from 'date-fns';

// 1. Cập nhật Interface khớp với Backend mới
interface ICouponHistory {
    _id: string;
    user: { _id: string; name: string; email: string; avatar?: string };
    orderId: string;
    usedAt: string;
}

interface ICoupon {
    _id: string;
    code: string;
    discountPercent: number;
    expiryDate: string;
    course: { _id: string; title: string };
    usageLimit: number;
    usedCount: number;
    usedBy: ICouponHistory[];
}

interface ICourseSimple { _id: string; title: string; }

export default function CouponPage() {
    const [coupons, setCoupons] = useState<ICoupon[]>([]);
    const [courses, setCourses] = useState<ICourseSimple[]>([]);

    // Form State
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState(10);
    const [courseId, setCourseId] = useState('');
    const [expiry, setExpiry] = useState('');
    const [usageLimit, setUsageLimit] = useState(100); // Thêm state cho số lượng
    const [loading, setLoading] = useState(false);

    // Modal Xóa Mã
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState<ICoupon | null>(null);

    // Modal Xem Lịch Sử
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [couponRes, courseRes] = await Promise.all([
                axiosClient.get('/instructor/coupons'),
                axiosClient.get('/instructor/courses-select')
            ]);
            if (couponRes.data.success) setCoupons(couponRes.data.data);
            if (courseRes.data.success) setCourses(courseRes.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId) return toast.error("Vui lòng chọn khóa học");
        setLoading(true);
        try {
            const { data } = await axiosClient.post('/instructor/coupons', {
                code,
                discountPercent: Number(discount),
                courseId,
                expiryDate: expiry,
                usageLimit: Number(usageLimit) // Gửi giới hạn lên BE
            });
            toast.success("Tạo mã thành công!");

            // Refetch lại danh sách cho chắc cú thay vì update array thủ công
            fetchData();

            // Reset form
            setCode(''); setDiscount(10); setUsageLimit(100); setCourseId(''); setExpiry('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi tạo mã");
        } finally {
            setLoading(false);
        }
    };

    // Hành động khi bấm nút Thùng rác (Chỉ mở Modal)
    const openDeleteModal = (coupon: ICoupon) => {
        setCouponToDelete(coupon);
        setIsDeleteModalOpen(true);
    };

    // Hàm gọi API xóa thực sự
    const confirmDelete = async () => {
        if (!couponToDelete) return;
        try {
            await axiosClient.delete(`/instructor/coupons/${couponToDelete._id}`);
            setCoupons(coupons.filter(c => c._id !== couponToDelete._id));
            toast.success("Đã xóa mã giảm giá");
        } catch (error) {
            toast.error("Lỗi xóa mã");
        } finally {
            setIsDeleteModalOpen(false);
            setCouponToDelete(null);
        }
    };

    // Hàm xác định trạng thái của mã giảm giá
    const getCouponStatus = (coupon: ICoupon) => {
        const now = new Date();
        const expDate = new Date(coupon.expiryDate);
        if (coupon.usedCount >= coupon.usageLimit) return { label: 'Hết lượt', color: 'bg-red-100 text-red-600' };
        if (now > expDate) return { label: 'Hết hạn', color: 'bg-gray-100 text-gray-600' };
        return { label: 'Đang chạy', color: 'bg-green-100 text-green-700' };
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Toaster />
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Ticket className="text-purple-600" /> Quản lý Mã giảm giá
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* FORM TẠO MÃ */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit lg:col-span-1">
                    <h2 className="font-bold text-lg mb-4">Tạo mã mới</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Mã Coupon</label>
                            <input required type="text" className="w-full p-2 border rounded mt-1 uppercase focus:ring-purple-500 focus:border-purple-500"
                                value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="VD: SALE20" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700">Giảm giá (%)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full p-2 border rounded mt-1"
                                    value={discount}
                                    onChange={(e) => {
                                        let val = parseInt(e.target.value);

                                        // Cho phép xóa trắng ô input để gõ số mới
                                        if (isNaN(val)) {
                                            setDiscount('' as any);
                                            return;
                                        }

                                        // Chặn trên 100 và dưới 1
                                        if (val > 100) val = 100;
                                        if (val < 1) val = 1;

                                        setDiscount(val);
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700">Số lượng</label>
                                <input required type="number" min="1" className="w-full p-2 border rounded mt-1"
                                    value={usageLimit} onChange={e => setUsageLimit(Number(e.target.value))} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Khóa học</label>
                            <select required className="w-full p-2 border rounded mt-1"
                                value={courseId} onChange={e => setCourseId(e.target.value)}>
                                <option value="">-- Chọn khóa học --</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Hạn sử dụng</label>
                            <input required type="date" className="w-full p-2 border rounded mt-1"
                                value={expiry} onChange={e => setExpiry(e.target.value)} />
                        </div>
                        <button disabled={loading} className="w-full bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700 transition flex justify-center items-center gap-2">
                            <Plus className="w-4 h-4" /> {loading ? 'Đang tạo...' : 'Tạo mã'}
                        </button>
                    </form>
                </div>

                {/* DANH SÁCH MÃ GIẢM GIÁ */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">Mã</th>
                                        <th className="p-4 font-semibold text-gray-600">Khóa học</th>
                                        <th className="p-4 font-semibold text-gray-600">Tiến độ (Đã dùng)</th>
                                        <th className="p-4 font-semibold text-gray-600">Hạn dùng</th>
                                        <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                                        <th className="p-4 font-semibold text-gray-600 text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {coupons.map(coupon => {
                                        const status = getCouponStatus(coupon);
                                        const percentUsed = Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100);

                                        return (
                                            <tr key={coupon._id} className="hover:bg-gray-50 transition">
                                                <td className="p-4">
                                                    <div className="font-mono font-bold text-purple-600 text-lg">{coupon.code}</div>
                                                    <div className="text-sm font-medium text-green-600">Giảm {coupon.discountPercent}%</div>
                                                </td>
                                                <td className="p-4 text-sm max-w-[200px] truncate" title={coupon.course?.title}>
                                                    {coupon.course?.title || 'Đã xóa'}
                                                </td>
                                                <td className="p-4 w-48">
                                                    <div className="flex justify-between text-xs mb-1 font-medium text-gray-600">
                                                        <span>{coupon.usedCount}</span>
                                                        <span>{coupon.usageLimit}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${percentUsed >= 100 ? 'bg-red-500' : 'bg-purple-500'}`}
                                                            style={{ width: `${percentUsed}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500 font-medium">
                                                    {format(new Date(coupon.expiryDate), 'dd/MM/yyyy')}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => { setSelectedCoupon(coupon); setIsHistoryModalOpen(true); }}
                                                            className="text-blue-500 hover:bg-blue-50 p-2 rounded transition" title="Xem lịch sử xài mã"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(coupon)}
                                                            className="text-red-500 hover:bg-red-50 p-2 rounded transition" title="Xóa mã"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {coupons.length === 0 && (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Chưa có mã giảm giá nào. Cùng tạo mã để tăng doanh thu nhé!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL XÁC NHẬN XÓA */}
            {isDeleteModalOpen && couponToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform scale-100 transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa mã giảm giá</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Bạn có chắc chắn muốn xóa mã <strong className="text-red-600">{couponToDelete.code}</strong> không? Hành động này không thể hoàn tác và học viên sẽ không thể sử dụng mã này nữa.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                            >
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL LỊCH SỬ SỬ DỤNG */}
            {isHistoryModalOpen && selectedCoupon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-600" />
                                    Lịch sử áp dụng mã: <span className="text-purple-600">{selectedCoupon.code}</span>
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Đã dùng {selectedCoupon.usedCount} / {selectedCoupon.usageLimit} lượt
                                </p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-5 overflow-y-auto">
                            {selectedCoupon.usedBy && selectedCoupon.usedBy.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedCoupon.usedBy.map((history, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold overflow-hidden">
                                                    {history.user?.avatar ? (
                                                        <img src={history.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        history.user?.name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{history.user?.name || 'Khách'}</p>
                                                    <p className="text-xs text-gray-500">{history.user?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-mono text-gray-500">Đơn: {history.orderId || 'N/A'}</p>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {history.usedAt ? format(new Date(history.usedAt), 'HH:mm - dd/MM/yyyy') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p>Chưa có ai sử dụng mã này.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}