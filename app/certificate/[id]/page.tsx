'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Download, Share2, Award, CheckCircle } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import toast, { Toaster } from 'react-hot-toast';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface CertificateData {
    certificateId: string;
    studentName: string;
    courseTitle: string;
    instructorName: string;
    issueDate: string;
}

export default function CertificatePage() {
    const params = useParams();
    const certificateRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const res = await axiosClient.get(`/progress/certificate/${params.id}`);
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (error) {
                toast.error("Không tìm thấy chứng chỉ này!");
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [params.id]);

    // Format ngày tháng an toàn tránh NaN
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Xuất PDF bằng công nghệ mới (html-to-image)
    const handleDownloadPDF = async () => {
        if (!certificateRef.current || !data) return;
        setDownloading(true);
        toast('Đang tạo PDF, vui lòng đợi...', { icon: '⏳' });

        try {
            // Chụp ảnh bằng html-to-image thay vì html2canvas
            const imgData = await toPng(certificateRef.current, {
                quality: 1.0,
                pixelRatio: 3, // Giữ độ nét cao (tương đương scale: 3)
                backgroundColor: '#ffffff'
            });

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Tự động tính toán tỷ lệ ảnh chuẩn xác
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Chèn ảnh dạng PNG vào file PDF
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Chung-chi-${data.studentName.replace(/\s+/g, '-')}.pdf`);

            toast.success("Tải xuống thành công!");
        } catch (error) {
            console.error("Lỗi xuất PDF:", error);
            toast.error("Có lỗi xảy ra khi tạo PDF");
        } finally {
            setDownloading(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Đã copy link chứng chỉ!");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-purple-600" /></div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl font-bold text-gray-500">Không tìm thấy chứng chỉ</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans flex flex-col items-center">
            <Toaster />

            {/* Thanh công cụ */}
            <div className="max-w-5xl w-full bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border border-gray-200">
                <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5" /> Đã xác thực trên hệ thống
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={handleCopyLink} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition border border-gray-300">
                        <Share2 className="w-4 h-4" /> Chia sẻ
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition shadow-md"
                    >
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {downloading ? 'Đang xuất...' : 'Tải PDF về máy'}
                    </button>
                </div>
            </div>

            {/* VÙNG CHỨA CHỨNG CHỈ */}
            <div className="w-full max-w-5xl overflow-x-auto pb-10 flex justify-center custom-scrollbar">

                {/* Bản thiết kế chuẩn A4 ngang (1123x794) */}
                <div
                    ref={certificateRef}
                    className="relative bg-white text-gray-900 flex flex-col justify-between shrink-0 overflow-hidden"
                    style={{
                        width: '1123px',
                        height: '794px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }}
                >
                    {/* HỌA TIẾT VIỀN (Border Pattern) */}
                    <div className="absolute inset-0 m-6 border-[6px] border-double border-gray-300 rounded-sm pointer-events-none z-0"></div>
                    <div className="absolute inset-0 m-8 border border-gray-200 rounded-sm pointer-events-none z-0"></div>

                    {/* Watermark mờ ở giữa */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 z-0 pointer-events-none">
                        <Award className="w-96 h-96 text-gray-900" />
                    </div>

                    {/* NỘI DUNG CHÍNH (Nằm đè lên viền - z-10) */}
                    <div className="relative z-10 flex flex-col h-full p-16">

                        {/* HEADER: Logo & Tên nền tảng */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-purple-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <Award className="w-10 h-10" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-widest uppercase text-gray-800">SmartLMS</h2>
                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Education Platform</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="w-20 h-20 border-4 border-yellow-500 rounded-full flex items-center justify-center">
                                    <Award className="w-10 h-10 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        {/* BODY: Thông tin chứng chỉ */}
                        <div className="text-center my-auto px-20">
                            <h1 className="text-5xl font-serif text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-300 pb-4 inline-block">
                                Chứng Nhận Hoàn Thành
                            </h1>
                            <p className="text-xl text-gray-600 mb-4 font-medium">
                                Chứng nhận này được SMARTLMS trao tặng cho
                            </p>

                            {/* Tên học viên */}
                            <h2 className="text-7xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {data.studentName}
                            </h2>

                            <p className="text-xl text-gray-600 mb-2 font-medium">
                                hoàn thành toàn bộ chương trình của khóa học
                            </p>

                            {/* Tên khóa học */}
                            <h3 className="text-3xl font-bold text-purple-800 max-w-3xl mx-auto leading-tight">
                                {data.courseTitle}
                            </h3>
                        </div>

                        {/* FOOTER: Chữ ký, Ngày tháng & Mã tra cứu */}
                        <div className="flex justify-between items-end mt-12">

                            {/* Ngày cấp & Mã tra cứu (Góc trái) */}
                            <div className="text-left w-64">
                                <p className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1 inline-block min-w-[150px]">
                                    {formatDate(data.issueDate)}
                                </p>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Ngày cấp</p>
                                <div className="mt-4 text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded border border-gray-100 inline-block">
                                    ID: {data.certificateId}
                                </div>
                            </div>

                            {/* Chữ ký Giảng viên (Góc phải) */}
                            <div className="text-center w-64">
                                {/* Font chữ ký giả lập (Tạo cảm giác viết tay) */}
                                <div
                                    className="text-5xl text-gray-800 opacity-90 mb-1 -rotate-3"
                                    style={{ fontFamily: "'Brush Script MT', 'Cedarville Cursive', cursive" }}
                                >
                                    {data.instructorName}
                                </div>
                                <div className="border-t border-gray-400 pt-2 mx-auto w-full">
                                    <p className="text-lg font-bold text-gray-800">{data.instructorName}</p>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Giảng viên hướng dẫn</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}