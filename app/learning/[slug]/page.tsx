'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlayCircle, ChevronLeft, Menu, Loader2, CheckCircle } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse, ILesson, ISection } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

export default function LearningPage() {
    const params = useParams();
    const router = useRouter();

    const [course, setCourse] = useState<ICourse | null>(null);
    const [loading, setLoading] = useState(true);

    // State quản lý bài học đang xem
    const [currentLesson, setCurrentLesson] = useState<ILesson | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // 1. Tải dữ liệu khóa học
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                // Gọi API lấy chi tiết khóa học theo Slug
                const { data } = await axiosClient.get(`/courses/${params.slug}`);
                if (data.success) {
                    const courseData = data.data;
                    setCourse(courseData);

                    // Mặc định chọn bài học đầu tiên của chương đầu tiên để phát
                    if (courseData.sections.length > 0 && courseData.sections[0].lessons.length > 0) {
                        setCurrentLesson(courseData.sections[0].lessons[0]);
                    }
                }
            } catch (error) {
                toast.error("Không thể tải khóa học");
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) fetchCourse();
    }, [params.slug]);

    // Hàm chọn bài học
    const handleSelectLesson = (lesson: ILesson) => {
        setCurrentLesson(lesson);
        // Trên mobile, khi chọn bài xong thì tự đóng sidebar
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    // Hàm lấy URL video an toàn (xử lý cả trường hợp object và string)
    const getVideoUrl = (videoData: any) => {
        if (!videoData) return '';
        if (typeof videoData === 'string') return videoData; // Trường hợp data cũ
        if (typeof videoData === 'object' && videoData.url) return videoData.url; // Trường hợp data mới (object)
        return '';
    };

    if (loading) return (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
            <Loader2 className="text-white w-10 h-10 animate-spin" />
        </div>
    );

    if (!course) return <div className="p-10 text-center">Không tìm thấy khóa học</div>;

    // Lấy URL video hiện tại để hiển thị
    const currentVideoUrl = currentLesson ? getVideoUrl(currentLesson.video) : '';

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
            <Toaster />

            {/* --- HEADER --- */}
            <div className="h-14 bg-gray-900 text-white flex items-center justify-between px-4 flex-shrink-0 shadow-md z-20">
                <div className="flex items-center gap-4">
                    <LinkBtn onClick={() => router.back()} icon={<ChevronLeft className="w-5 h-5" />} />
                    <h1 className="font-bold text-sm md:text-base line-clamp-1">{course.title}</h1>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <span className="text-xs text-gray-300">Tiến độ: 0%</span>
                    <div className="w-32 h-1 bg-gray-700 rounded-full">
                        <div className="w-0 h-full bg-purple-500 rounded-full"></div>
                    </div>
                </div>

                <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* KHUNG VIDEO (Trái) */}
                <div className="flex-1 bg-black flex flex-col relative overflow-y-auto">
                    {currentLesson ? (
                        <>
                            {/* VIDEO PLAYER */}
                            <div className="w-full bg-black aspect-video flex items-center justify-center sticky top-0 z-10 shadow-lg border-b border-gray-800">
                                {currentVideoUrl ? (
                                    <video
                                        // QUAN TRỌNG: Key giúp React nhận biết video đã đổi để reload
                                        key={currentLesson._id}
                                        controls
                                        autoPlay
                                        className="w-full h-full max-h-[80vh]"
                                        controlsList="nodownload" // Chặn nút download
                                        poster={course.thumbnail?.url} // Hiện ảnh bìa khóa học lúc chờ load
                                    >
                                        <source src={currentVideoUrl} type="video/mp4" />
                                        Trình duyệt của bạn không hỗ trợ thẻ video.
                                    </video>
                                ) : (
                                    <div className="text-white text-center p-10 bg-gray-900 rounded">
                                        <p className="mb-2 text-lg">Bài học này chưa có video.</p>
                                        <p className="text-sm text-gray-400">Vui lòng đọc tài liệu bên dưới.</p>
                                    </div>
                                )}
                            </div>

                            {/* THÔNG TIN BÀI HỌC */}
                            <div className="bg-white p-6 md:p-8 min-h-[500px]">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    {currentLesson.title}
                                </h2>
                                <div className="prose max-w-none text-gray-700 leading-relaxed">
                                    <p className="font-bold text-gray-900 mb-2">Mô tả bài học:</p>
                                    <p>
                                        {/* Nếu sau này có field description thì thay vào đây */}
                                        Chào mừng bạn đến với bài học "{currentLesson.title}".
                                        Hãy xem kỹ video và thực hành theo nhé. Nếu có thắc mắc hãy để lại câu hỏi ở phần Hỏi đáp.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Chọn một bài học để bắt đầu
                        </div>
                    )}
                </div>

                {/* DANH SÁCH BÀI HỌC (Phải - Sidebar) */}
                <div className={`
                    w-80 md:w-96 bg-white border-l border-gray-200 flex-shrink-0 flex flex-col
                    transition-transform duration-300 absolute md:relative right-0 h-full z-20 shadow-xl md:shadow-none
                    ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} 
                `}>
                    <div className="p-4 border-b border-gray-200 font-bold text-gray-800 bg-gray-50 flex justify-between items-center">
                        <span>Nội dung khóa học</span>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500">X</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pb-20">
                        {course.sections.map((section: ISection, sIndex: number) => (
                            <div key={section._id}>
                                {/* Tên Chương */}
                                <div className="bg-gray-100 px-4 py-3 text-sm font-bold text-gray-900 border-b border-gray-200 sticky top-0 z-10">
                                    {section.title}
                                </div>

                                {/* List Bài Học */}
                                <div>
                                    {section.lessons.map((lesson: ILesson, lIndex: number) => {
                                        const isActive = currentLesson?._id === lesson._id;
                                        return (
                                            <div
                                                key={lesson._id}
                                                onClick={() => handleSelectLesson(lesson)}
                                                className={`
                                                    px-4 py-3 cursor-pointer flex gap-3 items-start border-b border-gray-100 transition
                                                    ${isActive ? 'bg-purple-100 border-l-4 border-l-purple-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}
                                                `}
                                            >
                                                {/* Icon */}
                                                <div className="mt-0.5">
                                                    {isActive ? (
                                                        <PlayCircle className="w-4 h-4 text-purple-600 animate-pulse" />
                                                    ) : (
                                                        // Check circle giả lập (sau này có thể check if lesson.completed)
                                                        <div className="w-4 h-4 rounded-full border border-gray-400"></div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <p className={`text-sm ${isActive ? 'font-bold text-purple-700' : 'text-gray-700'}`}>
                                                        {lIndex + 1}. {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <PlayCircle className="w-3 h-3" />
                                                            {/* Xử lý hiển thị thời lượng an toàn */}
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

// Component phụ cho nút bấm header
function LinkBtn({ onClick, icon }: { onClick: () => void, icon: React.ReactNode }) {
    return (
        <button onClick={onClick} className="hover:bg-gray-700 p-2 rounded-full transition text-gray-300 hover:text-white">
            {icon}
        </button>
    )
}