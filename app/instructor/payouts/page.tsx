'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { Loader2, DollarSign, CreditCard, History, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

// Interface cho Lịch sử
interface IPayout {
    _id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    adminComment?: string;
}

export default function PayoutPage() {
    // State Số dư
    const [balance, setBalance] = useState({ totalEarned: 0, totalWithdrawn: 0, availableBalance: 0 });

    // State Lịch sử
    const [history, setHistory] = useState<IPayout[]>([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [amount, setAmount] = useState<number | ''>('');
    const [bankInfo, setBankInfo] = useState({
        bankName: '',
        accountNumber: '',
        accountName: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Gọi song song cả 2 API để tiết kiệm thời gian
            const [balanceRes, historyRes] = await Promise.all([
                axiosClient.get('/instructor/payouts/balance'),
                axiosClient.get('/instructor/payouts')
            ]);

            if (balanceRes.data.success) setBalance(balanceRes.data.data);
            if (historyRes.data.success) setHistory(historyRes.data.data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate Frontend
        if (!amount || Number(amount) < 50000) {
            toast.error("Tối thiểu rút 50.000đ");
            return;
        }
        if (Number(amount) > balance.availableBalance) {
            toast.error("Số tiền vượt quá số dư khả dụng");
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await axiosClient.post('/instructor/payouts', {
                amount: Number(amount),
                bankInfo
            });
            if (data.success) {
                toast.success("Đã gửi yêu cầu rút tiền!");
                setAmount('');

                // Refresh lại toàn bộ dữ liệu (Số dư mới + Lịch sử mới)
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi gửi yêu cầu");
        } finally {
            setSubmitting(false);
        }
    };

    // Helper hiển thị trạng thái đẹp hơn
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Đã chuyển</span>;
            case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Từ chối</span>;
            default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Đang chờ</span>;
        }
    }

    // Thêm các hàm hỗ trợ tăng giảm
    const handleIncrease = () => {
        const current = amount === '' ? 0 : Number(amount);
        const next = current + 100000;
        // Không cho vượt quá số dư
        if (next > balance.availableBalance) {
            setAmount(Math.floor(balance.availableBalance));
        } else {
            setAmount(next);
        }
    };

    const handleDecrease = () => {
        const current = amount === '' ? 0 : Number(amount);
        const next = current - 100000;
        if (next < 0) {
            setAmount(0);
        } else {
            setAmount(next);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setAmount('');
            return;
        }
        const num = Number(val);
        // Chặn số âm ngay lập tức
        if (num < 0) return;
        setAmount(num);
    };


    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;

    return (
        <div className="max-w-6xl mx-auto p-6 animate-in fade-in">
            <Toaster />
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <DollarSign className="text-purple-600" /> Quản lý Tài chính
            </h1>

            {/* 1. THÔNG TIN VÍ (3 Thẻ trên cùng) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-bold uppercase mb-1">Tổng thu nhập (70%)</p>
                    <h3 className="text-2xl font-extrabold text-gray-900">{Math.round(balance.totalEarned).toLocaleString('vi-VN')} đ</h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-bold uppercase mb-1">Đã rút / Chờ duyệt</p>
                    <h3 className="text-2xl font-extrabold text-orange-600">{Math.round(balance.totalWithdrawn).toLocaleString('vi-VN')} đ</h3>
                </div>
                <div className="bg-purple-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-100 text-sm font-bold uppercase mb-1">Số dư khả dụng</p>
                            <h3 className="text-3xl font-extrabold">{Math.floor(balance.availableBalance).toLocaleString('vi-VN')} đ</h3>
                        </div>
                        <DollarSign className="w-8 h-8 opacity-50" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 2. FORM RÚT TIỀN (Bên Trái) */}
                <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-8 h-fit">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
                        <CreditCard className="w-5 h-5 text-purple-600" /> Tạo yêu cầu rút tiền
                    </h2>

                    <form onSubmit={handleRequestPayout}>
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Số tiền muốn rút (VNĐ)</label>

                            <div className="flex items-center gap-2">
                                {/* Nút Trừ */}
                                <button
                                    type="button" // Quan trọng: type button để không submit form
                                    onClick={handleDecrease}
                                    className="w-12 h-12 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xl transition active:scale-95"
                                >
                                    -
                                </button>

                                {/* Input chính */}
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={handleAmountChange}

                                        step={1} // <--- SỬA Ở ĐÂY: Cho phép nhập số lẻ bất kỳ (VD: 413999)

                                        min={0}
                                        className={`w-full p-3 pl-4 pr-12 border rounded-lg focus:ring-2 outline-none font-bold text-lg transition
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            ${Number(amount) > balance.availableBalance
                                                ? 'border-red-500 focus:ring-red-200 text-red-600'
                                                : 'border-gray-300 focus:ring-purple-500 text-gray-900'}
        `}
                                        placeholder="50000"
                                    />
                                    <span className="absolute right-4 top-3.5 text-gray-400 font-bold text-sm pointer-events-none">VNĐ</span>
                                </div>

                                {/* Nút Cộng */}
                                <button
                                    type="button"
                                    onClick={handleIncrease}
                                    className="w-12 h-12 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xl transition active:scale-95"
                                >
                                    +
                                </button>
                            </div>

                            {/* Logic hiển thị lỗi hoặc gợi ý */}
                            {Number(amount) > balance.availableBalance ? (
                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3 h-3" /> Số tiền vượt quá số dư khả dụng
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500 mt-2 flex justify-between">
                                    <span>* Tối thiểu: 50.000 đ</span>
                                    <span>
                                        Tối đa: <span className="font-bold cursor-pointer text-purple-600 hover:underline" onClick={() => setAmount(Math.floor(balance.availableBalance))}>
                                            {Math.floor(balance.availableBalance).toLocaleString('vi-VN')} đ
                                        </span>
                                    </span>
                                </p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-4 mb-6 border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase border-b pb-2 mb-2">Thông tin nhận tiền</p>
                            <div>
                                <input
                                    type="text" required
                                    value={bankInfo.bankName}
                                    onChange={e => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                                    className="w-full p-2.5 border rounded-md text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Tên Ngân hàng (VD: MBBank)"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text" required
                                    value={bankInfo.accountNumber}
                                    onChange={e => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                                    className="w-full p-2.5 border rounded-md text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Số Tài khoản"
                                />
                                <input
                                    type="text" required
                                    value={bankInfo.accountName}
                                    onChange={e => setBankInfo({ ...bankInfo, accountName: e.target.value.toUpperCase() })}
                                    className="w-full p-2.5 border rounded-md text-sm focus:ring-2 focus:ring-purple-500 outline-none uppercase"
                                    placeholder="TÊN CHỦ TK"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || Number(amount) < 50000 || Number(amount) > balance.availableBalance}
                            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-purple-100"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi yêu cầu'}
                        </button>
                    </form>
                </div>

                {/* 3. LỊCH SỬ GIAO DỊCH (Bên Phải) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-[500px]">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                        <History className="w-5 h-5 text-gray-500" /> Lịch sử rút tiền
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {history.length > 0 ? history.map((item) => (
                            <div key={item._id} className="flex justify-between items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{item.amount.toLocaleString('vi-VN')} đ</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    {getStatusBadge(item.status)}
                                    {/* Hiển thị lý do nếu bị từ chối */}
                                    {item.status === 'rejected' && item.adminComment && (
                                        <p className="text-xs text-red-500 mt-2 max-w-[150px] truncate bg-red-50 px-2 py-1 rounded" title={item.adminComment}>
                                            Lý do: {item.adminComment}
                                        </p>
                                    )}
                                    {/* Hiển thị mã giao dịch nếu thành công */}
                                    {item.status === 'approved' && item.adminComment && (
                                        <p className="text-xs text-green-600 mt-2 max-w-[150px] truncate" title={item.adminComment}>
                                            GD: {item.adminComment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <History className="w-12 h-12 mb-3 opacity-20" />
                                <p>Chưa có giao dịch nào.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}