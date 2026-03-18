'use client';

import { useState, useRef, useEffect } from 'react';
// Import thêm Sparkles (icon AI) và X (nút đóng)
import { Loader2, Download, ChevronLeft, CheckCircle, Check, Maximize, Minimize, Sparkles, X } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ILesson } from '@/types';
import toast from 'react-hot-toast';
import axiosClient from '@/utils/axiosClient';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
    lesson: ILesson;
    isCompleted: boolean;
    onComplete: () => void;
}

export default function DocumentViewer({ lesson, isCompleted, onComplete }: Props) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // --- STATES CHO TÍNH NĂNG AI SUMMARIZE ---
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryResult, setSummaryResult] = useState<string | null>(null);
    const [showAiModal, setShowAiModal] = useState(false);

    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    let docUrl = lesson.document?.url;
    if (docUrl && !docUrl.endsWith('.pdf')) {
        docUrl += '.pdf';
    }

    useEffect(() => {
        if (pdfContainerRef.current) {
            pdfContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pageNumber]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef.current?.requestFullscreen) {
                containerRef.current.requestFullscreen().catch(err => console.error(err));
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    // --- HÀM GỌI API TÓM TẮT AI ---
    const handleSummarize = async () => {
        if (!docUrl) return;

        setIsSummarizing(true);
        setShowAiModal(true); // Mở modal hiển thị loading ngay lập tức

        try {
            const { data } = await axiosClient.post('/lessons/summarize-pdf', {
                pdfUrl: docUrl
            });

            if (data.success) {
                setSummaryResult(data.summary);
                toast.success('AI đã tóm tắt xong!');
            }
        } catch (error) {
            toast.error('Lỗi khi nhờ AI tóm tắt. Vui lòng thử lại sau.');
            setShowAiModal(false);
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto flex flex-col items-center p-4 md:p-8 relative">

            {/* 💡 1. ĐÃ XÓA CÁI THẺ DIV 'fixed' BỊ LỖI Ở ĐÂY */}

            <div className="max-w-5xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 relative">

                {/* 💡 2. ĐƯA NÚT VÀO LẠI FLEXBOX HEADER ĐỂ KHÔNG BAO GIỜ BỊ CHE */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-100 pb-4">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{lesson.title}</h2>
                        <p className="text-gray-600 text-sm">Tài liệu đính kèm cho bài học này.</p>
                    </div>

                    {/* Nút Đánh dấu hoàn thành an toàn tuyệt đối */}
                    <button
                        onClick={onComplete}
                        disabled={isCompleted}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition shadow-sm shrink-0 ${isCompleted ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'}`}
                    >
                        {isCompleted ? <><CheckCircle className="w-5 h-5" /> Đã hoàn thành</> : <><Check className="w-5 h-5" /> Đánh dấu đã học xong</>}
                    </button>
                </div>

                {docUrl ? (
                    <div className="flex flex-col items-center w-full">

                        {/* Khu vực nút Tải xuống và Tóm tắt AI giữ nguyên */}
                        <div className="flex flex-wrap items-center justify-center gap-4 w-full mb-6">
                            <a
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-gray-700 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition flex items-center gap-2 border border-gray-300 shadow-sm"
                            >
                                <Download className="w-5 h-5" /> Tải tài liệu
                            </a>

                            <button
                                onClick={handleSummarize}
                                disabled={isSummarizing}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition shadow-md flex items-center gap-2"
                            >
                                {isSummarizing ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> AI đang đọc PDF...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5 text-yellow-300" /> Tóm tắt bằng AI</>
                                )}
                            </button>
                        </div>

                        {/* --- KHUNG PDF TOÀN MÀN HÌNH --- */}
                        <div
                            ref={containerRef}
                            className={`flex flex-col w-full relative overflow-hidden transition-all duration-300 ${isFullscreen ? 'bg-gray-900 h-screen fixed inset-0 z-[50]' : 'bg-gray-200/50 border border-gray-300 rounded-lg shadow-inner'}`}
                        >
                            <div className={`flex justify-between items-center bg-white border-b border-gray-200 px-4 py-3 shrink-0 ${isFullscreen ? 'shadow-md z-10' : ''}`}>
                                <span className="font-bold text-gray-700">Trang {pageNumber} / {numPages || '...'}</span>
                                <button
                                    onClick={toggleFullscreen}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg transition font-medium text-sm"
                                >
                                    {isFullscreen ? <><Minimize className="w-4 h-4" /> Thu nhỏ lại</> : <><Maximize className="w-4 h-4" /> Toàn màn hình</>}
                                </button>
                            </div>

                            <div
                                ref={pdfContainerRef}
                                className={`flex-1 overflow-y-auto flex justify-center p-4 md:p-8 ${isFullscreen ? 'items-start' : 'max-h-[600px]'}`}
                            >
                                <Document
                                    file={docUrl}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={<div className="my-20"><Loader2 className="w-10 h-10 animate-spin text-purple-600" /></div>}
                                >
                                    <div className="shadow-2xl border border-gray-200 bg-white inline-block">
                                        <Page
                                            pageNumber={pageNumber}
                                            width={typeof window !== 'undefined' ? (isFullscreen ? Math.min(window.innerWidth * 0.9, 1200) : 800) : 800}
                                            renderTextLayer={true}
                                            renderAnnotationLayer={true}
                                        />
                                    </div>
                                </Document>
                            </div>

                            {numPages && (
                                <div className={`bg-white border-t border-gray-200 px-4 py-3 flex justify-center items-center gap-6 shrink-0`}>
                                    <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)} className="p-2 bg-gray-100 rounded-full hover:bg-purple-100 disabled:opacity-40 transition">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="font-bold">{pageNumber} / {numPages}</span>
                                    <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)} className="p-2 bg-gray-100 rounded-full hover:bg-purple-100 disabled:opacity-40 transition rotate-180">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-red-400 animate-spin mb-4" />
                        <p className="text-red-500 font-medium">Đang kiểm tra dữ liệu...</p>
                    </div>
                )}
            </div>

            {/* ========================================== */}
            {/* 💡 POPUP MODAL HIỂN THỊ KẾT QUẢ CỦA AI */}
            {/* ========================================== */}
            {showAiModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                        {/* Header Modal */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-300" /> Tóm tắt tài liệu bởi Gemini AI
                            </h3>
                            <button onClick={() => setShowAiModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body Modal (Vùng cuộn nội dung) */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/50">
                            {isSummarizing ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-75"></div>
                                        <Sparkles className="w-12 h-12 text-purple-600 relative z-10 animate-bounce" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800 mb-2">Đang phân tích dữ liệu...</h4>
                                    <p className="text-gray-500">Gemini đang đọc toàn bộ tài liệu PDF của bạn. Quá trình này có thể mất 10-20 giây.</p>
                                </div>
                            ) : (
                                <div className="prose prose-purple max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap text-[15px] sm:text-base">
                                    {/* Sử dụng whitespace-pre-wrap giúp tự động xuống dòng và giữ format gạch đầu dòng của AI */}
                                    {summaryResult}
                                </div>
                            )}
                        </div>

                        {/* Footer Modal */}
                        {!isSummarizing && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                                <button
                                    onClick={() => setShowAiModal(false)}
                                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
                                >
                                    Đóng
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}