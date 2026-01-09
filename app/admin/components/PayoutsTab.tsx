'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast from 'react-hot-toast';
import { IUser } from '@/types';
import { format } from 'date-fns';

interface IPayoutRequest {
    _id: string;
    instructor: IUser;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    paymentInfo: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
    createdAt: string;
    adminComment?: string;
}

export default function PayoutsTab({ onUpdateStats }: { onUpdateStats: () => void }) {
    const [payouts, setPayouts] = useState<IPayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modal, setModal] = useState<{ isOpen: boolean, req: IPayoutRequest | null, type: 'approve' | 'reject' }>({ isOpen: false, req: null, type: 'approve' });
    const [comment, setComment] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const { data } = await axiosClient.get('/admin/payouts');
            if (data.success) setPayouts(data.data);
        } catch (error) { toast.error("Lỗi tải dữ liệu"); }
        finally { setLoading(false); }
    };

    const handleProcess = async () => {
        if (!modal.req) return;
        setProcessing(true);
        try {
            const status = modal.type === 'approve' ? 'approved' : 'rejected';
            const finalComment = comment || (status === 'approved' ? 'Đã chuyển khoản' : 'Từ chối');

            await axiosClient.put(`/admin/payouts/${modal.req._id}`, { status, adminComment: finalComment });

            toast.success("Đã xử lý xong!");
            setPayouts(payouts.map(p => p._id === modal.req!._id ? { ...p, status, adminComment: finalComment } : p));
            setModal({ ...modal, isOpen: false });
            onUpdateStats(); // Gọi để update số lượng pending ở sidebar
        } catch (error) { toast.error("Lỗi xử lý"); }
        finally { setProcessing(false); }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải danh sách...</div>;

    return (
        <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Rút tiền</h2>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Giảng viên</th>
                            <th className="p-4">Số tiền</th>
                            <th className="p-4">Ngân hàng</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payouts.map((req) => (
                            <tr key={req._id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <p className="font-bold">{req.instructor?.name}</p>
                                    <p className="text-xs text-gray-500">{format(new Date(req.createdAt), 'dd/MM/yyyy')}</p>
                                </td>
                                <td className="p-4 font-bold text-green-600">{req.amount.toLocaleString()} đ</td>
                                <td className="p-4 text-sm">
                                    <p>{req.paymentInfo.bankName}</p>
                                    <p className="text-xs text-gray-500">{req.paymentInfo.accountNumber} - {req.paymentInfo.accountName}</p>
                                </td>
                                <td className="p-4">
                                    {req.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">Chờ duyệt</span>}
                                    {req.status === 'approved' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">Đã chuyển</span>}
                                    {req.status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">Từ chối</span>}
                                </td>
                                <td className="p-4 text-right">
                                    {req.status === 'pending' ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setModal({ isOpen: true, req, type: 'approve' }); setComment(''); }} className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700 flex gap-1 items-center"><CheckCircle className="w-3 h-3" /> Duyệt</button>
                                            <button onClick={() => { setModal({ isOpen: true, req, type: 'reject' }); setComment(''); }} className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded text-xs font-bold hover:bg-red-100 flex gap-1 items-center"><XCircle className="w-3 h-3" /> Hủy</button>
                                        </div>
                                    ) : <span className="text-xs text-gray-400 italic">--</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payouts.length === 0 && <p className="p-10 text-center text-gray-400">Không có dữ liệu.</p>}
            </div>

            {/* MODAL */}
            {modal.isOpen && modal.req && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className={`text-lg font-bold mb-4 ${modal.type === 'approve' ? 'text-green-700' : 'text-red-700'}`}>
                            {modal.type === 'approve' ? 'Duyệt yêu cầu chuyển khoản' : 'Từ chối yêu cầu'}
                        </h3>
                        <textarea
                            className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder={modal.type === 'approve' ? "Nhập mã giao dịch ngân hàng..." : "Nhập lý do từ chối..."}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="flex-1 py-2 bg-gray-100 font-bold rounded">Hủy</button>
                            <button onClick={handleProcess} disabled={processing} className={`flex-1 py-2 text-white font-bold rounded flex justify-center gap-2 ${modal.type === 'approve' ? 'bg-green-600' : 'bg-red-600'}`}>
                                {processing ? <Loader2 className="animate-spin w-4 h-4" /> : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}