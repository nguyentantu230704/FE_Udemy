'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { Loader2, DollarSign, CreditCard, History, AlertCircle, CheckCircle, XCircle, Clock, Landmark, ChevronLeft, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

interface IPayout {
    _id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    adminComment?: string;
    paymentInfo?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
}

export default function PayoutPage() {
    const [balance, setBalance] = useState({ totalEarned: 0, totalWithdrawn: 0, availableBalance: 0 });
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

    // --- LOGIC PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Hiển thị 5 thẻ rút tiền trên 1 trang vì thẻ khá to

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
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
                fetchData();
                setCurrentPage(1); // Trở về trang 1 khi có giao dịch mới
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi gửi yêu cầu");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-green-200"><CheckCircle className="w-3.5 h-3.5" /> Đã chuyển</span>;
            case 'rejected': return <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-red-200"><XCircle className="w-3.5 h-3.5" /> Từ chối</span>;
            default: return <span className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-yellow-200"><Clock className="w-3.5 h-3.5" /> Đang chờ</span>;
        }
    }

    const handleIncrease = () => {
        const current = amount === '' ? 0 : Number(amount);
        const next = current + 100000;
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
        if (num < 0) return;
        setAmount(num);
    };

    // Tính toán dữ liệu cho trang hiện tại
    const totalPages = Math.ceil(history.length / itemsPerPage);
    const currentData = history.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;

    return (
        <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
            <Toaster />
            <h1 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-2">
                <DollarSign className="w-7 h-7 text-purple-600 bg-purple-100 p-1 rounded-lg" /> Quản lý Tài chính
            </h1>

            {/* --- THÔNG TIN VÍ --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tổng thu nhập</p>
                    <h3 className="text-3xl font-extrabold text-gray-900">{Math.round(balance.totalEarned).toLocaleString('vi-VN')} đ</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Đã rút / Chờ duyệt</p>
                    <h3 className="text-3xl font-extrabold text-orange-600">{Math.round(balance.totalWithdrawn).toLocaleString('vi-VN')} đ</h3>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-purple-100 text-xs font-bold uppercase tracking-wider mb-2">Số dư khả dụng</p>
                        <h3 className="text-4xl font-extrabold">{Math.floor(balance.availableBalance).toLocaleString('vi-VN')} đ</h3>
                    </div>
                    <DollarSign className="w-32 h-32 absolute -right-6 -bottom-6 text-white opacity-10" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- FORM RÚT TIỀN (Bên Trái - Chiếm 5 cột) --- */}
                <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-fit">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-b border-gray-100 pb-4">
                        <CreditCard className="w-5 h-5 text-purple-600" /> Tạo yêu cầu rút tiền
                    </h2>

                    <form onSubmit={handleRequestPayout}>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Số tiền muốn rút (VNĐ)</label>

                            <div className="flex items-center gap-3">
                                <button type="button" onClick={handleDecrease} className="w-12 h-12 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-purple-300 flex items-center justify-center text-gray-600 font-bold text-xl transition active:scale-95">-</button>

                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        step={1}
                                        min={0}
                                        className={`w-full p-3 pl-4 pr-12 border-2 rounded-xl focus:ring-0 outline-none font-bold text-xl transition text-center
                                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                            ${Number(amount) > balance.availableBalance ? 'border-red-400 text-red-600 bg-red-50' : 'border-gray-200 focus:border-purple-500 text-purple-700 bg-purple-50/30'}`}
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-4 text-gray-400 font-bold text-sm pointer-events-none">đ</span>
                                </div>

                                <button type="button" onClick={handleIncrease} className="w-12 h-12 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-purple-300 flex items-center justify-center text-gray-600 font-bold text-xl transition active:scale-95">+</button>
                            </div>

                            {Number(amount) > balance.availableBalance ? (
                                <p className="text-red-500 text-sm mt-3 flex items-center gap-1 font-bold bg-red-50 p-2 rounded-lg">
                                    <AlertCircle className="w-4 h-4" /> Vượt quá số dư khả dụng!
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500 mt-3 flex justify-between font-medium">
                                    <span>Tối thiểu: 50.000 đ</span>
                                    <span>Rút tối đa: <span className="font-bold cursor-pointer text-purple-600 hover:underline" onClick={() => setAmount(Math.floor(balance.availableBalance))}>{Math.floor(balance.availableBalance).toLocaleString('vi-VN')} đ</span></span>
                                </p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-5 rounded-xl space-y-4 mb-8 border border-gray-200">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Landmark className="w-4 h-4" /> Thông tin nhận tiền
                            </p>
                            <div>
                                <input type="text" required value={bankInfo.bankName} onChange={e => setBankInfo({ ...bankInfo, bankName: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-0 outline-none transition" placeholder="Tên Ngân hàng (VD: Vietcombank, MBBank...)" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" required value={bankInfo.accountNumber} onChange={e => setBankInfo({ ...bankInfo, accountNumber: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm font-mono focus:border-purple-500 focus:ring-0 outline-none transition" placeholder="Số tài khoản" />
                                <input type="text" required value={bankInfo.accountName} onChange={e => setBankInfo({ ...bankInfo, accountName: e.target.value.toUpperCase() })} className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm font-bold focus:border-purple-500 focus:ring-0 outline-none uppercase transition" placeholder="TÊN CHỦ TK" />
                            </div>
                        </div>

                        <button type="submit" disabled={submitting || Number(amount) < 50000 || Number(amount) > balance.availableBalance} className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-purple-200 text-lg">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi yêu cầu rút tiền'}
                        </button>
                    </form>
                </div>

                {/* --- LỊCH SỬ GIAO DỊCH CÓ PHÂN TRANG (Bên Phải - Chiếm 7 cột) --- */}
                <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col h-fit min-h-[650px]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-b border-gray-100 pb-4 shrink-0">
                        <History className="w-5 h-5 text-gray-500" /> Lịch sử giao dịch
                    </h2>

                    <div className="flex-1 space-y-4 mb-6">
                        {currentData.length > 0 ? currentData.map((item) => (
                            <div key={item._id} className="p-5 border border-gray-100 rounded-2xl hover:shadow-md transition bg-white space-y-4 hover:border-purple-100">

                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-extrabold text-gray-900 text-xl">{item.amount.toLocaleString('vi-VN')} đ</p>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> {format(new Date(item.createdAt), 'dd/MM/yyyy - HH:mm')}
                                        </p>
                                    </div>
                                    <div>{getStatusBadge(item.status)}</div>
                                </div>

                                {item.paymentInfo && (
                                    <div className="bg-gray-50 p-3.5 rounded-xl flex items-center gap-3 border border-gray-100">
                                        <div className="bg-white p-2.5 rounded-full shadow-sm border border-gray-100">
                                            <Landmark className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{item.paymentInfo.bankName}</p>
                                            <p className="text-xs text-gray-600 font-mono mt-0.5">
                                                {item.paymentInfo.accountNumber} <span className="text-gray-300 mx-1">|</span> <span className="font-bold">{item.paymentInfo.accountName}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {item.status !== 'pending' && item.adminComment && (
                                    <div className={`text-sm px-4 py-3 rounded-xl border ${item.status === 'approved' ? 'bg-green-50/50 text-green-700 border-green-100' : 'bg-red-50/50 text-red-700 border-red-100'}`}>
                                        <strong className="font-bold mr-1">{item.status === 'approved' ? 'Mã Giao Dịch:' : 'Lý do từ chối:'}</strong>
                                        {item.adminComment}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                                <div className="bg-gray-50 p-6 rounded-full mb-4">
                                    <History className="w-12 h-12 opacity-40 text-gray-500" />
                                </div>
                                <p className="font-medium">Chưa có lịch sử giao dịch nào.</p>
                            </div>
                        )}
                    </div>

                    {/* --- ĐIỀU KHIỂN PHÂN TRANG --- */}
                    {totalPages > 0 && (
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 shrink-0">
                            <span className="text-sm text-gray-500">
                                Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, history.length)}</span> trong <span className="font-bold text-gray-900">{history.length}</span> yêu cầu
                            </span>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-1 px-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-9 h-9 rounded-lg font-bold text-sm transition ${currentPage === page
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}