'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, Eye, AlertTriangle, Loader2 } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast from 'react-hot-toast';
import { ICourse } from '@/types';
import Link from 'next/link';

export default function CoursesTab() {
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await axiosClient.get('/admin/courses');
                if (data.success) setCourses(data.data);
            } catch (error) { toast.error("Lỗi tải danh sách"); }
            finally { setLoading(false); }
        };
        fetchCourses();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axiosClient.delete(`/admin/courses/${deleteId}`);
            setCourses(courses.filter(c => c._id !== deleteId));
            toast.success("Đã xóa khóa học");
            setDeleteId(null);
        } catch (error) { toast.error("Lỗi xóa khóa học"); }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof c.instructor === 'object' && c.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-10 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý tất cả khóa học</h2>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm khóa học, giảng viên..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Khóa học</th>
                            <th className="p-4">Giảng viên</th>
                            <th className="p-4">Giá</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredCourses.map(course => (
                            <tr key={course._id} className="hover:bg-gray-50">
                                <td className="p-4 max-w-xs">
                                    <div className="flex items-center gap-3">
                                        <img src={course.thumbnail?.url || '/placeholder.jpg'} className="w-12 h-12 rounded object-cover bg-gray-100" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate" title={course.title}>{course.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{typeof course.category === 'object' ? course.category.name : 'Unknown'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm">
                                    <p className="font-bold">{typeof course.instructor === 'object' ? course.instructor.name : 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{typeof course.instructor === 'object' ? course.instructor.email : ''}</p>
                                </td>
                                <td className="p-4 font-bold text-blue-600">
                                    {course.price === 0 ? 'Miễn phí' : course.price.toLocaleString('vi-VN') + ' đ'}
                                </td>
                                <td className="p-4">
                                    {course.isPublished ?
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Public</span> :
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Draft</span>
                                    }
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/course/${course.slug}`} target="_blank" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Xem">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => setDeleteId(course._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Xóa">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Xóa */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 text-center max-w-sm">
                        <div className="bg-red-100 p-4 rounded-full inline-block mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                        <h3 className="text-xl font-bold mb-2">Xóa khóa học?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Hành động này sẽ xóa vĩnh viễn khóa học khỏi hệ thống.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-gray-100 font-bold rounded hover:bg-gray-200">Hủy</button>
                            <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700">Xóa ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}