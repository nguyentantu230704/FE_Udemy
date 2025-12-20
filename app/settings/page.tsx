'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Camera, Save, Lock, User as UserIcon } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { IUser } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(false);

    // State Form
    const [name, setName] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State Avatar
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setName(parsedUser.name);
        setPreviewUrl(parsedUser.avatar || '');
    }, []);

    // Xử lý chọn ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Xử lý Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate: Mật khẩu mới không khớp
        if (newPassword && newPassword !== confirmPassword) {
            toast.error("Mật khẩu mới nhập lại không khớp!");
            return;
        }

        // Validate: Đổi mật khẩu thì BẮT BUỘC phải nhập mật khẩu cũ
        if (newPassword && !currentPassword) {
            toast.error("Vui lòng nhập mật khẩu hiện tại để xác thực!");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);

        // Chỉ gửi dữ liệu password khi người dùng nhập mật khẩu mới
        if (newPassword) {
            formData.append('newPassword', newPassword);
            formData.append('currentPassword', currentPassword);
        }

        if (avatarFile) formData.append('avatar', avatarFile);

        try {
            const { data } = await axiosClient.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                // --- LOGIC MỚI: XỬ LÝ KHI CÓ ĐỔI MẬT KHẨU ---
                if (newPassword) {
                    toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

                    // 1. Xóa thông tin đăng nhập cũ
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');

                    // (Tùy chọn) Gửi sự kiện để các component khác (như Header) biết là storage đã thay đổi
                    window.dispatchEvent(new Event("storage"));

                    // 2. Chuyển hướng BẰNG CÁCH RELOAD TRANG
                    // Thay vì dùng router.push, ta dùng window.location.href để ép tải lại từ đầu
                    // Điều này đảm bảo mọi State đăng nhập trong React đều bị xóa sạch
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);

                } else {
                    // --- LOGIC CŨ: KHI CHỈ ĐỔI TÊN / AVATAR ---
                    toast.success("Cập nhật thành công!");

                    const newUser = { ...user, ...data.data };
                    if (!data.data.token && user?.token) newUser.token = user.token;

                    localStorage.setItem('user', JSON.stringify(newUser));
                    setUser(newUser);

                    // Reset các trường mật khẩu (để form sạch sẽ)
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');

                    // Reload trang sau 1s để Header cập nhật avatar
                    setTimeout(() => window.location.reload(), 1000);
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <Toaster />
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Cài đặt tài khoản</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header Tabs (Giả lập) */}
                    <div className="flex border-b border-gray-200">
                        <button className="px-6 py-4 text-sm font-bold text-purple-600 border-b-2 border-purple-600 bg-purple-50">
                            Hồ sơ & Bảo mật
                        </button>
                        <button className="px-6 py-4 text-sm font-bold text-gray-500 hover:text-gray-700">
                            Thanh toán (Coming soon)
                        </button>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* 1. ĐỔI AVATAR */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center text-4xl font-bold">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    {/* Overlay Camera Icon */}
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">Nhấn vào ảnh để thay đổi</p>
                                <input
                                    type="file" ref={fileInputRef} hidden accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <hr />

                            {/* 2. THÔNG TIN CƠ BẢN */}
                            <div className="grid gap-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <UserIcon className="w-5 h-5" /> Thông tin cơ bản
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email" value={user.email} disabled
                                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input
                                        type="text" required
                                        value={name} onChange={e => setName(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <hr />

                            {/* 3. ĐỔI MẬT KHẨU */}
                            <div className="grid gap-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Lock className="w-5 h-5" /> Đổi mật khẩu
                                </h3>
                                <p className="text-xs text-gray-500 -mt-4">Để trống nếu không muốn thay đổi</p>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        placeholder="Nhập mật khẩu cũ để xác thực"
                                        value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu mới</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit" disabled={loading}
                                    className="bg-gray-900 text-white font-bold py-3 px-8 rounded-md hover:bg-gray-800 transition flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                    Lưu thay đổi
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}