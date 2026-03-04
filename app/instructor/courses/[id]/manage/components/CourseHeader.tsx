import Link from 'next/link';
import { ArrowLeft, Trash2, Loader2, XCircle, CheckCircle } from 'lucide-react';
import { ICourse } from '@/types';

interface Props {
    course: ICourse;
    deleting: boolean;
    publishing: boolean;
    setShowDeleteCourseModal: (val: boolean) => void;
    handleTogglePublish: () => void;
}

export default function CourseHeader({ course, deleting, publishing, setShowDeleteCourseModal, handleTogglePublish }: Props) {
    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-4 shadow-sm">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/instructor/courses" className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft className="w-5 h-5" /></Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Quản lý khóa học</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{course.isPublished ? 'Đang Public' : 'Bản Nháp'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowDeleteCourseModal(true)} disabled={deleting} className="px-4 py-2 rounded text-sm font-bold flex gap-2 items-center text-red-600 hover:bg-red-50 transition border border-red-200">
                        <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Xóa</span>
                    </button>
                    <button onClick={handleTogglePublish} disabled={publishing} className={`px-4 py-2 rounded text-sm font-bold flex gap-2 items-center transition ${course.isPublished ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                        {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : course.isPublished ? <><XCircle className="w-4 h-4" /> Gỡ xuống</> : <><CheckCircle className="w-4 h-4" /> Xuất bản</>}
                    </button>
                </div>
            </div>
        </div>
    );
}