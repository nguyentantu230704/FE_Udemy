'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Mail, Phone, MessageCircle } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { IUser } from '@/types';

export default function PublicProfilePage() {
    const params = useParams();
    const id = params.id;

    const [instructor, setInstructor] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructorProfile = async () => {
            try {
                const { data } = await axiosClient.get(`/users/${id}`);
                if (data.success) {
                    setInstructor(data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin giảng viên:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchInstructorProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex justify-center items-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!instructor) {
        return (
            <div className="min-h-[70vh] flex justify-center items-center bg-gray-50">
                <p className="text-gray-500 font-medium text-lg">Không tìm thấy thông tin giảng viên này.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* 1. Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    {/* Banner màu tối */}
                    <div className="h-32 bg-[#1a1f2e]"></div>

                    <div className="px-6 md:px-8 pb-6">
                        {/* 💡 BỐ CỤC ĐÃ SỬA: Tách biệt Avatar và Tên */}
                        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-end mb-6">

                            {/* Chỉ Avatar mới bị kéo lên trên (-mt-16) */}
                            <div className="-mt-16 relative z-10 shrink-0">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
                                    <img
                                        src={instructor.avatar || `https://ui-avatars.com/api/?name=${instructor.name}&background=8b5cf6&color=fff`}
                                        alt={instructor.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Phần Tên nằm yên vị trí an toàn ở nền trắng */}
                            <div className="flex-1 pb-1 sm:pb-3">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{instructor.name}</h1>
                                <p className="text-[15px] md:text-base text-purple-600 font-medium mt-1">
                                    {(instructor as any).headline || 'Giảng viên tại SmartLMS'}
                                </p>
                            </div>
                        </div>

                        {/* Đường kẻ ngang */}
                        <hr className="border-gray-200 mb-5" />

                        {/* Thông tin liên hệ */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-[15px] text-gray-600">
                            {instructor.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span>{instructor.email}</span>
                                </div>
                            )}

                            {(instructor as any).phone && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <span>{(instructor as any).phone}</span>
                                    </div>

                                    {/* Nút bấm chuyển hướng thẳng sang Zalo */}
                                    <a
                                        // .replace giúp lọc bỏ khoảng trắng/dấu gạch ngang để link Zalo không bị lỗi
                                        href={`https://zalo.me/${(instructor as any).phone.replace(/[^0-9+]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1 bg-[#e5f0ff] text-[#0068ff] rounded-full text-sm font-bold hover:bg-[#cce0ff] transition"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Chat Zalo
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Bio Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Giới thiệu bản thân</h2>
                    <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-[15px] md:text-base">
                        {(instructor as any).bio ? (
                            (instructor as any).bio
                        ) : (
                            <span className="italic text-gray-400">Giảng viên chưa cập nhật phần giới thiệu chi tiết.</span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}