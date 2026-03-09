'use client';

import { useState, useRef, useEffect } from 'react';
// Import thêm 2 icon Maximize (Toàn màn hình) và Minimize (Thu nhỏ)
import { Loader2, Download, ChevronLeft, CheckCircle, Check, Maximize, Minimize } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ILesson } from '@/types';

// Cấu hình Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
    lesson: ILesson;
    isCompleted: boolean;
    onComplete: () => void;
}

export default function DocumentViewer({ lesson, isCompleted, onComplete }: Props) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);

    // 1. STATE CHO TOÀN MÀN HÌNH
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 2. REF ĐỂ XỬ LÝ CUỘN LÊN ĐẦU
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    // Mỗi khi chuyển trang, tự động cuộn vùng chứa PDF lên trên cùng
    useEffect(() => {
        if (pdfContainerRef.current) {
            pdfContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pageNumber]);

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
            <div className="max-w-5xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
                <p className="text-gray-600 mb-6 text-sm">Tài liệu đính kèm cho bài học này.</p>

                {docUrl ? (
                    <div className="flex flex-col items-center w-full">
                        <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-2 shadow-md mb-6"
                        >
                            <Download className="w-5 h-5" /> Tải tài liệu xuống máy
                        </a>

                        {/* --- KHUNG HIỂN THỊ PDF NÂNG CẤP --- */}
                        {/* Nếu isFullscreen = true, khung này sẽ phóng to chèn lên toàn bộ web */}
                        <div className={`transition-all duration-300 flex flex-col ${isFullscreen ? 'fixed inset-0 z-[9999] bg-gray-900/95 backdrop-blur-sm p-4 md:p-10' : 'w-full bg-gray-200/50 border border-gray-300 rounded-lg shadow-inner relative overflow-hidden'}`}>

                            {/* Toolbar: Nút Phóng to / Thu nhỏ nằm ở thanh Header của khung PDF */}
                            <div className={`flex justify-between items-center bg-white border-b border-gray-200 px-4 py-3 ${isFullscreen ? 'rounded-t-xl max-w-5xl mx-auto w-full' : ''}`}>
                                <span className="font-bold text-gray-700">Trang {pageNumber} / {numPages || '...'}</span>
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg transition font-medium text-sm"
                                >
                                    {isFullscreen ? <><Minimize className="w-4 h-4" /> Thu nhỏ lại</> : <><Maximize className="w-4 h-4" /> Toàn màn hình</>}
                                </button>
                            </div>

                            {/* Vùng cuộn chứa trang nội dung PDF */}
                            <div
                                ref={pdfContainerRef}
                                className={`flex-1 overflow-y-auto flex justify-center p-4 md:p-8 ${isFullscreen ? 'max-w-5xl mx-auto w-full bg-gray-100/10' : 'max-h-[600px]'}`}
                            >
                                <Document
                                    file={docUrl}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={
                                        <div className="flex flex-col items-center my-20">
                                            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                                            <p className={`font-medium ${isFullscreen ? 'text-gray-300' : 'text-gray-500'}`}>Đang tải tài liệu, vui lòng đợi...</p>
                                        </div>
                                    }
                                    error={<p className="text-red-500 my-20 font-medium bg-red-50 px-6 py-3 rounded-lg">Không thể hiển thị tài liệu. Vui lòng thử tải xuống.</p>}
                                >
                                    <div className="shadow-2xl border border-gray-200 bg-white">
                                        <Page
                                            pageNumber={pageNumber}
                                            // Trang sẽ to hơn 1 chút nếu đang ở chế độ toàn màn hình
                                            width={Math.min(typeof window !== 'undefined' ? window.innerWidth * (isFullscreen ? 0.8 : 0.7) : 800, isFullscreen ? 1200 : 1000)}
                                            renderTextLayer={true}
                                            renderAnnotationLayer={true}
                                        />
                                    </div>
                                </Document>
                            </div>

                            {/* Thanh phân trang Next / Prev nằm dưới cùng */}
                            {numPages && (
                                <div className={`bg-white border-t border-gray-200 px-4 py-3 flex justify-center items-center gap-6 ${isFullscreen ? 'rounded-b-xl max-w-5xl mx-auto w-full' : ''}`}>
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
                        <p className="text-red-500 font-medium">Đang kiểm tra đường dẫn tài liệu...</p>
                    </div>
                )}

                <button
                    onClick={onComplete}
                    disabled={isCompleted}
                    className={`mt-10 flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-sm mx-auto transition ${isCompleted ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-purple-600 hover:border-purple-300 shadow-sm'}`}
                >
                    {isCompleted ? <><CheckCircle className="w-5 h-5" /> Đã hoàn thành bài học</> : <><Check className="w-5 h-5" /> Đánh dấu đã học xong</>}
                </button>
            </div>
        </div>
    );
}