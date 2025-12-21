'use client';

import { useState, useEffect } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { IReview, IUser } from '@/types';
import UserAvatar from '@/components/UserAvatar';
import toast from 'react-hot-toast';

interface Props {
    courseId: string;
}

export default function ReviewsSection({ courseId }: Props) {
    const [reviews, setReviews] = useState<IReview[]>([]);
    const [loading, setLoading] = useState(true);

    // State Form
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<IUser | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        fetchReviews();
    }, [courseId]);

    const fetchReviews = async () => {
        try {
            const { data } = await axiosClient.get(`/reviews/${courseId}`);
            if (data.success) setReviews(data.data);
        } catch (error) {
            console.error("Lỗi tải đánh giá");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        if (!user) {
            toast.error("Vui lòng đăng nhập để đánh giá");
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await axiosClient.post('/reviews', {
                courseId,
                rating,
                comment
            });
            if (data.success) {
                toast.success("Đánh giá thành công!");
                setReviews([data.data, ...reviews]); // Thêm review mới lên đầu
                setComment(''); // Reset form
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="fill-yellow-400 text-yellow-400" /> Đánh giá khóa học
            </h2>

            {/* FORM VIẾT ĐÁNH GIÁ (Chỉ hiện nếu đã đăng nhập) */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                    <h3 className="font-bold text-gray-800 mb-4">Viết đánh giá của bạn</h3>

                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-sm font-medium">Chọn số sao:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                            </button>
                        ))}
                    </div>

                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                        rows={3}
                        placeholder="Chia sẻ cảm nhận của bạn về khóa học này..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />

                    <div className="mt-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2 disabled:opacity-70"
                        >
                            {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                            Gửi đánh giá
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 p-4 rounded-lg mb-8 text-center text-gray-600">
                    Vui lòng <a href="/login" className="text-purple-600 font-bold hover:underline">đăng nhập</a> để viết đánh giá.
                </div>
            )}

            {/* DANH SÁCH ĐÁNH GIÁ */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Đang tải đánh giá...</div>
            ) : reviews.length === 0 ? (
                <p className="text-gray-500 italic">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="flex gap-4 border-b border-gray-100 pb-6 last:border-none">
                            <UserAvatar src={review.user?.avatar} name={review.user?.name || 'User'} className="w-10 h-10 border-gray-200" />

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{review.user?.name || 'Người dùng ẩn danh'}</h4>
                                        <div className="flex items-center gap-1 mt-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                            ))}
                                            <span className="text-xs text-gray-400 ml-2">
                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-2 text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}