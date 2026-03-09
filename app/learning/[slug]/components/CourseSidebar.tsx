import { PlayCircle, FileText, HelpCircle, Download, Circle, CheckCircle, X } from 'lucide-react';
import { ICourse, ILesson, ISection } from '@/types';

interface Props {
    course: ICourse;
    currentLesson: ILesson | null;
    completedLessons: string[];
    setCurrentLesson: (lesson: ILesson) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (val: boolean) => void;
}

export default function CourseSidebar({ course, currentLesson, completedLessons, setCurrentLesson, sidebarOpen, setSidebarOpen }: Props) {
    return (
        <div className={`
            bg-white flex-shrink-0 h-full z-20 absolute md:relative right-0
            transition-all duration-300 ease-in-out overflow-hidden
            /* Khi đóng: Thu độ rộng về 0 và làm mờ */
            ${sidebarOpen ? 'w-80 md:w-96 border-l border-gray-200 translate-x-0 opacity-100' : 'w-0 border-none translate-x-full md:translate-x-0 opacity-0'}
        `}>
            {/* Vỏ bọc cố định chiều rộng (Chống bị dồn chữ khi đang chạy hiệu ứng đóng) */}
            <div className="w-80 md:w-96 h-full flex flex-col bg-white">

                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                    <span className="font-bold text-gray-800">Nội dung khóa học</span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-gray-400 hover:text-gray-800 p-1.5 rounded-md hover:bg-gray-200 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
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
                                                            : type === 'quiz' ? <HelpCircle className="w-3 h-3 text-orange-400" />
                                                                : <Download className="w-3 h-3 text-red-400" />
                                                    }

                                                    <span className="text-xs text-gray-500">
                                                        {type === 'video' ? (
                                                            (lesson.video as any)?.duration
                                                                ? `${Math.floor((lesson.video as any).duration / 60)} phút`
                                                                : 'Video'
                                                        ) : type === 'text' ? 'Bài đọc'
                                                            : type === 'quiz' ? 'Trắc nghiệm'
                                                                : 'Tài liệu PDF'}
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
    );
}