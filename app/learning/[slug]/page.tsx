'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    PlayCircle, ChevronLeft, Menu, Loader2, CheckCircle,
    FileText, HelpCircle, Circle, Trophy, Check
} from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { ICourse, ILesson, ISection } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import confetti from 'canvas-confetti'; //

// --- COMPONENT CON: QUIZ VIEW (Giữ nguyên) ---
const QuizView = ({ questions, onPass }: { questions: any[], onPass: () => void }) => {
    const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleSelect = (qIndex: number, optIndex: number) => {
        if (submitted) return;
        const newAns = [...answers];
        newAns[qIndex] = optIndex;
        setAnswers(newAns);
    };

    const handleSubmit = () => {
        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });
        const finalScore = Math.round((correct / questions.length) * 100);
        setScore(finalScore);
        setSubmitted(true);

        if (finalScore >= 80) {
            onPass();
            toast.success(`Xuất sắc! Bạn đạt ${finalScore}%`);
        } else {
            toast.error(`Bạn đạt ${finalScore}%. Cần tối thiểu 80% để qua bài.`);
        }
    };

    const handleRetry = () => {
        setAnswers(new Array(questions.length).fill(-1));
        setSubmitted(false);
        setScore(0);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <HelpCircle className="text-purple-600" /> Bài kiểm tra kiến thức
                </h2>

                {!submitted ? (
                    <div className="space-y-8">
                        {questions.map((q, qIdx) => (
                            <div key={qIdx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="font-bold text-gray-800 mb-3">Câu {qIdx + 1}: {q.question}</p>
                                <div className="space-y-2">
                                    {q.options.map((opt: string, oIdx: number) => (
                                        <div
                                            key={oIdx}
                                            onClick={() => handleSelect(qIdx, oIdx)}
                                            className={`p-3 rounded border cursor-pointer transition flex items-center gap-3 ${answers[qIdx] === oIdx
                                                ? 'bg-purple-100 border-purple-500 text-purple-900'
                                                : 'bg-white border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${answers[qIdx] === oIdx ? 'border-purple-600 bg-purple-600' : 'border-gray-400'}`}>
                                                {answers[qIdx] === oIdx && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleSubmit}
                            disabled={answers.includes(-1)}
                            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                        >
                            Nộp bài
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="mb-4 inline-block p-4 rounded-full bg-gray-100">
                            {score >= 80 ? <Trophy className="w-16 h-16 text-yellow-500" /> : <Loader2 className="w-16 h-16 text-gray-400" />}
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-2">{score}%</h3>
                        <p className={`text-lg mb-8 ${score >= 80 ? 'text-green-600 font-bold' : 'text-red-500'}`}>
                            {score >= 80 ? 'Bạn đã vượt qua bài kiểm tra!' : 'Chưa đạt yêu cầu. Hãy thử lại nhé.'}
                        </p>

                        {score < 80 && (
                            <button onClick={handleRetry} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition">
                                Làm lại bài thi
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- TRANG CHÍNH ---
export default function LearningPage() {
    const params = useParams();
    const router = useRouter();

    const [course, setCourse] = useState<ICourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState<ILesson | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [progressPercent, setProgressPercent] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: courseRes } = await axiosClient.get(`/courses/${params.slug}`);
                if (courseRes.success) {
                    const courseData = courseRes.data;

                    // --- DEBUG: Log để kiểm tra xem lesson có trường type không ---
                    console.log("Course Data Loaded:", courseData);

                    setCourse(courseData);

                    if (courseData.sections.length > 0 && courseData.sections[0].lessons.length > 0) {
                        setCurrentLesson(courseData.sections[0].lessons[0]);
                    }

                    try {
                        const { data: progressRes } = await axiosClient.get(`/progress/${courseData._id}`);
                        if (progressRes.success) {
                            setCompletedLessons(progressRes.data.completedLessons);
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
    }, [params.slug]);

    // --- LOGIC TÍNH TOÁN TIẾN ĐỘ & PHÁO HOA ĐÃ SỬA ---
    useEffect(() => {
        if (!course) return;

        // 1. Lấy tất cả ID bài học hợp lệ hiện có trong khóa học
        const allLessonIds = course.sections.flatMap(sec => sec.lessons.map(l => l._id));
        const totalLessons = allLessonIds.length;

        if (totalLessons === 0) return;

        // 2. Lọc danh sách completedLessons: Chỉ đếm những bài thực sự nằm trong khóa học hiện tại
        const validCompletedCount = completedLessons.filter(id => allLessonIds.includes(id)).length;

        // 3. Tính phần trăm dựa trên số lượng hợp lệ
        const percent = Math.round((validCompletedCount / totalLessons) * 100);
        setProgressPercent(percent);

        // 4. Bắn pháo hoa nếu đạt 100%
        if (percent === 100) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [completedLessons, course]);
    // ----------------------------------------------------

    const handleLessonComplete = async () => {
        if (!currentLesson || !course) return;
        if (completedLessons.includes(currentLesson._id)) return;

        const newCompleted = [...completedLessons, currentLesson._id];
        setCompletedLessons(newCompleted);
        toast.success("Đã hoàn thành bài học!", { icon: '🎉' });

        try {
            await axiosClient.post('/progress/mark-completed', {
                courseId: course._id,
                lessonId: currentLesson._id
            });
        } catch (error) {
            console.error("Lỗi lưu tiến độ");
        }
        goToNextLesson();
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
                return (
                    <div className="w-full bg-black aspect-video flex items-center justify-center sticky top-0 z-10 shadow-lg">
                        {videoUrl ? (
                            <video
                                key={currentLesson._id}
                                src={videoUrl}
                                controls
                                autoPlay
                                className="w-full h-full max-h-[80vh]"
                                controlsList="nodownload"
                                onEnded={handleLessonComplete}
                            />
                        ) : (
                            <div className="text-white">Video đang cập nhật...</div>
                        )}
                    </div>
                );

            case 'text':
                return (
                    <div className="flex-1 bg-white overflow-y-auto">
                        <div className="max-w-4xl mx-auto p-8 md:p-12 min-h-[80vh]">

                            {/* --- HEADER CỦA BÀI TEXT (Đã sửa nút bấm lên đây) --- */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 mb-6 gap-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                                    {currentLesson.title}
                                </h1>

                                {/* Nút Đánh dấu hoàn thành nhỏ gọn */}
                                <button
                                    onClick={handleLessonComplete}
                                    disabled={completedLessons.includes(currentLesson._id)}
                                    className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm whitespace-nowrap
                                    ${completedLessons.includes(currentLesson._id)
                                            ? 'bg-green-100 text-green-700 cursor-default border border-green-200'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-purple-600 hover:border-purple-300'
                                        }
                                  `}
                                >
                                    {completedLessons.includes(currentLesson._id) ? (
                                        <><CheckCircle className="w-4 h-4" /> Đã hoàn thành</>
                                    ) : (
                                        <><Check className="w-4 h-4" /> Đánh dấu đã đọc</>
                                    )}
                                </button>
                            </div>
                            {/* --------------------------------------------------- */}

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
                                questions={currentLesson.quizQuestions}
                                onPass={handleLessonComplete}
                            />
                        ) : (
                            <div className="p-10 text-center text-gray-500">Bài tập đang được cập nhật...</div>
                        )}
                    </div>
                );

            default:
                return <div className="p-10 text-center text-red-500">Định dạng bài học không hỗ trợ.</div>;
        }
    };

    if (loading) return <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50"><Loader2 className="text-white w-10 h-10 animate-spin" /></div>;
    if (!course) return <div className="p-10 text-center">Không tìm thấy khóa học</div>;

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
            <Toaster position="bottom-right" />

            {/* HEADER */}
            <div className="h-16 bg-gray-900 text-white flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-md z-20">
                <div className="flex items-center gap-4">
                    <Link href="/my-courses" className="hover:bg-gray-700 p-2 rounded-full transition text-gray-300 hover:text-white">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-sm md:text-lg line-clamp-1">{course.title}</h1>
                        <p className="text-xs text-gray-400 hidden md:block">Đang học: {currentLesson?.title}</p>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-300 font-bold">{progressPercent}% hoàn thành</span>
                    </div>
                    <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                <button className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* BODY */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* VÙNG HIỂN THỊ NỘI DUNG (TRÁI) */}
                <div className="flex-1 flex flex-col relative bg-gray-100 overflow-hidden">
                    {renderLessonContent()}
                </div>

                {/* SIDEBAR (PHẢI) */}
                <div className={`
          w-80 md:w-96 bg-white border-l border-gray-200 flex-shrink-0 flex flex-col
          transition-transform duration-300 absolute md:relative right-0 h-full z-20 shadow-2xl md:shadow-none
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <span className="font-bold text-gray-800">Nội dung khóa học</span>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 p-2">X</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pb-20">
                        {course.sections.map((section: ISection) => (
                            <div key={section._id}>
                                <div className="bg-gray-100 px-4 py-3 text-sm font-bold text-gray-900 border-b border-gray-200 sticky top-0 z-10 truncate">
                                    {section.title}
                                </div>
                                <div>
                                    {section.lessons.map((lesson: ILesson, lIndex: number) => {
                                        const isActive = currentLesson?._id === lesson._id;
                                        const isCompleted = completedLessons.includes(lesson._id);
                                        const type = lesson.type || 'video';

                                        return (
                                            <div
                                                key={lesson._id}
                                                onClick={() => {
                                                    setCurrentLesson(lesson);
                                                    if (window.innerWidth < 768) setSidebarOpen(false);
                                                }}
                                                className={`
                            px-4 py-3 cursor-pointer flex gap-3 items-start border-b border-gray-100 transition
                            ${isActive ? 'bg-purple-50 border-l-4 border-l-purple-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}
                          `}
                                            >
                                                <div className="mt-0.5 flex-shrink-0">
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600 fill-green-100" />
                                                    ) : (
                                                        <Circle className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-300'}`} />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm line-clamp-2 ${isActive ? 'font-bold text-purple-700' : 'text-gray-700'}`}>
                                                        {lIndex + 1}. {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        {type === 'video' ? <PlayCircle className="w-3 h-3 text-gray-400" />
                                                            : type === 'text' ? <FileText className="w-3 h-3 text-blue-400" />
                                                                : <HelpCircle className="w-3 h-3 text-orange-400" />}

                                                        <span className="text-xs text-gray-500">
                                                            {type === 'video' && (lesson.video as any)?.duration
                                                                ? `${Math.floor((lesson.video as any).duration / 60)} phút`
                                                                : type === 'text' ? 'Bài đọc' : 'Trắc nghiệm'}
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