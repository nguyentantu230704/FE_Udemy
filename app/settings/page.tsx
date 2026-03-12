'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Lock, MailCheck, ShieldAlert } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Quản lý các bước: 1 = Nhập pass, 2 = Nhập OTP
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    // BƯỚC 1: Validate và Gửi yêu cầu lấy mã OTP
    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Mật khẩu mới không khớp!");
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setLoading(true);
        try {
            // Gọi API kiểm tra pass cũ và gửi OTP về Mailtrap
            const { data } = await axiosClient.post('/users/request-change-password', {
                currentPassword: passwords.currentPassword
            });

            if (data.success) {
                toast.success("Mã OTP đã được gửi đến email của bạn!");
                setStep(2); // Chuyển sang giao diện nhập OTP
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Mật khẩu hiện tại không đúng!");
        } finally {
            setLoading(false);
        }
    };

    // BƯỚC 2: Gửi mã OTP và Mật khẩu mới để xác nhận đổi
    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            toast.error("Vui lòng nhập đủ 6 số OTP");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axiosClient.put('/users/verify-change-password', {
                otp,
                newPassword: passwords.newPassword
            });

            if (data.success) {
                toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
                setStep(1);
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setOtp('');

                // Đăng xuất người dùng để bảo mật
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('token');

                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 relative">
            <Toaster position='top-right' />

            {/* --- MODAL NHẬP MÃ OTP --- */}
            {step === 2 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>

                        <div className="bg-purple-100 p-4 rounded-full inline-block mb-4 shadow-inner">
                            <MailCheck className="w-10 h-10 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-gray-900">Xác thực Email</h3>
                        <p className="text-gray-500 mb-6 text-sm px-4">
                            Chúng tôi vừa gửi một mã OTP gồm 6 số đến email của bạn. Vui lòng kiểm tra hộp thư Mailtrap.
                        </p>

                        <div className="mb-6">
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="• • • • • •"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Chỉ cho nhập số
                                className="w-full text-center text-3xl tracking-[0.5em] font-bold text-gray-800 p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition placeholder:text-gray-300 placeholder:tracking-normal"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setStep(1); setOtp(''); }}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleVerifyOTP}
                                disabled={otp.length !== 6 || loading}
                                className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Xác nhận OTP'}
                            </button>
                        </div>

                        <button
                            onClick={() => window.open('https://mailtrap.io/inboxes', '_blank')}
                            className="mt-6 text-sm font-bold text-purple-600 hover:text-purple-800 underline underline-offset-4"
                        >
                            Mở Mailtrap kiểm tra
                        </button>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt tài khoản</h1>
            <p className="text-gray-500 mb-8">Quản lý mật khẩu và bảo mật cho tài khoản của bạn.</p>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleRequestOTP} className="max-w-xl">

                        <div className="grid gap-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800 border-b pb-2">
                                <ShieldAlert className="w-5 h-5 text-purple-600" /> Đổi mật khẩu an toàn (2FA)
                            </h3>

                            {/* Mật khẩu cũ */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    required
                                    placeholder="Nhập mật khẩu cũ để xác thực"
                                    value={passwords.currentPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
                                />
                            </div>

                            {/* Mật khẩu mới */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        required
                                        placeholder="Tối thiểu 6 ký tự"
                                        value={passwords.newPassword}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nhập lại mật khẩu mới</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        placeholder="Xác nhận lại"
                                        value={passwords.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        {/* Submit Button */}
                        <div className="pt-8">
                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                Lưu & Nhận mã OTP
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}