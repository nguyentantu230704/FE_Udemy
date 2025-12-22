'use client';

import { useState, useEffect } from 'react';
import { Star, Send, Loader2, Edit2, Trash2, X, Check, MessageSquare, AlertTriangle } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { IReview, IUser } from '@/types';
import toast from 'react-hot-toast';

interface Props {
    courseId: string;
    instructorId?: string;
}

export default function ReviewsSection({ courseId, instructorId }: Props) {
    const [reviews, setReviews] = useState<IReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<IUser | null>(null);

    // State Form
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // State Edit
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');
    const [updating, setUpdating] = useState(false);

    // State Reply
    const [replyingId, setReplyingId] = useState<string | null>(null);
    const [replyComment, setReplyComment] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    // --- STATE MỚI CHO MODAL XÓA ---
    const [deleteId, setDeleteId] = useState<string | null>(null); // ID của review cần xóa
    const [deleting, setDeleting] = useState(false);
    // -------------------------------

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchReviews();
    }, [courseId]);

    const fetchReviews = async () => {
        try {
            const { data } = await axiosClient.get(`/reviews/${courseId}`);
            if (data.success) setReviews(data.data);
        } catch (error) { console.error("Lỗi tải đánh giá"); } finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        if (!user) return toast.error("Vui lòng đăng nhập");
        setSubmitting(true);
        try {
            const { data } = await axiosClient.post('/reviews', { courseId, rating, comment });
            if (data.success) { toast.success("Đánh giá thành công!"); setReviews([data.data, ...reviews]); setComment(''); }
        } catch (error: any) { toast.error(error.response?.data?.message || "Lỗi"); } finally { setSubmitting(false); }
    };

    const startEdit = (review: IReview) => { setEditingId(review._id); setEditRating(review.rating); setEditComment(review.comment); };
    const cancelEdit = () => { setEditingId(null); };

    const handleUpdate = async () => {
        if (!editComment.trim() || !editingId) return;
        setUpdating(true);
        try {
            const { data } = await axiosClient.put(`/reviews/${editingId}`, { rating: editRating, comment: editComment });
            if (data.success) { toast.success("Đã cập nhật!"); setReviews(reviews.map(r => r._id === editingId ? data.data : r)); cancelEdit(); }
        } catch (error: any) { toast.error(error.response?.data?.message || "Lỗi cập nhật"); } finally { setUpdating(false); }
    };

    // --- LOGIC XÓA MỚI (DÙNG MODAL) ---
    const openDeleteModal = (reviewId: string) => {
        setDeleteId(reviewId);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const { data } = await axiosClient.delete(`/reviews/${deleteId}`);
            if (data.success) {
                toast.success("Đã xóa đánh giá");
                setReviews(reviews.filter(r => r._id !== deleteId));
                setDeleteId(null); // Đóng modal
            }
        } catch (error: any) {
            toast.error("Lỗi xóa");
        } finally {
            setDeleting(false);
        }
    };
    // ----------------------------------

    const handleSendReply = async (reviewId: string) => {
        if (!replyComment.trim()) return;
        setSendingReply(true);
        try {
            const { data } = await axiosClient.put(`/reviews/${reviewId}/reply`, { comment: replyComment });
            if (data.success) {
                toast.success("Đã trả lời!");
                setReviews(reviews.map(r => r._id === reviewId ? data.data : r));
                setReplyingId(null); setReplyComment('');
            }
        } catch (error: any) { toast.error(error.response?.data?.message || "Lỗi gửi trả lời"); } finally { setSendingReply(false); }
    };

    const hasReviewed = user && reviews.some(r => r.user?._id === user._id);
    const isInstructor = user && instructorId && user._id === instructorId;

    return (
        <div className="mt-12 relative">
            {/* --- MODAL XÓA ĐẸP --- */}
            {deleteId && (
                <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-100 p-3 rounded-full mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa đánh giá này?</h3>
                            <p className="text-gray-500 mb-6 text-sm">Hành động này không thể hoàn tác.</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">Hủy</button>
                                <button onClick={confirmDelete} disabled={deleting} className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2">
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa ngay'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --------------------- */}

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="fill-yellow-400 text-yellow-400" /> Đánh giá khóa học
            </h2>

            {user && !hasReviewed && !isInstructor && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                    <h3 className="font-bold text-gray-800 mb-4">Viết đánh giá của bạn</h3>
                    <div className="mb-4 flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                                <Star className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </div>
                    <textarea className="w-full p-3 border rounded-lg" rows={3} placeholder="Chia sẻ cảm nhận..." value={comment} onChange={e => setComment(e.target.value)} required />
                    <div className="mt-3 flex justify-end">
                        <button type="submit" disabled={submitting} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2">
                            {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />} Gửi
                        </button>
                    </div>
                </form>
            )}

            {loading ? <div className="text-center py-10 text-gray-500">Đang tải...</div> : reviews.length === 0 ? <p className="text-gray-500 italic">Chưa có đánh giá nào.</p> : (
                <div className="space-y-6">
                    {reviews.map((review) => {
                        const isMyReview = user && review.user?._id === user._id;
                        const isEditing = editingId === review._id;
                        const isReplying = replyingId === review._id;

                        return (
                            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-none">
                                <div className={`flex gap-4 ${isEditing ? 'bg-purple-50 p-4 rounded-lg' : ''}`}>
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                        <img src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.name}&background=random`} alt="avt" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{review.user?.name}</h4>
                                                {!isEditing && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                                                        <span className="text-xs text-gray-400 ml-2">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isMyReview && !isEditing && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => startEdit(review)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Edit2 className="w-4 h-4" /></button>
                                                    {/* SỬA HÀM GỌI XÓA */}
                                                    <button onClick={() => openDeleteModal(review._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                        </div>

                                        {isEditing ? (
                                            <div className="mt-3">
                                                <div className="flex gap-1 mb-2">{[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => setEditRating(s)}><Star className={`w-5 h-5 ${s <= editRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} /></button>)}</div>
                                                <textarea className="w-full p-2 border rounded text-sm" rows={2} value={editComment} onChange={e => setEditComment(e.target.value)} />
                                                <div className="flex gap-2 mt-2 justify-end">
                                                    <button onClick={cancelEdit} className="px-3 py-1 text-xs font-bold border rounded">Hủy</button>
                                                    <button onClick={handleUpdate} disabled={updating} className="px-3 py-1 text-xs font-bold text-white bg-purple-600 rounded flex items-center gap-1">{updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Lưu</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-gray-700 text-sm whitespace-pre-line">{review.comment}</p>
                                        )}

                                        {isInstructor && !review.instructorReply && !isReplying && (
                                            <button onClick={() => setReplyingId(review._id)} className="text-xs font-bold text-purple-600 mt-2 hover:underline flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Trả lời</button>
                                        )}

                                        {isReplying && (
                                            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-purple-100 animate-in fade-in">
                                                <p className="text-xs font-bold text-purple-700 mb-2">Trả lời học viên:</p>
                                                <textarea className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500" rows={2} placeholder="Nhập câu trả lời..." value={replyComment} onChange={e => setReplyComment(e.target.value)} />
                                                <div className="flex gap-2 mt-2 justify-end">
                                                    <button onClick={() => { setReplyingId(null); setReplyComment(''); }} className="px-3 py-1 text-xs font-bold border rounded bg-white">Hủy</button>
                                                    <button onClick={() => handleSendReply(review._id)} disabled={sendingReply} className="px-3 py-1 text-xs font-bold text-white bg-purple-600 rounded flex items-center gap-1">{sendingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Gửi</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* HIỂN THỊ CÂU TRẢ LỜI CỦA GIẢNG VIÊN (ĐÃ NÂNG CẤP) */}
                                {review.instructorReply && (
                                    <div className="ml-14 mt-3 bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500 relative flex gap-3">
                                        {/* Avatar Giảng viên (nhỏ) */}
                                        <div className="w-8 h-8 rounded-full bg-purple-200 overflow-hidden flex-shrink-0 border border-purple-300">
                                            <img
                                                // Nếu có user trong reply thì dùng, ko thì fallback sang chữ cái đầu hoặc placeholder
                                                src={review.instructorReply.user?.avatar || `https://ui-avatars.com/api/?name=${review.instructorReply.user?.name || 'Instructor'}&background=8b5cf6&color=fff`}
                                                alt="Instructor"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {/* Tên Giảng viên */}
                                                <span className="text-sm font-bold text-gray-900">
                                                    {review.instructorReply.user?.name || 'Giảng viên'}
                                                </span>
                                                <span className="text-[10px] font-bold text-white bg-purple-600 px-1.5 py-0.5 rounded uppercase">
                                                    Author
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    • {new Date(review.instructorReply.updatedAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{review.instructorReply.comment}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}