// Tệp: app/admin/components/UsersTab.tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, X, Loader2, BookOpen, AlertTriangle, Percent } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast from 'react-hot-toast';
import { IUser } from '@/types';

// Import Component mới tách
import UserCoursesModal from './UserCoursesModal';


export default function UsersTab() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Form State (Thêm/Sửa User)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<IUser | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [submitting, setSubmitting] = useState(false);

    // Modal View Courses State (Rất gọn)
    const [viewCoursesUser, setViewCoursesUser] = useState<any | null>(null);

    // Modal Delete User State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Modal Deal Doanh Thu State
    const [dealModal, setDealModal] = useState<{ isOpen: boolean, user: any | null }>({ isOpen: false, user: null });
    const [commissionRate, setCommissionRate] = useState(30);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await axiosClient.get('/admin/users');
            if (data.success) setUsers(data.data);
        } catch (error) { toast.error("Lỗi tải danh sách người dùng"); }
        finally { setLoading(false); }
    };

    // --- FORM HANDLING ---
    const openForm = (user?: IUser) => {
        setEditingUser(user || null);
        setFormData(user
            ? { name: user.name, email: user.email, password: '', role: user.role }
            : { name: '', email: '', password: '', role: 'student' }
        );
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingUser) {
                const { data } = await axiosClient.put(`/admin/users/${editingUser._id}`, formData);
                if (data.success) {
                    setUsers(users.map(u => u._id === editingUser._id ? data.data : u));
                    toast.success("Cập nhật thành công!");
                }
            } else {
                const { data } = await axiosClient.post('/admin/users', formData);
                if (data.success) {
                    setUsers([data.data, ...users]);
                    toast.success("Thêm mới thành công!");
                }
            }
            setIsFormOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi xử lý");
        } finally { setSubmitting(false); }
    };

    const handleDeleteUser = async () => {
        if (!deleteId) return;
        try {
            await axiosClient.delete(`/admin/users/${deleteId}`);
            setUsers(users.filter(u => u._id !== deleteId));
            toast.success("Đã xóa người dùng");
            setDeleteId(null);
        } catch (error) { toast.error("Lỗi xóa người dùng"); }
    };

    // --- CẬP NHẬT DEAL DOANH THU ---
    const handleUpdateCommission = async () => {
        if (!dealModal.user) return;
        setSubmitting(true);
        try {
            const { data } = await axiosClient.put(`/admin/users/${dealModal.user._id}/commission`, {
                adminCommissionRate: commissionRate
            });
            if (data.success) {
                toast.success("Đã lưu tỉ lệ chia sẻ doanh thu!");
                setUsers(users.map(u => u._id === dealModal.user._id ? { ...u, adminCommissionRate: commissionRate } : u));
                setDealModal({ isOpen: false, user: null });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật Deal");
        } finally {
            setSubmitting(false);
        }
    };

    // --- CẬP NHẬT LẠI DANH SÁCH SAU KHI COMPONENT CON XÓA KHÓA HỌC ---
    const handleUserCoursesUpdated = (userId: string, updatedCourses: any[]) => {
        // Cập nhật lại state của viewCoursesUser để popup hiển thị liền
        setViewCoursesUser((prev: any) => prev ? { ...prev, enrolledCourses: updatedCourses } : null);
        // Cập nhật lại state của users table để đổi số lượng khóa
        setUsers(users.map(u => u._id === userId ? { ...u, enrolledCourses: updatedCourses } : u));
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải danh sách...</div>;

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={() => openForm()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                    <Plus className="w-5 h-5" /> Thêm người dùng
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="p-4">Thành viên</th>
                            <th className="p-4">Vai trò / Deal</th>
                            <th className="p-4">Khóa học</th>
                            <th className="p-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg overflow-hidden">
                                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 flex flex-col items-start gap-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                                        user.role === 'instructor' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                            'bg-green-100 text-green-700 border-green-200'
                                        }`}>
                                        {user.role === 'admin' ? 'Quản trị viên' : user.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                                    </span>

                                    {user.role === 'instructor' && (
                                        <span className="text-xs font-bold text-orange-600 bg-orange-100 border border-orange-200 px-2 py-0.5 mt-1 rounded-md">
                                            Admin thu: {user.adminCommissionRate !== undefined ? user.adminCommissionRate : 30}%
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <button onClick={() => setViewCoursesUser(user)} className="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1 bg-gray-100 hover:bg-blue-50 px-3 py-1 rounded transition">
                                        <BookOpen className="w-4 h-4" /> {user.enrolledCourses?.length || 0} khóa
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {user.role === 'instructor' && (
                                            <button
                                                onClick={() => {
                                                    setDealModal({ isOpen: true, user });
                                                    setCommissionRate(user.adminCommissionRate !== undefined ? user.adminCommissionRate : 30);
                                                }}
                                                className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition"
                                                title="Cài đặt % doanh thu"
                                            >
                                                <Percent className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => openForm(user)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition" title="Sửa">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button onClick={() => setDeleteId(user._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition" title="Xóa">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- COMPONENT TÁCH RỜI QUẢN LÝ KHÓA HỌC (RẤT GỌN) --- */}
            <UserCoursesModal
                user={viewCoursesUser}
                isOpen={viewCoursesUser !== null}
                onClose={() => setViewCoursesUser(null)}
                onUpdateUserCourses={handleUserCoursesUpdated}
            />

            {/* --- MODAL FORM USER --- */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{editingUser ? 'Cập nhật' : 'Thêm mới'}</h3>
                            <button onClick={() => setIsFormOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-black" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Họ tên</label><input type="text" required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Email</label><input type="email" required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                            {!editingUser && (<div><label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label><input type="password" required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>)}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Vai trò</label>
                                <select className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="student">Học viên</option>
                                    <option value="instructor">Giảng viên</option>
                                    <option value="admin">Quản trị viên</option>
                                </select>
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Lưu thông tin
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL DELETE USER --- */}
            {deleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="bg-red-100 p-4 rounded-full inline-block mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                        <h3 className="text-xl font-bold mb-2">Xóa người dùng?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Hành động này không thể hoàn tác.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-gray-100 font-bold rounded-lg hover:bg-gray-200">Hủy</button>
                            <button onClick={handleDeleteUser} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Xóa ngay</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL DEAL DOANH THU --- */}
            {dealModal.isOpen && dealModal.user && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Thỏa thuận doanh thu</h3>
                            <button onClick={() => setDealModal({ isOpen: false, user: null })}><X className="w-5 h-5 text-gray-400 hover:text-black" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Cài đặt tỉ lệ % nền tảng thu của giảng viên <strong className="text-gray-800">{dealModal.user.name}</strong>.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Admin thu (%)</label>
                            <div className="relative">
                                <input type="number" min="0" max="100" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-lg font-bold pr-10" value={commissionRate} onChange={e => setCommissionRate(Number(e.target.value))} />
                                <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
                            </div>
                            <div className="mt-3 flex justify-between text-sm">
                                <span className="text-orange-600 font-bold">Nền tảng: {commissionRate}%</span>
                                <span className="text-green-600 font-bold">Giảng viên: {100 - commissionRate}%</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDealModal({ isOpen: false, user: null })} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-lg hover:bg-gray-200 text-gray-700">Hủy</button>
                            <button onClick={handleUpdateCommission} disabled={submitting} className="flex-1 py-2.5 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 flex justify-center items-center gap-2">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu tỉ lệ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}