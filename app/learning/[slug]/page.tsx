'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    PlayCircle, ChevronLeft, Menu, Loader2, CheckCircle, Circle, Trophy
} from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse, ILesson, ISection } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti'; // (Tùy chọn) Hiệu ứng pháo hoa khi hoàn thành 100%

export default function LearningPage() {
    const params = useParams();
    const router = useRouter();

    const [course, setCourse] = useState<ICourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState<ILesson | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // --- 1. STATE MỚI CHO TIẾN ĐỘ ---
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [progressPercent, setProgressPercent] = useState(0);
    // -------------------------------

    // Fetch dữ liệu khóa học
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // 1. Lấy thông tin khóa học
                const { data: courseRes } = await axiosClient.get(`/courses/${params.slug}`);
                if (courseRes.success) {
                    const courseData = courseRes.data;
                    setCourse(courseData);

                    // Mặc định phát bài đầu tiên
                    if (courseData.sections.length > 0 && courseData.sections[0].lessons.length > 0) {
                        setCurrentLesson(courseData.sections[0].lessons[0]);
                    }

                    // 2. Lấy tiến độ học tập (Gọi API mới làm)
                    try {
                        const { data: progressRes } = await axiosClient.get(`/progress/${courseData._id}`);
                        if (progressRes.success) {
                            const completedIds = progressRes.data.completedLessons;
                            setCompletedLessons(completedIds);

                            // Nếu có lưu bài học lần trước xem dở thì mở bài đó (Optional feature)
                            if (progressRes.data.lastAccessedLesson) {
                                // Tìm lesson object từ ID
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
                        console.error("Lỗi lấy tiến độ", err);
                    }
                }
            } catch (error) {
                toast.error("Không thể tải khóa học");
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) fetchCourseData();
    }, [params.slug]);

    // --- TÍNH TOÁN % TIẾN ĐỘ ---
    useEffect(() => {
        if (!course) return;
        // Đếm tổng số bài học
        const totalLessons = course.sections.reduce((acc, sec) => acc + sec.lessons.length, 0);
        if (totalLessons === 0) return;

        const percent = Math.round((completedLessons.length / totalLessons) * 100);
        setProgressPercent(percent);

        // Hiệu ứng pháo hoa khi đạt 100%
        if (percent === 100) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            toast.success("Chúc mừng! Bạn đã hoàn thành khóa học.", { icon: '🏆' });
        }
    }, [completedLessons, course]);


    // --- HÀM XỬ LÝ KHI XEM XONG VIDEO ---
    const handleVideoEnded = async () => {
        if (!currentLesson || !course) return;

        // Nếu bài này đã xong rồi thì thôi không gọi API nữa
        if (completedLessons.includes(currentLesson._id)) return;

        // Optimistic UI: Cập nhật giao diện trước cho mượt
        const newCompleted = [...completedLessons, currentLesson._id];
        setCompletedLessons(newCompleted);
        toast.success("Đã hoàn thành bài học!");

        // Gọi API lưu xuống DB
        try {
            await axiosClient.post('/progress/mark-completed', {
                courseId: course._id,
                lessonId: currentLesson._id
            });
        } catch (error) {
            console.error("Lỗi lưu tiến độ");
            // Nếu lỗi thì revert lại state (tùy chọn)
        }
    };

    // Hàm chọn bài
    const handleSelectLesson = (lesson: ILesson) => {
        setCurrentLesson(lesson);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const getVideoUrl = (videoData: any) => {
        if (!videoData) return '';
        if (typeof videoData === 'string') return videoData;
        if (typeof videoData === 'object' && videoData.url) return videoData.url;
        return '';
    };

    if (loading) return <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50"><Loader2 className="text-white w-10 h-10 animate-spin" /></div>;
    if (!course) return <div className="p-10 text-center">Không tìm thấy khóa học</div>;

    const currentVideoUrl = currentLesson ? getVideoUrl(currentLesson.video) : '';

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
            <Toaster position="bottom-right" />

            {/* HEADER */}
            <div className="h-14 bg-gray-900 text-white flex items-center justify-between px-4 flex-shrink-0 shadow-md z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="hover:bg-gray-700 p-2 rounded-full transition text-gray-300 hover:text-white">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-bold text-sm md:text-base line-clamp-1">{course.title}</h1>
                </div>

                {/* PROGRESS BAR */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-300 font-bold">{progressPercent}% hoàn thành</span>
                        {progressPercent === 100 && <span className="text-[10px] text-green-400 flex items-center gap-1"><Trophy className="w-3 h-3" /> Đã nhận chứng chỉ</span>}
                    </div>
                    <div className="w-40 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* TRÁI: VIDEO */}
                <div className="flex-1 bg-black flex flex-col relative overflow-y-auto">
                    {currentLesson ? (
                        <>
                            <div className="w-full bg-black aspect-video flex items-center justify-center sticky top-0 z-10 shadow-lg border-b border-gray-800">
                                {currentVideoUrl ? (
                                    <video
                                        key={currentLesson._id}
                                        controls
                                        autoPlay
                                        className="w-full h-full max-h-[80vh]"
                                        controlsList="nodownload"
                                        poster={course.thumbnail?.url}
                                        // --- BẮT SỰ KIỆN KHI XEM HẾT VIDEO ---
                                        onEnded={handleVideoEnded}
                                    // ------------------------------------
                                    >
                                        <source src={currentVideoUrl} type="video/mp4" />
                                        Trình duyệt không hỗ trợ video.
                                    </video>
                                ) : (
                                    <div className="text-white text-center p-10 bg-gray-900 rounded">
                                        <p className="mb-2 text-lg">Bài học lý thuyết</p>
                                        {/* Nút bấm thủ công cho bài lý thuyết */}
                                        <button
                                            onClick={handleVideoEnded}
                                            className={`mt-4 px-6 py-2 rounded font-bold transition ${completedLessons.includes(currentLesson._id)
                                                    ? 'bg-green-600 text-white cursor-default'
                                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                                }`}
                                        >
                                            {completedLessons.includes(currentLesson._id) ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-6 md:p-8 min-h-[500px]">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentLesson.title}</h2>
                                <div className="prose max-w-none text-gray-700 leading-relaxed">
                                    <p>Mô tả bài học...</p>
                                </div>
                            </div>
                        </>
                    ) : <div className="flex items-center justify-center h-full text-gray-500">Chọn bài học</div>}
                </div>

                {/* PHẢI: DANH SÁCH BÀI HỌC (SIDEBAR) */}
                <div className={`w-80 md:w-96 bg-white border-l border-gray-200 flex-shrink-0 flex flex-col transition-transform duration-300 absolute md:relative right-0 h-full z-20 shadow-xl md:shadow-none ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                    <div className="p-4 border-b border-gray-200 font-bold text-gray-800 bg-gray-50 flex justify-between items-center">
                        <span>Nội dung khóa học</span>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500">X</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pb-20">
                        {course.sections.map((section: ISection) => (
                            <div key={section._id}>
                                <div className="bg-gray-100 px-4 py-3 text-sm font-bold text-gray-900 border-b border-gray-200 sticky top-0 z-10">{section.title}</div>
                                <div>
                                    {section.lessons.map((lesson: ILesson, lIndex: number) => {
                                        const isActive = currentLesson?._id === lesson._id;
                                        // Kiểm tra xem bài học này đã hoàn thành chưa
                                        const isCompleted = completedLessons.includes(lesson._id);

                                        return (
                                            <div
                                                key={lesson._id}
                                                onClick={() => handleSelectLesson(lesson)}
                                                className={`px-4 py-3 cursor-pointer flex gap-3 items-start border-b border-gray-100 transition ${isActive ? 'bg-purple-50 border-l-4 border-l-purple-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                                            >
                                                {/* ICON TRẠNG THÁI */}
                                                <div className="mt-0.5">
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600 fill-green-100" />
                                                    ) : isActive ? (
                                                        <PlayCircle className="w-5 h-5 text-purple-600" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <p className={`text-sm ${isActive ? 'font-bold text-purple-700' : 'text-gray-700'}`}>
                                                        {lIndex + 1}. {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <PlayCircle className="w-3 h-3" />
                                                            {(lesson.video as any)?.duration ? `${Math.floor((lesson.video as any).duration / 60)}p` : 'Video'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}