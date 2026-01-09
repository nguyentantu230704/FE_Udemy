'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag, Loader2, X, AlertTriangle } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast from 'react-hot-toast';
import { ICategory } from '@/types';

export default function CategoriesTab() {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<ICategory | null>(null);
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await axiosClient.get('/admin/categories');
            if (data.success) setCategories(data.data);
        } catch (error) { toast.error("Lỗi tải danh mục"); }
        finally { setLoading(false); }
    };

    const openModal = (cat?: ICategory) => {
        setEditingCat(cat || null);
        setName(cat ? cat.name : '');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            if (editingCat) {
                const { data } = await axiosClient.put(`/admin/categories/${editingCat._id}`, { name });
                if (data.success) {
                    setCategories(categories.map(c => c._id === editingCat._id ? data.data : c));
                    toast.success("Đã cập nhật!");
                }
            } else {
                const { data } = await axiosClient.post('/admin/categories', { name });
                if (data.success) {
                    setCategories([data.data, ...categories]);
                    toast.success("Đã thêm mới!");
                }
            }
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi xử lý");
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axiosClient.delete(`/admin/categories/${deleteId}`);
            setCategories(categories.filter(c => c._id !== deleteId));
            toast.success("Đã xóa danh mục");
            setDeleteId(null);
        } catch (error) { toast.error("Lỗi xóa"); }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải danh mục...</div>;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h2>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                    <Plus className="w-5 h-5" /> Thêm danh mục
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <div key={cat._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex justify-between items-center group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                                <Tag className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-gray-900 truncate">{cat.name}</h4>
                                <p className="text-xs text-gray-400 font-mono truncate">/{cat.slug}</p>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal(cat)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(cat._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                                <Trash2 className="w-4 h-4" />
                            </button>
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

            {/* --- MODAL FORM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{editingCat ? 'Sửa Danh mục' : 'Thêm Danh mục'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-black" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-bold text-sm mb-1 text-gray-700">Tên danh mục</label>
                                <input type="text" required autoFocus className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Lập trình Web" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Lưu lại
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL DELETE --- */}
            {deleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="bg-red-100 p-4 rounded-full inline-block mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                        <h3 className="text-xl font-bold mb-2">Xác nhận xóa?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Việc này có thể ảnh hưởng đến các khóa học thuộc danh mục này.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-gray-100 font-bold rounded-lg hover:bg-gray-200">Hủy</button>
                            <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Xóa ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}