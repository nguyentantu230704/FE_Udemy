'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Download, ChevronLeft, CheckCircle, Check, Maximize, Minimize } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ILesson } from '@/types';

// Cấu hình Worker cho PDF.js
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

    const containerRef = useRef<HTMLDivElement>(null);
    const pdfScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (pdfScrollRef.current) {
            pdfScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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
                containerRef.current.requestFullscreen().catch(err => {
                    console.error(`Lỗi khi mở toàn màn hình: ${err.message}`);
                });
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

    let docUrl = lesson.document?.url;
    if (docUrl && !docUrl.endsWith('.pdf')) {
        docUrl += '.pdf';
    }

    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto flex flex-col items-center p-4 md:p-8">

            <div className="max-w-5xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 relative">

                {/* 💡 SỬA TẠI ĐÂY: Tạo thanh Header thông minh bằng Flexbox */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-100 pb-4">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{lesson.title}</h2>
                        <p className="text-gray-600 text-sm">Tài liệu đính kèm cho bài học này.</p>
                    </div>

                    {/* Nút bấm được đặt an toàn ở góc phải */}
                    <button
                        onClick={onComplete}
                        disabled={isCompleted}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition shadow-sm shrink-0 ${isCompleted ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'}`}
                    >
                        {isCompleted ? <><CheckCircle className="w-5 h-5" /> Đã hoàn thành</> : <><Check className="w-5 h-5" /> Đánh dấu đã học xong</>}
                    </button>
                </div>

                {/* --- Phần nội dung PDF bên dưới giữ nguyên --- */}
                {docUrl ? (
                    <div className="flex flex-col items-center w-full">
                        <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-50 text-purple-700 px-6 py-2.5 rounded-lg font-bold hover:bg-purple-100 transition flex items-center gap-2 mb-6 border border-purple-200"
                        >
                            <Download className="w-5 h-5" /> Xem tài liệu PDF
                        </a>

                        <div
                            ref={containerRef}
                            className={`flex flex-col w-full relative overflow-hidden transition-all duration-300 ${isFullscreen ? 'bg-gray-900 h-screen' : 'bg-gray-200/50 border border-gray-300 rounded-lg shadow-inner'}`}
                        >
                            {/* Toolbar: Nút Phóng to / Thu nhỏ */}
                            <div className={`flex justify-between items-center bg-white border-b border-gray-200 px-4 py-3 shrink-0 ${isFullscreen ? 'shadow-md z-10' : ''}`}>
                                <span className="font-bold text-gray-700">Trang {pageNumber} / {numPages || '...'}</span>
                                <button
                                    onClick={toggleFullscreen}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg transition font-medium text-sm"
                                >
                                    {isFullscreen ? <><Minimize className="w-4 h-4" /> Thu nhỏ lại</> : <><Maximize className="w-4 h-4" /> Toàn màn hình</>}
                                </button>
                            </div>

                            {/* Vùng cuộn PDF */}
                            <div
                                ref={pdfScrollRef}
                                className={`flex-1 overflow-y-auto flex justify-center p-4 md:p-8 ${isFullscreen ? 'items-start' : 'max-h-[600px]'}`}
                            >
                                <Document
                                    file={docUrl}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={
                                        <div className="flex flex-col items-center my-20">
                                            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                                            <p className={`font-medium ${isFullscreen ? 'text-gray-300' : 'text-gray-500'}`}>Đang tải tài liệu...</p>
                                        </div>
                                    }
                                    error={<p className="text-red-500 my-20 font-medium bg-red-50 px-6 py-3 rounded-lg">Không thể hiển thị tài liệu.</p>}
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

                            {/* Phân trang Next/Prev */}
                            {numPages && (
                                <div className={`bg-white border-t border-gray-200 px-4 py-3 flex justify-center items-center gap-6 shrink-0 ${isFullscreen ? 'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10' : ''}`}>
                                    <button
                                        disabled={pageNumber <= 1}
                                        onClick={() => setPageNumber(prev => prev - 1)}
                                        className="p-2 bg-gray-100 rounded-full disabled:opacity-40 hover:bg-purple-100 hover:text-purple-700 transition text-gray-700 shadow-sm"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-gray-800 font-bold min-w-[100px] text-center">
                                        {pageNumber} / {numPages}
                                    </span>
                                    <button
                                        disabled={pageNumber >= numPages}
                                        onClick={() => setPageNumber(prev => prev + 1)}
                                        className="p-2 bg-gray-100 rounded-full disabled:opacity-40 hover:bg-purple-100 hover:text-purple-700 transition text-gray-700 shadow-sm"
                                    >
                                        <ChevronLeft className="w-5 h-5 rotate-180" />
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
        </div>
    );
}
