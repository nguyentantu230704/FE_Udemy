'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';
import { Trash2, Plus, Ticket } from 'lucide-react';
import { format } from 'date-fns';

interface ICoupon {
    _id: string;
    code: string;
    discountPercent: number;
    expiryDate: string;
    course: { _id: string; title: string };
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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Gọi song song 2 API: Lấy list coupon và list khóa học (để chọn khi tạo)
            const [couponRes, courseRes] = await Promise.all([
                axiosClient.get('/instructor/coupons'),
                axiosClient.get('/instructor/courses-select') // API này cần trả về list khóa của giảng viên
            ]);
            if (couponRes.data.success) setCoupons(couponRes.data.data);
            // Lọc khóa học của chính giảng viên (Giả sử API /courses trả về hết, nếu bạn chưa có API lấy my-courses-list thì dùng tạm filter hoặc tạo thêm API)
            // Ở đây mình giả định courseRes trả về đúng list khóa học giảng viên sở hữu
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
                expiryDate: expiry
            });
            toast.success("Tạo mã thành công!");
            setCoupons([...coupons, { ...data.data, course: courses.find(c => c._id === courseId) }]); // Update UI nhanh
            setCode(''); setDiscount(10); // Reset form
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi tạo mã");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn chắc chắn muốn xóa mã này?")) return;
        try {
            await axiosClient.delete(`/instructor/coupons/${id}`);
            setCoupons(coupons.filter(c => c._id !== id));
            toast.success("Đã xóa");
        } catch (error) {
            toast.error("Lỗi xóa");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Toaster />
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Ticket className="text-purple-600" /> Quản lý Mã giảm giá
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM TẠO MÃ */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="font-bold text-lg mb-4">Tạo mã mới</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Mã Coupon (VD: SALE20)</label>
                            <input required type="text" className="w-full p-2 border rounded mt-1 uppercase"
                                value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="SUMMER2025" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Giảm giá (%)</label>
                            <input required type="number" min="1" max="100" className="w-full p-2 border rounded mt-1"
                                value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Áp dụng cho khóa học</label>
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
                        <button disabled={loading} className="w-full bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700 flex justify-center items-center gap-2">
                            <Plus className="w-4 h-4" /> {loading ? 'Đang tạo...' : 'Tạo mã'}
                        </button>
                    </form>
                </div>

                {/* DANH SÁCH MÃ */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Mã</th>
                                    <th className="p-4 font-semibold text-gray-600">Giảm</th>
                                    <th className="p-4 font-semibold text-gray-600">Khóa học</th>
                                    <th className="p-4 font-semibold text-gray-600">Hết hạn</th>
                                    <th className="p-4 font-semibold text-gray-600">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {coupons.map(coupon => (
                                    <tr key={coupon._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono font-bold text-purple-600">{coupon.code}</td>
                                        <td className="p-4 font-bold text-green-600">-{coupon.discountPercent}%</td>
                                        <td className="p-4 text-sm max-w-xs truncate" title={coupon.course?.title}>{coupon.course?.title || 'Unknown'}</td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {format(new Date(coupon.expiryDate), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => handleDelete(coupon._id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {coupons.length === 0 && (
                                    <tr><td colSpan={5} className="p-6 text-center text-gray-500">Chưa có mã giảm giá nào.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}