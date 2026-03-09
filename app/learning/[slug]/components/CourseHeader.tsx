import Link from 'next/link';
// Import thêm ToggleLeft và ToggleRight
import { ChevronLeft, Menu, ToggleLeft, ToggleRight } from 'lucide-react';
import { ICourse, ILesson } from '@/types';

interface Props {
    course: ICourse;
    currentLesson: ILesson | null;
    progressPercent: number;
    sidebarOpen: boolean;
    setSidebarOpen: (val: boolean) => void;
    // --- Thêm 2 props mới để điều khiển Tự động chuyển bài ---
    autoAdvance: boolean;
    setAutoAdvance: (val: boolean) => void;
}

export default function CourseHeader({ course, currentLesson, progressPercent, sidebarOpen, setSidebarOpen, autoAdvance, setAutoAdvance }: Props) {
    return (
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

            <div className="flex items-center gap-2 md:gap-4">
                {/* THANH TIẾN ĐỘ */}
                <div className="hidden lg:flex items-center gap-4 mr-2">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-300 font-bold">{progressPercent}% hoàn thành</span>
                    </div>
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                {/* --- NÚT TỰ ĐỘNG CHUYỂN BÀI --- */}
                <button
                    onClick={() => setAutoAdvance(!autoAdvance)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition text-gray-300 hover:text-white"
                    title={autoAdvance ? "Tắt tự động chuyển sang bài tiếp theo" : "Bật tự động chuyển sang bài tiếp theo"}
                >
                    <span className="hidden md:block text-sm font-medium">Tự động phát</span>
                    {autoAdvance ? (
                        <ToggleRight className="w-7 h-7 text-purple-500" />
                    ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-500" />
                    )}
                </button>
                {/* --------------------------------- */}

                <div className="w-px h-6 bg-gray-700 mx-1"></div> {/* Đường kẻ dọc phân cách */}

                {/* NÚT ĐÓNG/MỞ SIDEBAR */}
                <button
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-gray-300 hover:text-white flex items-center gap-2"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <Menu className="w-5 h-5" />
                    <span className="hidden md:block text-sm font-bold">
                        {sidebarOpen ? 'Đóng' : 'Nội dung'}
                    </span>
                </button>
            </div>
        </div>
    );
}