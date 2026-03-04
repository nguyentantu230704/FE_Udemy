import { AlertTriangle, Trash2, Loader2, Trash } from 'lucide-react';

interface Props {
    showDeleteCourseModal: boolean;
    setShowDeleteCourseModal: (val: boolean) => void;
    confirmDeleteCourse: () => void;
    deleting: boolean;
    deleteTarget: { type: 'section' | 'lesson', id: string, title: string } | null;
    setDeleteTarget: (val: any) => void;
    handleDeleteItem: () => void;
}

export default function CourseModals({
    showDeleteCourseModal, setShowDeleteCourseModal, confirmDeleteCourse, deleting,
    deleteTarget, setDeleteTarget, handleDeleteItem
}: Props) {
    return (
        <>
            {showDeleteCourseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-100 p-3 rounded-full mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa khóa học này?</h3>
                            <p className="text-gray-500 mb-6 text-sm">Hành động này không thể hoàn tác.</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setShowDeleteCourseModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Hủy</button>
                                <button onClick={confirmDeleteCourse} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Xóa ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-orange-100 p-3 rounded-full mb-4">
                                <Trash className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Xóa {deleteTarget.type === 'section' ? 'chương' : 'bài học'}?
                            </h3>
                            <p className="text-gray-600 mb-1 font-medium line-clamp-2">"{deleteTarget.title}"</p>
                            <p className="text-gray-400 mb-6 text-xs">
                                {deleteTarget.type === 'section' ? 'Toàn bộ bài học trong chương này cũng sẽ bị xóa.' : 'Dữ liệu bài học sẽ bị xóa vĩnh viễn.'}
                            </p>

                            <div className="flex gap-3 w-full">
                                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">
                                    Hủy
                                </button>
                                <button onClick={handleDeleteItem} disabled={deleting} className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2">
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}