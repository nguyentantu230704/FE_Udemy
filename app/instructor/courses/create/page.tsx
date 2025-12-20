'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';

// Định nghĩa kiểu dữ liệu nhẹ cho Category trong trang này
interface CategorySimple {
    _id: string;
    name: string;
}

export default function CreateCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // State form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);

    // State danh sách category và category được chọn
    const [categories, setCategories] = useState<CategorySimple[]>([]);
    const [category, setCategory] = useState('');

    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Gọi API lấy danh mục khi vừa vào trang
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axiosClient.get('/categories');
                if (data.success) {
                    setCategories(data.data);
                    // Mặc định chọn cái đầu tiên nếu có
                    if (data.data.length > 0) {
                        setCategory(data.data[0]._id);
                    }
                }
            } catch (error) {
                toast.error("Không thể tải danh mục");
            }
        };
        fetchCategories();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnail(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price', price.toString());
            formData.append('category', category);
            if (thumbnail) {
                formData.append('thumbnail', thumbnail);
            }

            const { data } = await axiosClient.post('/courses/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Tạo khóa học thành công!');
            router.push(`/instructor/courses/${data.data._id}/manage`);

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Toaster />
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Tạo khóa học mới</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Tên khóa học */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
                        <input
                            type="text" required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Ví dụ: Học ReactJS trong 30 ngày"
                            value={title} onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                            required rows={4}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Giới thiệu nội dung khóa học..."
                            value={description} onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Giá & Category */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                            {/* --- PHẦN ĐÃ SỬA --- */}
                            <input
                                type="number"
                                min="0"
                                step="100000" // Tăng giảm mỗi lần 100,000
                                required
                                className="w-full p-2 border border-gray-300 rounded"
                                // Nếu price là 0 thì hiển thị chuỗi rỗng để không bị số 0 ở đầu
                                value={price === 0 ? '' : price}
                                onChange={e => {
                                    const val = e.target.value;
                                    // Nếu xóa hết (chuỗi rỗng) thì set về 0, ngược lại thì parse số
                                    setPrice(val === '' ? 0 : Number(val));
                                }}
                            />
                            {/* ------------------- */}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                            <select
                                required
                                className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-purple-500 focus:border-purple-500"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value="" disabled>-- Chọn danh mục --</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Ảnh bìa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative">
                            <input
                                type="file" accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="h-48 object-cover rounded" />
                            ) : (
                                <div className="text-center">
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-1 text-sm text-gray-600">Nhấn để tải ảnh lên</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-purple-600 text-white font-bold py-3 rounded-md hover:bg-purple-700 flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Tạo và sang bước tiếp theo'}
                    </button>
                </form>
            </div>
        </div>
    );
}