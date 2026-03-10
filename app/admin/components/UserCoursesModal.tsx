// Tệp: app/admin/components/UserCoursesModal.tsx
'use client';

import { useState } from 'react';
import { X, MinusCircle, AlertTriangle, Loader2 } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast from 'react-hot-toast';

interface Props {
    user: any | null;
    isOpen: boolean;
    onClose: () => void;
    // Hàm callback bắn ngược dữ liệu ra ngoài UsersTab để cập nhật lại bảng mà không cần tải lại trang
    onUpdateUserCourses: (userId: string, updatedCourses: any[]) => void;
}

export default function UserCoursesModal({ user, isOpen, onClose, onUpdateUserCourses }: Props) {
    const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);
    const [verifyCourseId, setVerifyCourseId] = useState<string | null>(null);

    if (!isOpen || !user) return null;

    const executeRemoveCourse = async () => {
        if (!verifyCourseId) return;

        setRemovingCourseId(verifyCourseId);
        try {
            await axiosClient.delete(`/admin/users/${user._id}/courses/${verifyCourseId}`);
            toast.success("Đã gỡ khóa học thành công");

            // Lọc khóa học vừa xóa ra khỏi danh sách
            const updatedCourses = user.enrolledCourses?.filter((c: any) => c._id !== verifyCourseId) || [];

            // Bắn dữ liệu mới ra ngoài cho file UsersTab cập nhật
            onUpdateUserCourses(user._id, updatedCourses);

        } catch (error) {
            toast.error("Lỗi gỡ khóa học");
        } finally {
            setRemovingCourseId(null);
            setVerifyCourseId(null);
        }
    };

    return (
        <>
            {/* MODAL VIEW COURSES */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[80vh] overflow-hidden flex flex-col relative">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <h3 className="font-bold text-lg">Khóa học của {user.name}</h3>
                        <button onClick={onClose}><X className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
                            <ul className="space-y-2">
                                {user.enrolledCourses.map((c: any) => (
                                    <li key={c._id} className="p-3 bg-gray-50 rounded border flex justify-between items-center gap-3 group hover:bg-blue-50 transition">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 bg-gray-200 rounded shrink-0 overflow-hidden">
                                                <img src={c.thumbnail?.url || '/placeholder.jpg'} className="w-full h-full object-cover" alt="thumbnail" />
                                            </div>
                                            <span className="text-sm font-medium line-clamp-1">{c.title}</span>
                                        </div>

                                        <button
                                            onClick={() => setVerifyCourseId(c._id)}
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

            {/* MODAL XÁC NHẬN GỠ KHÓA HỌC */}
            {verifyCourseId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
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
        </>
    );
}