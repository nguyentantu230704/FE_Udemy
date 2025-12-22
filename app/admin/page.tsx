'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, BookOpen, Trash2, Loader2,
    DollarSign, LogOut, AlertTriangle, X, Plus, Edit,
    List, Tag, XCircle
} from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';
import { IUser, ICategory } from '@/types';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalRevenue: 0 });
    const [users, setUsers] = useState<IUser[]>([]);

    // Category States
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<ICategory | null>(null);
    const [catFormData, setCatFormData] = useState({ name: '' });

    // User Course Management States
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [selectedUserForCourses, setSelectedUserForCourses] = useState<IUser | null>(null);
    const [removingCourse, setRemovingCourse] = useState(false);

    // --- STATE MỚI: CONFIRM DELETE COURSE MODAL ---
    // Lưu ID khóa học đang chờ xóa để hiển thị modal xác nhận
    const [courseToDeleteId, setCourseToDeleteId] = useState<string | null>(null);
    // ---------------------------------------------

    // General Delete Modal State (User/Category)
    const [showDeleteModal, setShowDeleteModal] = useState<{ type: 'user' | 'category', id: string, name: string } | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // User Form States
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<IUser | null>(null);
    const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [submitting, setSubmitting] = useState(false);

    // 1. Init
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

    // 2. Load Data on Tab Change
    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'categories') fetchCategories();
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const { data } = await axiosClient.get('/admin/users');
            if (data.success) setUsers(data.data);
        } catch (error) { toast.error("Lỗi tải người dùng"); }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await axiosClient.get('/admin/categories');
            if (data.success) setCategories(data.data);
        } catch (error) { toast.error("Lỗi tải danh mục"); }
    };

    // --- LOGIC USER FORM ---
    const openUserModal = (user: IUser | null = null) => {
        setEditingUser(user);
        setUserFormData(user ? { name: user.name, email: user.email, password: '', role: user.role } : { name: '', email: '', password: '', role: 'student' });
        setIsUserFormOpen(true);
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingUser) {
                const { data } = await axiosClient.put(`/admin/users/${editingUser._id}`, { ...userFormData });
                if (data.success) {
                    toast.success("Cập nhật User thành công!");
                    setUsers(users.map(u => u._id === editingUser._id ? data.data : u));
                }
            } else {
                const { data } = await axiosClient.post('/admin/users', userFormData);
                if (data.success) {
                    toast.success("Tạo User mới thành công!");
                    setUsers([data.data, ...users]);
                }
            }
            setIsUserFormOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi xử lý User");
        } finally { setSubmitting(false); }
    };

    // --- LOGIC CATEGORY FORM ---
    const openCatModal = (cat: ICategory | null = null) => {
        setEditingCat(cat);
        setCatFormData({ name: cat ? cat.name : '' });
        setIsCatModalOpen(true);
    };

    const handleCatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!catFormData.name.trim()) return;
        setSubmitting(true);
        try {
            if (editingCat) {
                const { data } = await axiosClient.put(`/admin/categories/${editingCat._id}`, catFormData);
                if (data.success) {
                    toast.success("Cập nhật danh mục thành công!");
                    setCategories(categories.map(c => c._id === editingCat._id ? data.data : c));
                }
            } else {
                const { data } = await axiosClient.post('/admin/categories', catFormData);
                if (data.success) {
                    toast.success("Tạo danh mục mới thành công!");
                    setCategories([data.data, ...categories]);
                }
            }
            setIsCatModalOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi xử lý danh mục");
        } finally { setSubmitting(false); }
    };

    // --- LOGIC DELETE USER/CATEGORY ---
    const confirmDelete = async () => {
        if (!showDeleteModal) return;
        setDeletingId(showDeleteModal.id);
        try {
            if (showDeleteModal.type === 'user') {
                await axiosClient.delete(`/admin/users/${showDeleteModal.id}`);
                setUsers(users.filter(u => u._id !== showDeleteModal.id));
                toast.success("Đã xóa người dùng!");
            } else {
                await axiosClient.delete(`/admin/categories/${showDeleteModal.id}`);
                setCategories(categories.filter(c => c._id !== showDeleteModal.id));
                toast.success("Đã xóa danh mục!");
            }
            setShowDeleteModal(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa");
        } finally { setDeletingId(null); }
    };

    // --- LOGIC GỠ KHÓA HỌC KHỎI USER ---
    const openUserCourses = (user: IUser) => {
        setSelectedUserForCourses(user);
        setIsCourseModalOpen(true);
    };

    // Hàm 1: Chỉ mở Modal xác nhận
    const clickRemoveCourse = (courseId: string) => {
        setCourseToDeleteId(courseId);
    };

    // Hàm 2: Thực hiện xóa thật (Gọi khi bấm nút Confirm trong Modal)
    const executeRemoveCourse = async () => {
        if (!selectedUserForCourses || !courseToDeleteId) return;

        setRemovingCourse(true);
        try {
            const { data } = await axiosClient.delete(`/admin/users/${selectedUserForCourses._id}/courses/${courseToDeleteId}`);
            if (data.success) {
                toast.success("Đã gỡ khóa học!");

                // Update UI Local
                const updatedEnrolled = (selectedUserForCourses.enrolledCourses as any[]).filter(
                    (c: any) => c._id !== courseToDeleteId
                );

                const updatedUser = { ...selectedUserForCourses, enrolledCourses: updatedEnrolled };
                setSelectedUserForCourses(updatedUser);
                setUsers(users.map(u => u._id === selectedUserForCourses._id ? updatedUser : u));

                // Đóng Modal xác nhận
                setCourseToDeleteId(null);
            }
        } catch (error: any) {
            toast.error("Lỗi khi gỡ khóa học");
        } finally {
            setRemovingCourse(false);
        }
    };
    // ------------------------------------

    if (loading) return <div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans relative">
            <Toaster position="top-right" />

            {/* --- MODAL 1: XÁC NHẬN XÓA USER/CATEGORY --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="bg-red-100 p-4 rounded-full inline-block mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                        <h3 className="text-xl font-bold mb-2">Xác nhận xóa?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Bạn có chắc muốn xóa {showDeleteModal.type === 'user' ? 'người dùng' : 'danh mục'} <b>{showDeleteModal.name}</b>?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl hover:bg-gray-200">Hủy</button>
                            <button onClick={confirmDelete} disabled={!!deletingId} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 flex justify-center items-center gap-2">
                                {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: XÁC NHẬN GỠ KHÓA HỌC (MỚI) --- */}
            {/* z-index cao hơn Modal Danh sách khóa học (z-50) */}
            {courseToDeleteId && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 transition-all">
                        <div className="bg-orange-100 p-4 rounded-full inline-block mb-4">
                            <BookOpen className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Gỡ khóa học?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Học viên sẽ mất quyền truy cập vào khóa học này. Bạn có chắc chắn không?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCourseToDeleteId(null)}
                                className="flex-1 py-3 bg-gray-100 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={executeRemoveCourse}
                                disabled={removingCourse}
                                className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 flex justify-center items-center gap-2 transition"
                            >
                                {removingCourse ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gỡ bỏ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ------------------------------------------- */}

            {/* --- MODAL FORM USER --- */}
            {isUserFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{editingUser ? 'Sửa User' : 'Thêm User'}</h3>
                            <button onClick={() => setIsUserFormOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-black" /></button>
                        </div>
                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div><label className="block font-bold text-sm mb-1">Họ tên</label><input type="text" required className="w-full p-2 border rounded" value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} /></div>
                            <div><label className="block font-bold text-sm mb-1">Email</label><input type="email" required className="w-full p-2 border rounded" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} /></div>
                            {!editingUser && <div><label className="block font-bold text-sm mb-1">Mật khẩu</label><input type="password" required className="w-full p-2 border rounded" value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} /></div>}
                            <div>
                                <label className="block font-bold text-sm mb-1">Vai trò</label>
                                <select className="w-full p-2 border rounded bg-white" value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}>
                                    <option value="student">Student</option>
                                    <option value="instructor">Instructor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 flex justify-center gap-2">{submitting && <Loader2 className="w-4 h-4 animate-spin" />} Lưu</button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL FORM CATEGORY --- */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{editingCat ? 'Sửa Danh mục' : 'Thêm Danh mục'}</h3>
                            <button onClick={() => setIsCatModalOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-black" /></button>
                        </div>
                        <form onSubmit={handleCatSubmit} className="space-y-4">
                            <div>
                                <label className="block font-bold text-sm mb-1">Tên danh mục</label>
                                <input type="text" required autoFocus className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" placeholder="Ví dụ: Lập trình Web" value={catFormData.name} onChange={e => setCatFormData({ name: e.target.value })} />
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 flex justify-center gap-2">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Lưu Danh mục
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL DANH SÁCH KHÓA HỌC CỦA USER --- */}
            {isCourseModalOpen && selectedUserForCourses && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Khóa học đã mua</h3>
                                <p className="text-sm text-gray-500">Học viên: {selectedUserForCourses.name}</p>
                            </div>
                            <button onClick={() => setIsCourseModalOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-black" /></button>
                        </div>

                        <div className="overflow-y-auto flex-1 pr-2">
                            {selectedUserForCourses.enrolledCourses && selectedUserForCourses.enrolledCourses.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedUserForCourses.enrolledCourses.map((c: any) => (
                                        <div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <img src={c.thumbnail?.url || 'https://via.placeholder.com/150'} alt="" className="w-12 h-12 rounded object-cover" />
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 line-clamp-1">{c.title}</p>
                                                    <p className="text-xs text-gray-500">{c.price === 0 ? 'Free' : c.price?.toLocaleString() + 'đ'}</p>
                                                </div>
                                            </div>

                                            {/* Nút này bây giờ chỉ mở Modal xác nhận, không xóa ngay */}
                                            <button
                                                onClick={() => clickRemoveCourse(c._id)}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                                                title="Gỡ khóa học"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                                    <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                                    <p>Người dùng này chưa mua khóa học nào.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-800"><h1 className="text-2xl font-bold text-blue-400">Admin Panel</h1></div>
                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem icon={<LayoutDashboard />} label="Tổng quan" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem icon={<Users />} label="Người dùng" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <SidebarItem icon={<List />} label="Danh mục" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
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
                            <button onClick={() => openUserModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200">
                                <Plus className="w-5 h-5" /> Thêm người dùng
                            </button>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4">Thông tin</th>
                                        <th className="p-4">Khóa học</th>
                                        <th className="p-4">Vai trò</th>
                                        <th className="p-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-all">
                                            <td className="p-4 font-semibold text-gray-900">
                                                <div>{user.name}</div>
                                                <div className="text-xs text-gray-500 font-normal">{user.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => openUserCourses(user)}
                                                    className="flex items-center gap-1 text-sm font-bold text-purple-600 hover:underline hover:bg-purple-50 px-2 py-1 rounded"
                                                >
                                                    <BookOpen className="w-4 h-4" />
                                                    {user.enrolledCourses?.length || 0} khóa
                                                </button>
                                            </td>
                                            <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' : user.role === 'instructor' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-green-100 text-green-700 border-green-200'}`}>{user.role.toUpperCase()}</span></td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={() => openUserModal(user)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"><Edit className="w-5 h-5" /></button>
                                                {user.role !== 'admin' && <button onClick={() => setShowDeleteModal({ type: 'user', id: user._id, name: user.name })} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full"><Trash2 className="w-5 h-5" /></button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && <p className="p-10 text-center text-gray-400">Chưa có người dùng nào.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h2>
                            <button onClick={() => openCatModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200">
                                <Plus className="w-5 h-5" /> Thêm danh mục
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((cat) => (
                                <div key={cat._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 p-2 rounded-lg"><Tag className="w-5 h-5 text-purple-600" /></div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{cat.name}</h4>
                                            <p className="text-xs text-gray-500">Slug: {cat.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openCatModal(cat)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => setShowDeleteModal({ type: 'category', id: cat._id, name: cat.name })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {categories.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Chưa có danh mục nào.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }: any) {
    return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${active ? 'bg-blue-600 text-white shadow-lg translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>{icon} <span>{label}</span></button>
}
function StatCard({ title, value, icon, color }: any) {
    return <div className={`p-6 rounded-xl border ${color} shadow-sm flex items-center justify-between bg-white`}><div><p className="text-sm font-bold text-gray-500 mb-1 uppercase">{title}</p><p className="text-3xl font-extrabold text-gray-900">{value}</p></div><div className="bg-white p-4 rounded-full shadow-sm border border-gray-100">{icon}</div></div>
}