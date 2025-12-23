'use client';

import { useState, useEffect, useRef } from 'react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';
import {
    Loader2, Save, User, FileText, Camera,
    Image as ImageIcon, UploadCloud, AlertTriangle, X
} from 'lucide-react';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // State cho Modal xác nhận
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // State form
    const [formData, setFormData] = useState({
        name: '',
        avatar: '',
        headline: '',
        bio: ''
    });

    // State xử lý ảnh
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // 1. Load dữ liệu ban đầu (Hiển thị avatar hiện tại)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axiosClient.get('/users/profile');
                if (data.success) {
                    const u = data.data;
                    setFormData({
                        name: u.name || '',
                        avatar: u.avatar || '', // Link ảnh từ DB
                        headline: u.headline || '',
                        bio: u.bio || ''
                    });
                }
            } catch (error) {
                toast.error("Lỗi tải thông tin");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File quá lớn (Max 5MB)");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 2. Mở Modal khi bấm Lưu
    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    // 3. Hàm thực thi lưu (Gọi khi bấm Đồng ý trong Modal)
    const handleConfirmUpdate = async () => {
        setShowConfirmModal(false); // Đóng modal
        setUpdating(true);

        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('headline', formData.headline);
            payload.append('bio', formData.bio);

            if (selectedFile) {
                payload.append('avatar', selectedFile);
            } else if (formData.avatar && typeof formData.avatar === 'string') {
                payload.append('avatar', formData.avatar);
            }

            const { data } = await axiosClient.put('/users/profile', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.success) {
                toast.success("Cập nhật hồ sơ thành công!");

                // Cập nhật LocalStorage
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const newUser = {
                    ...currentUser,
                    name: data.data.name,
                    avatar: data.data.avatar,
                    headline: data.data.headline
                };
                localStorage.setItem('user', JSON.stringify(newUser));

                // --- LOGIC RESET SAU KHI LƯU ---
                // 1. Cập nhật lại form với dữ liệu mới nhất từ server
                setFormData(prev => ({
                    ...prev,
                    avatar: data.data.avatar
                }));

                // 2. Xóa file đã chọn và preview (để hiển thị avatar mới từ formData)
                setPreviewUrl('');
                setSelectedFile(null);

                // 3. Reset input file (để chọn lại được cùng 1 file nếu muốn)
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                // Update Header
                window.dispatchEvent(new Event('userUpdated'));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-600 w-10 h-10" /></div>;

    // Logic hiển thị ảnh: Ưu tiên Preview (vừa chọn) > Avatar từ Form (DB) > Placeholder
    const displayAvatar = previewUrl || formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 relative">
            <Toaster position='top-right' />

            {/* --- MODAL XÁC NHẬN --- */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="bg-purple-100 p-4 rounded-full inline-block mb-4">
                            <Save className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900">Lưu thay đổi?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Thông tin hồ sơ của bạn sẽ được cập nhật công khai.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmUpdate}
                                className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition flex justify-center items-center gap-2"
                            >
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ---------------------- */}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ công khai</h1>
            <p className="text-gray-500 mb-8">Thêm thông tin về bản thân để giảng viên và học viên khác hiểu rõ hơn về bạn.</p>

            <div className="flex flex-col md:flex-row gap-8">

                {/* CỘT TRÁI: AVATAR */}
                <div className="md:w-1/3 flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-md mb-4 bg-gray-100">
                            <img
                                src={displayAvatar}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Overlay Camera */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white flex-col gap-2"
                        >
                            <Camera className="w-8 h-8" />
                            <span className="text-xs font-bold">Thay đổi</span>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-purple-600 font-bold hover:underline flex items-center gap-2 mt-2"
                    >
                        <UploadCloud className="w-4 h-4" /> Tải ảnh từ máy tính
                    </button>
                </div>

                {/* CỘT PHẢI: FORM */}
                <div className="md:w-2/3">
                    <form onSubmit={handlePreSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">

                        {/* Tên */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                            <div className="relative">
                                <User className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Headline */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Chức danh / Headline</label>
                            <input
                                type="text"
                                value={formData.headline}
                                onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                placeholder="Ví dụ: Fullstack Developer tại Google"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        {/* Link Avatar (Fallback) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Link ảnh (Tùy chọn)</label>
                            <div className="relative">
                                <ImageIcon className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.avatar}
                                    onChange={e => {
                                        setFormData({ ...formData, avatar: e.target.value });
                                        setSelectedFile(null);
                                        setPreviewUrl('');
                                    }}
                                    placeholder="https://..."
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Giới thiệu bản thân (Bio)</label>
                            <div className="relative">
                                <FileText className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    rows={5}
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Chia sẻ kinh nghiệm của bạn..."
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <button
                                type="submit"
                                disabled={updating}
                                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-2 shadow-lg shadow-purple-200"
                            >
                                {updating ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                Lưu hồ sơ
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}