'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

// Import 4 component con bạn vừa tạo
import CourseModals from './components/CourseModals';
import CourseHeader from './components/CourseHeader';
import CourseBasicInfo from './components/CourseBasicInfo';
import CourseCurriculum from './components/CourseCurriculum';

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

    // --- STATE XÓA ---
    const [deleting, setDeleting] = useState(false);
    const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'section' | 'lesson', id: string, title: string } | null>(null);

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
            const payload = { ...formData, objectives: objectives };
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

    // --- CÁC HÀM XỬ LÝ DELETE SECTION / LESSON ---
    const openDeleteConfirm = (type: 'section' | 'lesson', id: string, title: string) => {
        setDeleteTarget({ type, id, title });
    };

    const handleDeleteItem = async () => {
        if (!deleteTarget || !course) return;
        setDeleting(true);

        try {
            if (deleteTarget.type === 'section') {
                await axiosClient.delete(`/sections/${deleteTarget.id}`);
                const newSections = course.sections.filter(s => s._id !== deleteTarget.id);
                setCourse({ ...course, sections: newSections });
                toast.success("Đã xóa chương!");
            } else {
                await axiosClient.delete(`/lessons/${deleteTarget.id}`);
                const newSections = course.sections.map(section => ({
                    ...section,
                    lessons: section.lessons.filter(l => l._id !== deleteTarget.id)
                }));
                setCourse({ ...course, sections: newSections });

                if (previewLessonId === deleteTarget.id) setPreviewLessonId(null);
                toast.success("Đã xóa bài học!");
            }
        } catch (error) {
            toast.error(`Lỗi khi xóa ${deleteTarget.type === 'section' ? 'chương' : 'bài học'}`);
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

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
            if (course && data.success) {
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

            fetchCourseData();
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

    const getSmartLessonType = (lesson: any) => {
        if (lesson.type && ['video', 'text', 'quiz'].includes(lesson.type)) return lesson.type;
        if (lesson.content) return 'text';
        if (lesson.quizQuestions && lesson.quizQuestions.length > 0) return 'quiz';
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

    // --- RENDER GỌN NHẸ ---
    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <Toaster />

            <CourseModals
                showDeleteCourseModal={showDeleteCourseModal}
                setShowDeleteCourseModal={setShowDeleteCourseModal}
                confirmDeleteCourse={confirmDeleteCourse}
                deleting={deleting}
                deleteTarget={deleteTarget}
                setDeleteTarget={setDeleteTarget}
                handleDeleteItem={handleDeleteItem}
            />

            <CourseHeader
                course={course}
                deleting={deleting}
                publishing={publishing}
                setShowDeleteCourseModal={setShowDeleteCourseModal}
                handleTogglePublish={handleTogglePublish}
            />

            <div className="max-w-5xl mx-auto px-4 mt-8">
                <CourseBasicInfo
                    course={course}
                    updatingThumbnail={updatingThumbnail}
                    fileInputRef={fileInputRef}
                    handleThumbnailChange={handleThumbnailChange}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    savingInfo={savingInfo}
                    handleSaveInfo={handleSaveInfo}
                    formData={formData}
                    setFormData={setFormData}
                    categories={categories}
                    objectives={objectives}
                    setObjectives={setObjectives}
                />

                <CourseCurriculum
                    course={course}
                    openDeleteConfirm={openDeleteConfirm}
                    previewLessonId={previewLessonId}
                    setPreviewLessonId={setPreviewLessonId}
                    getSmartLessonType={getSmartLessonType}
                    getLessonTypeLabel={getLessonTypeLabel}
                    getLessonVideoUrl={getLessonVideoUrl}
                    activeSectionId={activeSectionId}
                    setActiveSectionId={setActiveSectionId}
                    handleAddLesson={handleAddLesson}
                    handleCancelAddLesson={handleCancelAddLesson}
                    lessonTitle={lessonTitle}
                    setLessonTitle={setLessonTitle}
                    lessonType={lessonType as any}
                    setLessonType={setLessonType}
                    lessonFile={lessonFile}
                    setLessonFile={setLessonFile}
                    lessonInputRef={lessonInputRef}
                    textContent={textContent}
                    setTextContent={setTextContent}
                    quizQuestions={quizQuestions}
                    handleQuizChange={handleQuizChange}
                    handleDeleteQuestion={handleDeleteQuestion}
                    handleAddQuestion={handleAddQuestion}
                    uploadingLesson={uploadingLesson}
                    isAddingSection={isAddingSection}
                    setIsAddingSection={setIsAddingSection}
                    newSectionTitle={newSectionTitle}
                    setNewSectionTitle={setNewSectionTitle}
                    handleAddSection={handleAddSection}
                />
            </div>
        </div>
    );
}