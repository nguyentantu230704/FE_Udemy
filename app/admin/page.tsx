'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, BookOpen, Trash2, Loader2,
    DollarSign, LogOut, AlertTriangle, X, Plus, Edit, Check
} from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';
import { IUser } from '@/types';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalRevenue: 0 });
    const [users, setUsers] = useState<IUser[]>([]);

    // --- STATES CHO MODAL ---
    const [showDeleteModal, setShowDeleteModal] = useState<IUser | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    // State cho Modal THÊM/SỬA
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<IUser | null>(null); // Nếu null => Đang Thêm, Có data => Đang Sửa
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'student'
    });
    const [submitting, setSubmitting] = useState(false);

    // 1. Load Data
    useEffect(() => {
        const checkAdminAndFetch = async () => {
            try {
                const { data } = await axiosClient.get('/admin/stats');
                if (data.success) setStats(data.data);
            } catch (error: any) {
                if (error.response && error.response.status === 403) {
                    toast.error("Bạn không có quyền truy cập trang này!");
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };
        checkAdminAndFetch();
    }, []);

    // 2. Load Users
    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const { data } = await axiosClient.get('/admin/users');
            if (data.success) setUsers(data.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách người dùng");
        }
    };

    // --- LOGIC FORM: MỞ MODAL THÊM ---
    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'student' });
        setIsFormOpen(true);
    };

    // --- LOGIC FORM: MỞ MODAL SỬA ---
    const openEditModal = (user: IUser) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Không hiện password cũ
            role: user.role
        });
        setIsFormOpen(true);
    };

    // --- LOGIC FORM: SUBMIT (THÊM HOẶC SỬA) ---
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingUser) {
                // --- UPDATE USER ---
                const { data } = await axiosClient.put(`/admin/users/${editingUser._id}`, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                    // Không gửi password nếu admin không nhập (để giữ pass cũ)
                });
                if (data.success) {
                    toast.success("Cập nhật thành công!");
                    setUsers(users.map(u => u._id === editingUser._id ? data.data : u));
                }
            } else {
                // --- CREATE USER ---
                const { data } = await axiosClient.post('/admin/users', formData);
                if (data.success) {
                    toast.success("Tạo người dùng mới thành công!");
                    setUsers([data.data, ...users]); // Thêm vào đầu danh sách
                }
            }
            setIsFormOpen(false); // Đóng modal
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    };

    // --- LOGIC XÓA (GIỮ NGUYÊN CODE CŨ) ---
    const handleDeleteUser = async () => {
        if (!showDeleteModal) return;
        const userId = showDeleteModal._id;
        setShowDeleteModal(null);
        setDeletingUserId(userId);

        await toast.promise(
            axiosClient.delete(`/admin/users/${userId}`),
            {
                loading: 'Đang xóa user...',
                success: () => {
                    setUsers((prev) => prev.filter((u) => u._id !== userId));
                    setDeletingUserId(null);
                    return 'Đã xóa thành công!';
                },
                error: () => {
                    setDeletingUserId(null);
                    return 'Lỗi khi xóa user';
                }
            }
        );
    };

    if (loading) return <div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans relative">
            <Toaster position="top-right" />

            {/* --- MODAL THÊM / SỬA USER --- */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingUser ? 'Cấp quyền / Sửa thông tin' : 'Thêm người dùng mới'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Họ tên</label>
                                <input
                                    type="text" required
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input
                                    type="email" required
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {!editingUser && ( // Chỉ hiện password khi tạo mới
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label>
                                    <input
                                        type="password" required
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Vai trò (Role)</label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="student">Học viên (Student)</option>
                                    <option value="instructor">Giảng viên (Instructor)</option>
                                    <option value="admin">Quản trị viên (Admin)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded font-bold hover:bg-gray-200">Hủy</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
                                    {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                                    {editingUser ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL XÓA (Code cũ) --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="bg-red-100 p-4 rounded-full inline-block mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                        <h3 className="text-xl font-bold mb-2">Xóa người dùng?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Bạn có chắc muốn xóa <b>{showDeleteModal.name}</b>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl hover:bg-gray-200">Hủy</button>
                            <button onClick={handleDeleteUser} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">Xóa ngay</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar (Giữ nguyên) */}
            <div className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-800"><h1 className="text-2xl font-bold text-blue-400">Admin Panel</h1></div>
                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem icon={<LayoutDashboard />} label="Tổng quan" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem icon={<Users />} label="Người dùng" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition"><LogOut className="w-5 h-5" /> Về trang chủ</button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'dashboard' && (
                    <div className="animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan hệ thống</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Tổng người dùng" value={stats.totalUsers} icon={<Users className="w-8 h-8 text-blue-600" />} color="bg-blue-50 border-blue-200" />
                            <StatCard title="Tổng khóa học" value={stats.totalCourses} icon={<BookOpen className="w-8 h-8 text-purple-600" />} color="bg-purple-50 border-purple-200" />
                            <StatCard title="Doanh thu ước tính" value={`${stats.totalRevenue.toLocaleString()} đ`} icon={<DollarSign className="w-8 h-8 text-green-600" />} color="bg-green-50 border-green-200" />
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
                            <button
                                onClick={openAddModal}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                            >
                                <Plus className="w-5 h-5" /> Thêm người dùng
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4">Thông tin</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Vai trò</th>
                                        <th className="p-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user._id} className={`hover:bg-gray-50 transition-all ${deletingUserId === user._id ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
                                                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{user.name.charAt(0)}</div>}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        user.role === 'instructor' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                            'bg-green-100 text-green-700 border-green-200'
                                                    }`}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                {/* Nút Sửa */}
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition duration-200"
                                                    title="Sửa / Cấp quyền"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>

                                                {/* Nút Xóa */}
                                                {user.role !== 'admin' && (
                                                    <button onClick={() => setShowDeleteModal(user)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition duration-200">
                                                        {deletingUserId === user._id ? <Loader2 className="w-5 h-5 animate-spin text-red-500" /> : <Trash2 className="w-5 h-5" />}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && <p className="p-10 text-center text-gray-400">Chưa có người dùng nào.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Components phụ (Giữ nguyên)
function SidebarItem({ icon, label, active, onClick }: any) {
    return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${active ? 'bg-blue-600 text-white shadow-lg translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>{icon} <span>{label}</span></button>
}
function StatCard({ title, value, icon, color }: any) {
    return <div className={`p-6 rounded-xl border ${color} shadow-sm flex items-center justify-between bg-white`}><div><p className="text-sm font-bold text-gray-500 mb-1 uppercase">{title}</p><p className="text-3xl font-extrabold text-gray-900">{value}</p></div><div className="bg-white p-4 rounded-full shadow-sm border border-gray-100">{icon}</div></div>
}