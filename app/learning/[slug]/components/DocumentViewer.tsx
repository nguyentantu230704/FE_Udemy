import { useState } from 'react';
import { Loader2, Download, ChevronLeft, CheckCircle, Check } from 'lucide-react';
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

                        <div className="w-full bg-gray-200/50 border border-gray-300 rounded-lg p-4 md:p-8 flex flex-col items-center overflow-x-auto shadow-inner min-h-[500px]">
                            <Document
                                file={docUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={
                                    <div className="flex flex-col items-center my-20">
                                        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                                        <p className="text-gray-500 font-medium">Đang tải tài liệu, vui lòng đợi...</p>
                                    </div>
                                }
                                error={<p className="text-red-500 my-20 font-medium bg-red-50 px-6 py-3 rounded-lg">Không thể hiển thị tài liệu. Vui lòng thử tải xuống.</p>}
                            >
                                <div className="shadow-lg border border-gray-200 bg-white">
                                    <Page
                                        pageNumber={pageNumber}
                                        width={Math.min(typeof window !== 'undefined' ? window.innerWidth * 0.7 : 800, 1000)}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                    />
                                </div>
                            </Document>

                            {numPages && (
                                <div className="flex items-center gap-6 mt-6 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200">
                                    <button
                                        disabled={pageNumber <= 1}
                                        onClick={() => setPageNumber(prev => prev - 1)}
                                        className="p-2 bg-gray-100 rounded-full disabled:opacity-40 hover:bg-purple-100 hover:text-purple-700 transition text-gray-700"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-gray-800 font-bold min-w-[100px] text-center">
                                        Trang {pageNumber} / {numPages}
                                    </span>
                                    <button
                                        disabled={pageNumber >= numPages}
                                        onClick={() => setPageNumber(prev => prev + 1)}
                                        className="p-2 bg-gray-100 rounded-full disabled:opacity-40 hover:bg-purple-100 hover:text-purple-700 transition text-gray-700"
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