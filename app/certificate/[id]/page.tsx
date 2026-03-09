'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Download, CheckCircle, Award, Share2 } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';

interface CertificateData {
    certificateId: string;
    studentName: string;
    courseTitle: string;
    instructorName: string;
    completedAt: string;
}

export default function CertificatePage() {
    const params = useParams();
    const router = useRouter();
    const [certData, setCertData] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                // Gọi API Public mà chúng ta vừa tạo
                const { data } = await axiosClient.get(`/progress/certificate/${params.id}`);
                if (data.success) {
                    setCertData(data.data);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Không tìm thấy chứng chỉ');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchCertificate();
    }, [params.id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                <p className="text-gray-500 font-medium">Đang xác minh chứng chỉ...</p>
            </div>
        );
    }

    if (error || !certData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Chứng chỉ không hợp lệ</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button onClick={() => router.push('/')} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition">
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto flex flex-col items-center">

                {/* THANH CÔNG CỤ (In / Chia sẻ) */}
                <div className="w-full flex justify-between items-center mb-6 px-4">
                    <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-900 font-medium transition">
                        &larr; Về trang chủ
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-bold shadow-sm"
                        >
                            <Download className="w-4 h-4" /> Tải PDF
                        </button>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Đã copy link chứng chỉ!');
                            }}
                            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-bold shadow-sm"
                        >
                            <Share2 className="w-4 h-4" /> Chia sẻ
                        </button>
                    </div>
                </div>

                {/* KHUNG CHỨNG CHỈ */}
                {/* CSS print để tối ưu khi bấm tải PDF */}
                <div className="w-full bg-white p-2 rounded shadow-2xl overflow-hidden print:shadow-none print:p-0">
                    <div className="border-[12px] border-double border-purple-200 p-8 md:p-16 text-center relative bg-white">

                        {/* Họa tiết trang trí */}
                        <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-purple-600 opacity-20 m-4"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-purple-600 opacity-20 m-4"></div>

                        {/* Nội dung */}
                        <div className="mb-8 flex justify-center">
                            <Award className="w-20 h-20 text-yellow-500" />
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 uppercase tracking-normal" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                            GIẤY CHỨNG NHẬN
                        </h1>
                        <p className="text-lg text-gray-500 uppercase tracking-widest mb-12 font-bold">
                            Hoàn Thành Khóa Học
                        </p>

                        <p className="text-gray-600 text-lg mb-2">Chứng nhận học viên:</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-purple-700 mb-8 italic">
                            {certData.studentName}
                        </h2>

                        <p className="text-gray-600 text-lg mb-2">Đã hoàn thành xuất sắc khóa học:</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-16">
                            {certData.courseTitle}
                        </h3>

                        {/* Chữ ký & Ngày tháng */}
                        <div className="flex justify-between items-end px-4 md:px-20 mt-8">
                            <div className="text-center">
                                <p className="text-gray-500 italic mb-2">{formatDate(certData.completedAt)}</p>
                                <div className="w-40 h-px bg-gray-400 mx-auto mb-2"></div>
                                <p className="font-bold text-gray-800">Ngày cấp</p>
                            </div>

                            <div className="text-center flex flex-col items-center">
                                {/* Huy hiệu xác nhận góc phải */}
                                <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-yellow-100 rounded-full border-2 border-yellow-400 border-dashed animate-[spin_10s_linear_infinite]"></div>
                                    <CheckCircle className="w-10 h-10 text-yellow-600 z-10" />
                                </div>
                                <p className="font-bold text-gray-800">{certData.instructorName}</p>
                                <p className="text-gray-500 text-sm">Giảng viên hướng dẫn</p>
                            </div>
                        </div>

                        {/* Mã tra cứu */}
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p className="text-xs text-gray-400 font-mono">
                                ID Tra cứu: {certData.certificateId} | Xác minh tại: {window.location.host}/certificate/{certData.certificateId}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}