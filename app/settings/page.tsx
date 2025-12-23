'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Lock, AlertTriangle } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Chỉ giữ lại State cho mật khẩu
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    // 1. Validate và mở Modal
    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Mật khẩu mới không khớp!");
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setShowConfirmModal(true);
    };

    // 2. Gọi API Đổi mật khẩu
    const handleConfirmChange = async () => {
        setShowConfirmModal(false);
        setLoading(true);

        try {
            const { data } = await axiosClient.put('/users/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });

            if (data.success) {
                toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

                // Reset form
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

                // Đăng xuất người dùng để bảo mật
                localStorage.removeItem('user');
                localStorage.removeItem('token'); // Nếu bạn lưu token riêng

                // Chuyển hướng về login sau 2s
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi đổi mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 relative">
            <Toaster position='top-right' />

            {/* --- MODAL XÁC NHẬN --- */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="bg-yellow-100 p-4 rounded-full inline-block mb-4">
                            <Lock className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900">Xác nhận đổi mật khẩu?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Bạn sẽ phải đăng nhập lại trên tất cả các thiết bị sau khi thực hiện thay đổi này.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmChange}
                                className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition flex justify-center items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Đồng ý'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt tài khoản</h1>
            <p className="text-gray-500 mb-8">Quản lý mật khẩu và bảo mật cho tài khoản của bạn.</p>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handlePreSubmit} className="max-w-xl">

                        <div className="grid gap-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800 border-b pb-2">
                                <Lock className="w-5 h-5 text-purple-600" /> Đổi mật khẩu
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
                        <div className="flex justify-end pt-8">
                            <button
                                type="submit" disabled={loading}
                                className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 shadow-lg shadow-purple-200"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                Cập nhật mật khẩu
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* Phần Danger Zone (Ví dụ xóa tài khoản - Có thể phát triển sau) */}
            <div className="mt-8 border border-red-200 bg-red-50 rounded-xl p-6 flex justify-between items-center opacity-80 hover:opacity-100 transition">
                <div>
                    <h4 className="text-red-700 font-bold">Xóa tài khoản</h4>
                    <p className="text-red-500 text-sm">Hành động này không thể hoàn tác. Mọi khóa học sẽ bị mất.</p>
                </div>
                <button
                    onClick={() => toast("Tính năng đang phát triển")}
                    className="text-red-600 border border-red-300 bg-white hover:bg-red-50 font-bold py-2 px-4 rounded-lg text-sm transition"
                >
                    Xóa tài khoản
                </button>
            </div>
        </div>
    );
}