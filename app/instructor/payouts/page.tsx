'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';
import { DollarSign, History, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface IPayout {
    _id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    adminComment?: string;
}

export default function PayoutPage() {
    const [history, setHistory] = useState<IPayout[]>([]);

    // Form State
    const [amount, setAmount] = useState<number>(500000);
    const [bankName, setBankName] = useState('');
    const [accNumber, setAccNumber] = useState('');
    const [accName, setAccName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await axiosClient.get('/instructor/payouts');
            if (data.success) setHistory(data.data);
        } catch (error) { console.error(error); }
    };

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount < 500000) return toast.error("Số tiền rút tối thiểu là 500.000đ");

        setLoading(true);
        try {
            const { data } = await axiosClient.post('/instructor/payouts', {
                amount,
                paymentInfo: { bankName, accountNumber: accNumber, accountName: accName, note: 'Yêu cầu rút tiền' }
            });
            toast.success("Gửi yêu cầu thành công!");
            setHistory([data.data, ...history]); // Update list
            // Reset form
            setAmount(500000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi gửi yêu cầu");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Đã chuyển</span>;
            case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Từ chối</span>;
            default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Đang chờ</span>;
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Toaster />
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <DollarSign className="text-purple-600" /> Quản lý Rút tiền
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FORM RÚT TIỀN */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-purple-100 h-fit">
                    <h2 className="font-bold text-xl mb-6 text-gray-800">Yêu cầu rút tiền mới</h2>
                    <form onSubmit={handleRequest} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền muốn rút (VND)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">₫</span>
                                <input required type="number" min="500000" step="50000" className="w-full pl-8 p-3 border rounded-lg font-bold text-lg text-purple-700"
                                    value={amount} onChange={e => setAmount(Number(e.target.value))} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">* Tối thiểu 500.000đ. Phí sàn 30% đã được trừ trước khi vào số dư.</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
                            <p className="text-sm font-bold text-gray-700 mb-2 border-b pb-2">Thông tin nhận tiền</p>
                            <input required type="text" placeholder="Tên Ngân hàng (VD: Vietcombank)" className="w-full p-2 border rounded text-sm"
                                value={bankName} onChange={e => setBankName(e.target.value)} />
                            <input required type="text" placeholder="Số tài khoản" className="w-full p-2 border rounded text-sm"
                                value={accNumber} onChange={e => setAccNumber(e.target.value)} />
                            <input required type="text" placeholder="Tên chủ tài khoản (In hoa)" className="w-full p-2 border rounded text-sm uppercase"
                                value={accName} onChange={e => setAccName(e.target.value.toUpperCase())} />
                        </div>

                        <button disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200">
                            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu rút tiền'}
                        </button>
                    </form>
                </div>

                {/* LỊCH SỬ RÚT TIỀN */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-500" /> Lịch sử giao dịch
                    </h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {history.map(item => (
                            <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition">
                                <div>
                                    <p className="font-bold text-gray-800">{item.amount.toLocaleString('vi-VN')} đ</p>
                                    <p className="text-xs text-gray-500">{format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                                <div className="text-right">
                                    {getStatusBadge(item.status)}
                                    {item.adminComment && <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={item.adminComment}>{item.adminComment}</p>}
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && <p className="text-center text-gray-500 py-10">Chưa có giao dịch nào.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}