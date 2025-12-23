'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Plus, Video, Trash2, Loader2, Save,
    CheckCircle, XCircle, Image as ImageIcon, ArrowLeft, Edit3,
    UploadCloud, FileVideo, X, PlayCircle, AlertTriangle, Trash, PlusCircle,
    FileText, HelpCircle, Eye
} from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse, ISection, ILesson } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import CourseObjectives from '@/components/instructor/CourseObjectives'; // <--- MỚI


interface CategorySimple {
    _id: string;
    name: string;
}

export default function ManageCoursePage() {
    const { id } = useParams();
    const router = useRouter();

    const [course, setCourse] = useState<ICourse | null>(null);
    const [loading, setLoading] = useState(true);

    const [publishing, setPublishing] = useState(false);
    const [updatingThumbnail, setUpdatingThumbnail] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [savingInfo, setSavingInfo] = useState(false);

    // --- STATE XÓA MỚI (Dùng chung cho Course, Section, Lesson) ---
    const [deleting, setDeleting] = useState(false);
    // Modal xóa khóa học (giữ nguyên logic cũ của bạn)
    const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);

    // Modal xóa Section/Lesson (MỚI)
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'section' | 'lesson', id: string, title: string } | null>(null);
    // ---------------------------------------------------------------

    const [formData, setFormData] = useState({
        title: '',
        price: 0,
        description: '',
        category: ''
    });

    const [objectives, setObjectives] = useState<string[]>([]);

    const [categories, setCategories] = useState<CategorySimple[]>([]);

    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);

    const [uploadingLesson, setUploadingLesson] = useState(false);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonFile, setLessonFile] = useState<File | null>(null);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const lessonInputRef = useRef<HTMLInputElement>(null);

    const [lessonType, setLessonType] = useState<'video' | 'text' | 'quiz'>('video');
    const [textContent, setTextContent] = useState('');
    const [quizQuestions, setQuizQuestions] = useState([{
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    }]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const [allCoursesRes, catRes] = await Promise.all([
                axiosClient.get('/courses'),
                axiosClient.get('/categories')
            ]);

            if (allCoursesRes.data.success) {
                const foundCourse = allCoursesRes.data.data.find((c: ICourse) => c._id === id);

                if (foundCourse) {
                    const detailRes = await axiosClient.get(`/courses/${foundCourse.slug}`);
                    if (detailRes.data.success) {
                        const realData = detailRes.data.data;
                        setCourse(realData);
                        setFormData({
                            title: realData.title,
                            price: realData.price,
                            description: realData.description || '',
                            category: (typeof realData.category === 'object' && realData.category?._id)
                                ? realData.category._id
                                : (typeof realData.category === 'string' ? realData.category : '')
                        });
                        setObjectives(realData.objectives || []);
                    }
                }
            }
            if (catRes.data.success) setCategories(catRes.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCourseData();
    }, [id]);

    // --- CÁC HÀM XỬ LÝ (Course) ---
    const handleSaveInfo = async () => {
        setSavingInfo(true);
        try {
            const payload = {
                ...formData,
                objectives: objectives
            };
            const { data } = await axiosClient.put(`/courses/${id}`, payload);
            if (data.success) {
                toast.success("Cập nhật thông tin thành công!");
                setCourse(data.data);
                setIsEditing(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật");
        } finally {
            setSavingInfo(false);
        }
    };

    const confirmDeleteCourse = async () => {
        setDeleting(true);
        try {
            const { data } = await axiosClient.delete(`/courses/${id}`);
            if (data.success) {
                setShowDeleteCourseModal(false);
                toast.success("Đã xóa khóa học thành công!");
                setTimeout(() => router.push('/instructor/courses'), 1000);
            }
        } catch (error) {
            toast.error("Lỗi xóa khóa học");
            setDeleting(false);
            setShowDeleteCourseModal(false);
        }
    };

    // --- CÁC HÀM XỬ LÝ MỚI CHO DELETE SECTION / LESSON ---

    // 1. Mở Modal
    const openDeleteConfirm = (type: 'section' | 'lesson', id: string, title: string) => {
        setDeleteTarget({ type, id, title });
    };

    // 2. Thực hiện xóa (Gọi API + Cập nhật State nội bộ không cần reload)
    const handleDeleteItem = async () => {
        if (!deleteTarget || !course) return;
        setDeleting(true);

        try {
            if (deleteTarget.type === 'section') {
                // Gọi API Xóa Chương
                await axiosClient.delete(`/sections/${deleteTarget.id}`);

                // Cập nhật State: Lọc bỏ chương vừa xóa
                const newSections = course.sections.filter(s => s._id !== deleteTarget.id);
                setCourse({ ...course, sections: newSections });
                toast.success("Đã xóa chương!");

            } else {
                // Gọi API Xóa Bài học
                await axiosClient.delete(`/lessons/${deleteTarget.id}`);

                // Cập nhật State: Tìm chương chứa bài học và lọc bỏ bài học đó
                const newSections = course.sections.map(section => ({
                    ...section,
                    lessons: section.lessons.filter(l => l._id !== deleteTarget.id)
                }));
                setCourse({ ...course, sections: newSections });

                // Nếu đang xem trước bài này thì đóng lại
                if (previewLessonId === deleteTarget.id) setPreviewLessonId(null);
                toast.success("Đã xóa bài học!");
            }
        } catch (error) {
            toast.error(`Lỗi khi xóa ${deleteTarget.type === 'section' ? 'chương' : 'bài học'}`);
        } finally {
            setDeleting(false);
            setDeleteTarget(null); // Đóng modal
        }
    };
    // -----------------------------------------------------

    const handleTogglePublish = async () => {
        if (!course) return;
        setPublishing(true);
        try {
            const { data } = await axiosClient.put(`/courses/${course._id}/publish`);
            if (data.success) {
                toast.success(data.message);
                setCourse({ ...course, isPublished: data.data.isPublished });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật");
        } finally {
            setPublishing(false);
        }
    };

    const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !course) return;
        setUpdatingThumbnail(true);
        const formDataUpload = new FormData();
        formDataUpload.append('thumbnail', file);

        try {
            const { data } = await axiosClient.put(`/courses/${course._id}`, formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (data.success) {
                toast.success("Đã cập nhật ảnh bìa!");
                setCourse(data.data);
            }
        } catch (error) {
            toast.error("Lỗi upload ảnh");
        } finally {
            setUpdatingThumbnail(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddSection = async () => {
        if (!newSectionTitle) return;
        try {
            const { data } = await axiosClient.post('/sections', {
                title: newSectionTitle,
                courseId: course?._id
            });
            toast.success("Đã thêm chương!");
            setNewSectionTitle('');
            setIsAddingSection(false);
            // Cập nhật state trực tiếp thay vì fetch lại
            if (course && data.success) {
                // Backend trả về section mới, ta thêm vào list
                // Lưu ý: API createSection cần trả về data của section mới tạo
                // Nếu API hiện tại chỉ trả message, tốt nhất vẫn nên fetch lại để đồng bộ
                fetchCourseData();
            }
        } catch (error) {
            toast.error("Lỗi thêm chương");
        }
    };

    const handleAddQuestion = () => {
        setQuizQuestions([...quizQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    };

    const handleQuizChange = (index: number, field: string, value: any, optionIndex?: number) => {
        const newQuestions = [...quizQuestions];
        if (field === 'question') {
            newQuestions[index].question = value;
        } else if (field === 'correctAnswer') {
            newQuestions[index].correctAnswer = value;
        } else if (field === 'option' && optionIndex !== undefined) {
            newQuestions[index].options[optionIndex] = value;
        }
        setQuizQuestions(newQuestions);
    };

    const handleDeleteQuestion = (index: number) => {
        const newQuestions = quizQuestions.filter((_, i) => i !== index);
        setQuizQuestions(newQuestions);
    };

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeSectionId || !lessonTitle) return;

        setUploadingLesson(true);
        const formData = new FormData();
        formData.append('title', lessonTitle);
        formData.append('sectionId', activeSectionId);
        formData.append('type', lessonType);
        formData.append('isPreview', 'false');

        if (lessonType === 'video') {
            if (lessonFile) formData.append('video', lessonFile);
        } else if (lessonType === 'text') {
            formData.append('content', textContent);
        } else if (lessonType === 'quiz') {
            formData.append('quizQuestions', JSON.stringify(quizQuestions));
        }

        try {
            await axiosClient.post('/lessons', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Tạo bài học thành công!");

            setActiveSectionId(null);
            setLessonTitle('');
            setLessonFile(null);
            setTextContent('');
            setQuizQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
            setLessonType('video');

            fetchCourseData(); // Fetch lại để lấy ID mới nhất
        } catch (error) {
            toast.error("Lỗi tạo bài học");
        } finally {
            setUploadingLesson(false);
        }
    };

    const handleCancelAddLesson = () => {
        setActiveSectionId(null);
        setLessonTitle('');
        setLessonFile(null);
        setTextContent('');
        setLessonType('video');
    };

    const getLessonVideoUrl = (videoData: any) => {
        if (!videoData) return '';
        if (typeof videoData === 'string') return videoData;
        if (typeof videoData === 'object' && videoData.url) return videoData.url;
        return '';
    };

    // --- LOGIC HIỂN THỊ LABEL THÔNG MINH HƠN ---
    const getSmartLessonType = (lesson: any) => {
        // 1. Nếu có type rõ ràng thì dùng luôn
        if (lesson.type && ['video', 'text', 'quiz'].includes(lesson.type)) {
            return lesson.type;
        }
        // 2. Nếu không có type (data cũ), đoán dựa trên dữ liệu
        if (lesson.content) return 'text';
        if (lesson.quizQuestions && lesson.quizQuestions.length > 0) return 'quiz';
        // 3. Mặc định còn lại là video
        return 'video';
    };

    const getLessonTypeLabel = (lesson: any) => {
        const type = getSmartLessonType(lesson);
        if (type === 'video') {
            return (lesson.video as any)?.duration ? `${Math.floor((lesson.video as any).duration / 60)}p` : 'Video';
        }
        if (type === 'text') return 'Bài đọc';
        if (type === 'quiz') return 'Trắc nghiệm';
        return type;
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-600" /></div>;
    if (!course) return <div className="p-10 text-center text-gray-500">Không tìm thấy khóa học...</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <Toaster />

            {/* --- MODAL XÓA KHÓA HỌC (Giữ nguyên) --- */}
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

            {/* --- MODAL XÓA SECTION / LESSON (MỚI) --- */}
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
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteItem}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                                >
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
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

            <div className="max-w-5xl mx-auto px-4 mt-8">
                {/* Khu vực 1: Ảnh bìa & Info */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-80 shrink-0">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh bìa khóa học</label>
                        <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                            {course.thumbnail?.url ? (
                                <img src={course.thumbnail.url} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <ImageIcon className="w-10 h-10" />
                                    <span className="text-xs">Chưa có ảnh</span>
                                </div>
                            )}
                            <div onClick={() => !updatingThumbnail && fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                                {updatingThumbnail ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <span className="text-white font-bold flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded text-sm backdrop-blur-sm hover:bg-black/80"><ImageIcon className="w-4 h-4" /> Thay đổi</span>}
                            </div>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleThumbnailChange} />
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <h2 className="font-bold text-lg text-gray-900">Thông tin cơ bản</h2>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="text-purple-600 hover:text-purple-700 text-sm font-bold flex items-center gap-1"><Edit3 className="w-4 h-4" /> Chỉnh sửa</button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 text-sm font-bold px-3 py-1">Hủy</button>
                                    <button onClick={handleSaveInfo} disabled={savingInfo} className="bg-purple-600 text-white hover:bg-purple-700 text-sm font-bold px-3 py-1 rounded flex items-center gap-1">{savingInfo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Lưu</button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên khóa học</label>
                                {isEditing ? <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500" /> : <p className="text-lg font-medium text-gray-900">{course.title}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giá bán (VND)</label>
                                    {isEditing ? <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500" /> : <p className="text-lg font-bold text-purple-600">{course.price.toLocaleString('vi-VN')} đ</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Danh mục</label>
                                    {isEditing ? (
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500">
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map((cat, index) => <option key={cat._id || index} value={cat._id}>{cat.name}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-medium text-gray-900 bg-gray-100 inline-block px-3 py-1 rounded">{(typeof course.category !== 'string' && course.category?.name) ? course.category.name : "Chưa phân loại"}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mô tả</label>
                                {isEditing ? (
                                    <>
                                        <textarea
                                            rows={4}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                        />

                                        {/* --- CHÈN COMPONENT MỚI --- */}
                                        <CourseObjectives
                                            objectives={objectives}
                                            setObjectives={setObjectives}
                                        />
                                        {/* ------------------------- */}
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600 whitespace-pre-line">{course.description || "Chưa có mô tả"}</p>

                                        {/* --- HIỂN THỊ MỤC TIÊU --- */}
                                        {course.objectives && course.objectives.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Bạn sẽ học được gì</p>
                                                <ul className="grid grid-cols-1 gap-2">
                                                    {course.objectives.map((obj, i) => (
                                                        <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                                                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                            <span>{obj}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {/* ------------------------- */}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Khu vực 2: Quản lý chương */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Nội dung chương trình</h2>
                        <button onClick={() => setIsAddingSection(true)} className="flex items-center gap-2 text-purple-600 font-bold hover:bg-purple-50 px-3 py-2 rounded transition"><Plus className="w-5 h-5" /> Thêm chương mới</button>
                    </div>

                    <div className="space-y-4">
                        {course.sections.map((section, index) => (
                            <div key={section._id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-gray-900">{section.title}</h3>
                                    {/* Nút xóa Chương */}
                                    <button
                                        onClick={() => openDeleteConfirm('section', section._id, section.title)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                                        title="Xóa chương"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2 pl-4 border-l-2 border-gray-200 ml-2 mb-4">
                                    {section.lessons && section.lessons.length > 0 ? (
                                        section.lessons.map((lesson, lIndex) => {
                                            const videoUrl = getLessonVideoUrl(lesson.video);
                                            const isPreviewing = previewLessonId === lesson._id;
                                            // Sử dụng hàm thông minh để xác định loại bài học
                                            const currentType = getSmartLessonType(lesson);

                                            return (
                                                <div key={lesson._id || lIndex} className="bg-white p-3 rounded border border-gray-100 shadow-sm relative group">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            {currentType === 'video' ? (
                                                                <Video className="w-4 h-4 text-purple-600" />
                                                            ) : currentType === 'quiz' ? (
                                                                <HelpCircle className="w-4 h-4 text-orange-500" />
                                                            ) : (
                                                                <FileText className="w-4 h-4 text-blue-500" />
                                                            )}
                                                            <span className="text-sm font-medium">{lesson.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-gray-400 capitalize">
                                                                {getLessonTypeLabel(lesson)}
                                                            </span>

                                                            {/* Nút Preview */}
                                                            <button
                                                                onClick={() => setPreviewLessonId(isPreviewing ? null : lesson._id)}
                                                                className={`p-1.5 rounded-full transition ${isPreviewing ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-500'}`}
                                                                title="Xem trước"
                                                            >
                                                                {isPreviewing ? <X className="w-4 h-4" /> : (currentType === 'video' ? <PlayCircle className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
                                                            </button>

                                                            {/* Nút Xóa Bài học */}
                                                            <button
                                                                onClick={() => openDeleteConfirm('lesson', lesson._id, lesson.title)}
                                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition"
                                                                title="Xóa bài học"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* KHU VỰC PREVIEW */}
                                                    {isPreviewing && (
                                                        <div className="mt-3 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 animate-in slide-in-from-top-2 fade-in">
                                                            {/* Video */}
                                                            {currentType === 'video' && videoUrl ? (
                                                                <video controls className="w-full aspect-video max-h-[400px]" controlsList="nodownload">
                                                                    <source src={videoUrl} type="video/mp4" />
                                                                </video>
                                                            ) : currentType === 'video' && !videoUrl ? (
                                                                <div className="p-4 text-center text-sm text-red-500">Video lỗi hoặc chưa tải lên.</div>
                                                            ) : null}

                                                            {/* Text */}
                                                            {currentType === 'text' && (
                                                                <div className="p-4 prose max-w-none text-sm bg-white">
                                                                    <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">Nội dung bài học:</h4>
                                                                    <div className="whitespace-pre-wrap text-gray-600">
                                                                        {lesson.content || "Chưa có nội dung."}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Quiz */}
                                                            {currentType === 'quiz' && (
                                                                <div className="p-4 bg-white">
                                                                    <h4 className="font-bold text-gray-800 mb-3 border-b pb-1 flex items-center gap-2">
                                                                        <HelpCircle className="w-4 h-4" /> Danh sách câu hỏi ({lesson.quizQuestions?.length || 0})
                                                                    </h4>
                                                                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                                                        {lesson.quizQuestions?.map((q: any, i: number) => (
                                                                            <div key={i} className="text-sm border border-gray-100 p-3 rounded bg-gray-50">
                                                                                <p className="font-bold text-purple-700 mb-2">Câu {i + 1}: {q.question}</p>
                                                                                <ul className="pl-4 list-disc space-y-1 text-gray-600">
                                                                                    {q.options?.map((opt: string, optIdx: number) => (
                                                                                        <li key={optIdx} className={optIdx === q.correctAnswer ? "text-green-600 font-bold" : ""}>
                                                                                            {opt} {optIdx === q.correctAnswer && "(Đúng)"}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="bg-gray-900 text-white text-xs p-2 flex justify-between items-center">
                                                                <span>Đang xem thử: {lesson.title}</span>
                                                                <button onClick={() => setPreviewLessonId(null)} className="text-gray-300 hover:text-white font-bold">Đóng</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Chưa có bài học nào</p>
                                    )}
                                </div>

                                {activeSectionId === section._id ? (
                                    <form onSubmit={handleAddLesson} className="bg-white p-6 border border-purple-100 rounded-xl shadow-lg mt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="font-bold text-lg text-gray-800">Thêm bài học mới</p>
                                            <button type="button" onClick={handleCancelAddLesson} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài học</label>
                                                <input type="text" placeholder="VD: Giới thiệu..." required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài học</label>
                                                <div className="flex gap-4">
                                                    {['video', 'text', 'quiz'].map((t) => (
                                                        <label key={t} className={`flex items-center gap-2 px-4 py-2 rounded border cursor-pointer transition ${lessonType === t ? 'bg-purple-100 border-purple-500 text-purple-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                            <input type="radio" name="type" value={t} checked={lessonType === t} onChange={() => setLessonType(t as any)} className="hidden" />
                                                            <span className="capitalize">{t}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {lessonType === 'video' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Video bài giảng</label>
                                                    <div onClick={() => lessonInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition ${lessonFile ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}`}>
                                                        {!lessonFile ? (
                                                            <>
                                                                <div className="bg-gray-100 p-3 rounded-full mb-3"><UploadCloud className="w-8 h-8 text-gray-500" /></div>
                                                                <p className="font-medium text-gray-700">Tải video lên</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="bg-purple-100 p-3 rounded-full mb-3"><FileVideo className="w-8 h-8 text-purple-600" /></div>
                                                                <p className="font-bold text-gray-800 line-clamp-1 text-center">{lessonFile.name}</p>
                                                            </>
                                                        )}
                                                        <input ref={lessonInputRef} type="file" accept="video/*" className="hidden" onChange={e => setLessonFile(e.target.files?.[0] || null)} />
                                                    </div>
                                                </div>
                                            )}

                                            {lessonType === 'text' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bài học</label>
                                                    <textarea rows={6} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Nhập nội dung văn bản..." value={textContent} onChange={e => setTextContent(e.target.value)} />
                                                </div>
                                            )}

                                            {lessonType === 'quiz' && (
                                                <div className="space-y-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    {quizQuestions.map((q, qIndex) => (
                                                        <div key={qIndex} className="p-4 bg-white rounded border border-gray-200 relative shadow-sm">
                                                            <div className="flex justify-between mb-2">
                                                                <span className="font-bold text-sm text-purple-700">Câu hỏi {qIndex + 1}</span>
                                                                {quizQuestions.length > 1 && <button type="button" onClick={() => handleDeleteQuestion(qIndex)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash className="w-4 h-4" /></button>}
                                                            </div>
                                                            <input type="text" className="w-full p-2 border rounded mb-3 text-sm focus:ring-1 focus:ring-purple-500" placeholder="Nhập câu hỏi..." value={q.question} onChange={e => handleQuizChange(qIndex, 'question', e.target.value)} required />

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {q.options.map((opt, oIndex) => (
                                                                    <div key={oIndex} className="flex items-center gap-2">
                                                                        <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer === oIndex} onChange={() => handleQuizChange(qIndex, 'correctAnswer', oIndex)} className="cursor-pointer" />
                                                                        <input type="text" className={`w-full p-2 border rounded text-sm ${q.correctAnswer === oIndex ? 'border-green-500 bg-green-50' : ''}`} placeholder={`Đáp án ${oIndex + 1}`} value={opt} onChange={e => handleQuizChange(qIndex, 'option', e.target.value, oIndex)} required />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={handleAddQuestion} className="w-full py-2 border-2 border-dashed border-purple-300 text-purple-600 font-bold rounded flex items-center justify-center gap-2 hover:bg-purple-50 transition">
                                                        <PlusCircle className="w-4 h-4" /> Thêm câu hỏi
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex gap-3 justify-end pt-2">
                                                <button type="button" onClick={handleCancelAddLesson} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Hủy bỏ</button>
                                                <button type="submit" disabled={uploadingLesson} className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                                                    {uploadingLesson ? <Loader2 className="animate-spin w-4 h-4" /> : 'Lưu bài học'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <button onClick={() => setActiveSectionId(section._id)} className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:bg-purple-50 px-3 py-2 rounded w-full border border-dashed border-purple-300 justify-center mt-2">
                                        <Plus className="w-4 h-4" /> Thêm bài học
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form thêm chương mới */}
                    <div className="mt-6">
                        {isAddingSection && (
                            <div className="flex gap-2 items-center bg-gray-100 p-4 rounded border border-gray-200">
                                <input
                                    type="text"
                                    placeholder="Tên chương mới..."
                                    className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={newSectionTitle}
                                    onChange={(e) => setNewSectionTitle(e.target.value)}
                                />
                                <button
                                    onClick={handleAddSection}
                                    className="bg-gray-900 text-white px-4 py-2 rounded font-bold hover:bg-gray-800 transition"
                                >
                                    Lưu
                                </button>
                                <button
                                    onClick={() => setIsAddingSection(false)}
                                    className="text-gray-500 px-2 hover:text-gray-700 transition"
                                >
                                    Hủy
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}