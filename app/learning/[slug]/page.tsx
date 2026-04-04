'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, FileText, CheckCircle, Check, ChevronLeft } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse, ILesson } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

// Import Components
import CourseHeader from './components/CourseHeader';
import CourseSidebar from './components/CourseSidebar';
import QuizView from './components/QuizView';
import DocumentViewer from './components/DocumentViewer';
import VideoPlayer, { VideoPlayerRef } from './components/VideoPlayer';
import NotesTab from './components/NotesTab';

export default function LearningPage() {
    const params = useParams();
    const router = useRouter();

    const [course, setCourse] = useState<ICourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState<ILesson | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [progressPercent, setProgressPercent] = useState(0);
    const [certificateId, setCertificateId] = useState<string | null>(null);

    const videoPlayerRef = useRef<VideoPlayerRef>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: courseRes } = await axiosClient.get(`/courses/${params.slug}`);
                if (courseRes.success) {
                    const courseData = courseRes.data;
                    setCourse(courseData);

                    if (courseData.sections.length > 0 && courseData.sections[0].lessons.length > 0) {
                        setCurrentLesson(courseData.sections[0].lessons[0]);
                    }

                    try {
                        const { data: progressRes } = await axiosClient.get(`/progress/${courseData._id}`);
                        if (progressRes.success) {
                            setCompletedLessons(progressRes.data.completedLessons);
                            if (progressRes.data.certificateId) {
                                setCertificateId(progressRes.data.certificateId);
                            }
                            if (progressRes.data.lastAccessedLesson) {
                                for (const sec of courseData.sections) {
                                    const found = sec.lessons.find((l: ILesson) => l._id === progressRes.data.lastAccessedLesson);
                                    if (found) {
                                        setCurrentLesson(found);
                                        break;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.log("Chưa có tiến độ, bắt đầu mới.");
                    }
                }
            } catch (error) {
                toast.error("Không thể tải dữ liệu khóa học");
                router.push('/my-courses');
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) fetchData();
    }, [params.slug, router]);

    useEffect(() => {
        if (!course) return;
        const allLessonIds = course.sections.flatMap(sec => sec.lessons.map(l => l._id));
        const totalLessons = allLessonIds.length;
        if (totalLessons === 0) return;

        const validCompletedCount = completedLessons.filter(id => allLessonIds.includes(id)).length;
        const percent = Math.round((validCompletedCount / totalLessons) * 100);
        setProgressPercent(percent);
    }, [completedLessons, course]);

    // 💡 SỬA: Nhận tham số score tùy chọn (cho bài Quiz)
    const handleLessonComplete = async (score?: number) => {
        if (!currentLesson || !course) return;
        if (completedLessons.includes(currentLesson._id)) return;

        // Cập nhật State cục bộ ngay lập tức để Sidebar mở khóa
        const newCompleted = [...completedLessons, currentLesson._id];
        setCompletedLessons(newCompleted);
        toast.success("Đã hoàn thành bài học!", { icon: '🎉' });

        try {
            // 💡 GỬI KÈM SCORE LÊN BACKEND ĐỂ QUA CỬA BẢO MẬT
            const { data } = await axiosClient.post('/progress/mark-completed', {
                courseId: course._id,
                lessonId: currentLesson._id,
                score: score
            });

            if (data.certificateId) {
                setCertificateId(data.certificateId);
            }

            // Xóa phần showCongratsModal ở đây theo yêu cầu
            if (autoAdvance) {
                goToNextLesson();
            }

        } catch (error) {
            console.error("Lỗi lưu tiến độ");
        }
    };

    const goToNextLesson = () => {
        if (!course || !currentLesson) return;
        const allLessons = course.sections.flatMap(s => s.lessons);
        const currentIndex = allLessons.findIndex(l => l._id === currentLesson._id);

        if (currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            setTimeout(() => {
                setCurrentLesson(nextLesson);
                toast('Đang chuyển sang bài tiếp theo...', { icon: '⏭️' });
            }, 3000);
        }
    };

    const allLessons = course?.sections.flatMap(s => s.lessons) || [];
    const currentIndex = allLessons.findIndex(l => l._id === currentLesson?._id);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    const handleNavigate = (lesson: ILesson) => {
        setCurrentLesson(lesson);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const getVideoUrl = (videoData: any) => {
        if (!videoData) return '';
        if (typeof videoData === 'string') return videoData;
        if (typeof videoData === 'object' && videoData.url) return videoData.url;
        return '';
    };

    const renderLessonContent = () => {
        if (!currentLesson) return <div className="p-20 text-center text-gray-500">Đang tải nội dung...</div>;
        const lessonType = currentLesson.type || 'video';

        switch (lessonType) {
            case 'video':
                const videoUrl = getVideoUrl(currentLesson.video);
                return videoUrl ? (
                    <div className="flex flex-col w-full">
                        <VideoPlayer
                            ref={videoPlayerRef}
                            videoUrl={videoUrl}
                            lessonId={currentLesson._id}
                            onEnded={() => handleLessonComplete()} // Video không cần score
                        />
                        <NotesTab
                            lessonId={currentLesson._id}
                            getCurrentTime={() => videoPlayerRef.current?.getCurrentTime() || 0}
                            seekTo={(time) => videoPlayerRef.current?.seekTo(time)}
                        />
                    </div>
                ) : (
                    <div className="w-full bg-black aspect-video flex items-center justify-center text-white">
                        Video đang cập nhật...
                    </div>
                );

            case 'text':
                return (
                    <div className="flex-1 bg-white overflow-y-auto">
                        <div className="max-w-4xl mx-auto p-8 md:p-12 min-h-[80vh]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 mb-6 gap-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" /> {currentLesson.title}
                                </h1>
                                <button
                                    onClick={() => handleLessonComplete()} // Text không cần score
                                    disabled={completedLessons.includes(currentLesson._id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm whitespace-nowrap ${completedLessons.includes(currentLesson._id) ? 'bg-green-100 text-green-700 cursor-default border border-green-200' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-purple-600 hover:border-purple-300'}`}
                                >
                                    {completedLessons.includes(currentLesson._id) ? <><CheckCircle className="w-4 h-4" /> Đã hoàn thành</> : <><Check className="w-4 h-4" /> Đánh dấu đã đọc</>}
                                </button>
                            </div>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {currentLesson.content || "Chưa có nội dung văn bản."}
                            </div>
                        </div>
                    </div>
                );

            case 'quiz':
                return (
                    <div className="flex-1 bg-gray-50 overflow-y-auto">
                        {currentLesson.quizQuestions && currentLesson.quizQuestions.length > 0 ? (
                            <QuizView
                                key={currentLesson._id}
                                questions={currentLesson.quizQuestions}
                                passPercent={currentLesson.passPercent}
                                onPass={handleLessonComplete} // 💡 Sẽ truyền điểm số lên đây
                            />
                        ) : <div className="p-10 text-center text-gray-500">Bài tập đang được cập nhật...</div>}
                    </div>
                );

            case 'document':
                return <DocumentViewer lesson={currentLesson} isCompleted={completedLessons.includes(currentLesson._id)} onComplete={() => handleLessonComplete()} />;

            default:
                return <div className="p-10 text-center text-red-500">Định dạng bài học không hỗ trợ.</div>;
        }
    };

    if (loading) return <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50"><Loader2 className="text-white w-10 h-10 animate-spin" /></div>;
    if (!course) return <div className="p-10 text-center">Không tìm thấy khóa học</div>;

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
            <Toaster position="bottom-right" />
            <CourseHeader course={course} currentLesson={currentLesson} progressPercent={progressPercent} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} autoAdvance={autoAdvance} setAutoAdvance={setAutoAdvance} />

            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 flex flex-col relative bg-gray-100 overflow-hidden">
                    <div className="flex-1 overflow-y-auto flex flex-col">
                        {renderLessonContent()}
                    </div>

                    {currentLesson && allLessons.length > 0 && (
                        <div className="bg-white border-t border-gray-200 p-4 md:px-8 flex items-center justify-between shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20">
                            {prevLesson ? (
                                <button onClick={() => handleNavigate(prevLesson)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition border border-gray-200">
                                    <ChevronLeft className="w-5 h-5" /> Bài trước
                                </button>
                            ) : <div />}

                            {/* Đã xóa phần thông báo Đã Hoàn Thành Khóa Học */}
                            {nextLesson ? (
                                // 💡 LOGIC MỚI: Nếu là bài Quiz VÀ chưa pass -> Khóa nút lại
                                currentLesson.type === 'quiz' && !completedLessons.includes(currentLesson._id) ? (
                                    <button
                                        disabled
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-400 rounded-lg font-bold cursor-not-allowed"
                                        title="Bạn phải hoàn thành bài kiểm tra để đi tiếp"
                                    >
                                        Hoàn thành Quiz để tiếp tục <ChevronLeft className="w-5 h-5 rotate-180" />
                                    </button>
                                ) : (
                                    // Nếu không phải quiz, hoặc là quiz đã pass -> Hiển thị nút bình thường
                                    <button onClick={() => handleNavigate(nextLesson)} className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold transition shadow-md">
                                        Bài tiếp theo <ChevronLeft className="w-5 h-5 rotate-180" />
                                    </button>
                                )
                            ) : (
                                <div className="flex flex-wrap items-center gap-3">
                                    {certificateId && (
                                        <button onClick={() => window.open(`/certificate/${certificateId}`, '_blank')} className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-bold transition shadow-md">
                                            🏆 Xem chứng chỉ
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <CourseSidebar course={course} currentLesson={currentLesson} completedLessons={completedLessons} setCurrentLesson={setCurrentLesson} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </div>
        </div>
    );
}