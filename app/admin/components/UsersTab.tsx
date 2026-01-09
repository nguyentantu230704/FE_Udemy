'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, X, Loader2, BookOpen, AlertTriangle, MinusCircle } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast from 'react-hot-toast';
import { IUser } from '@/types';

export default function UsersTab() {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<IUser | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [submitting, setSubmitting] = useState(false);

    // Modal Course State
    const [viewCoursesUser, setViewCoursesUser] = useState<IUser | null>(null);
    const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);

    // State xác nhận gỡ khóa học
    const [verifyCourseId, setVerifyCourseId] = useState<string | null>(null);

    // Modal Delete User State
    const [deleteId, setDeleteId] = useState<string | null>(null);

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

    // --- REMOVE COURSE HANDLING ---
    const confirmRemoveCourse = (courseId: string) => {
        setVerifyCourseId(courseId);
    };

    const executeRemoveCourse = async () => {
        if (!viewCoursesUser || !verifyCourseId) return;

        setRemovingCourseId(verifyCourseId);
        try {
            await axiosClient.delete(`/admin/users/${viewCoursesUser._id}/courses/${verifyCourseId}`);
            toast.success("Đã gỡ khóa học thành công");

            const updatedCourses = viewCoursesUser.enrolledCourses?.filter((c: any) => c._id !== verifyCourseId) || [];
            const updatedUser = { ...viewCoursesUser, enrolledCourses: updatedCourses };
            setViewCoursesUser(updatedUser);
            setUsers(users.map(u => u._id === viewCoursesUser._id ? updatedUser : u));

        } catch (error) {
            toast.error("Lỗi gỡ khóa học");
        } finally {
            setRemovingCourseId(null);
            setVerifyCourseId(null);
        }
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
                            <th className="p-4">Vai trò</th>
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
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                                            user.role === 'instructor' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                'bg-green-100 text-green-700 border-green-200'
                                        }`}>
                                        {user.role === 'admin' ? 'Quản trị viên' : user.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => setViewCoursesUser(user)} className="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1 bg-gray-100 hover:bg-blue-50 px-3 py-1 rounded transition">
                                        <BookOpen className="w-4 h-4" /> {user.enrolledCourses?.length || 0} khóa
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
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

            {/* --- MODAL FORM USER --- */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{editingUser ? 'Cập nhật' : 'Thêm mới'}</h3>
                            <button onClick={() => setIsFormOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-black" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Họ tên</label>
                                <input type="text" required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input type="email" required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label>
                                    <input type="password" required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Vai trò</label>
                                <select className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="student">Học viên (Student)</option>
                                    <option value="instructor">Giảng viên (Instructor)</option>
                                    <option value="admin">Quản trị viên (Admin)</option>
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

            {/* --- MODAL VIEW COURSES --- */}
            {viewCoursesUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[80vh] overflow-hidden flex flex-col relative">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                            <h3 className="font-bold text-lg">Khóa học của {viewCoursesUser.name}</h3>
                            <button onClick={() => setViewCoursesUser(null)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {viewCoursesUser.enrolledCourses && viewCoursesUser.enrolledCourses.length > 0 ? (
                                <ul className="space-y-2">
                                    {viewCoursesUser.enrolledCourses.map((c: any) => (
                                        <li key={c._id} className="p-3 bg-gray-50 rounded border flex justify-between items-center gap-3 group hover:bg-blue-50 transition">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 bg-gray-200 rounded shrink-0 overflow-hidden">
                                                    <img src={c.thumbnail?.url || '/placeholder.jpg'} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-sm font-medium line-clamp-1">{c.title}</span>
                                            </div>

                                            <button
                                                onClick={() => confirmRemoveCourse(c._id)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                                                title="Gỡ học viên khỏi khóa này"
                                            >
                                                <MinusCircle className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-center text-gray-500 py-4">Chưa đăng ký khóa học nào.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* --- SỬA Ở ĐÂY: MODAL XÁC NHẬN GỠ KHÓA HỌC (ĐƯA RA NGOÀI CÙNG) --- */}
            {/* Sử dụng fixed inset-0 để phủ toàn màn hình và z-index cao hơn modal cha */}
            {verifyCourseId && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 transition-all">
                        <div className="bg-orange-100 p-4 rounded-full inline-block mb-4">
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900">Xác nhận gỡ khóa học?</h3>
                        <p className="text-gray-500 mb-6 text-sm px-2">
                            Học viên sẽ mất quyền truy cập và toàn bộ tiến độ học tập trong khóa học này.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setVerifyCourseId(null)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={executeRemoveCourse}
                                disabled={removingCourseId !== null}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
                            >
                                {removingCourseId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gỡ ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ------------------------------------------------------------------ */}
        </div>
    );
}