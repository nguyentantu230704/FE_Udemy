'use client';

import { ISection } from '@/types';
import { ChevronDown, ChevronUp, PlayCircle, Lock, Tv } from 'lucide-react';
import { useState } from 'react';

interface Props {
    sections: ISection[];
}

export default function Curriculum({ sections }: Props) {
    // State quản lý việc đóng mở các chương. Mặc định mở chương đầu tiên.
    const [expandedSections, setExpandedSections] = useState<string[]>([sections[0]?._id]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId) // Đóng nếu đang mở
                : [...prev, sectionId] // Mở nếu đang đóng
        );
    };

    // Tính tổng số bài học
    const totalLessons = sections.reduce((acc, section) => acc + section.lessons.length, 0);

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nội dung khóa học</h2>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{sections.length} chương • {totalLessons} bài học</span>
                <button
                    className="text-purple-600 font-bold hover:text-purple-800"
                    onClick={() => setExpandedSections(sections.map(s => s._id))}
                >
                    Mở rộng tất cả
                </button>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white">
                {sections.map((section) => {
                    const isExpanded = expandedSections.includes(section._id);

                    return (
                        <div key={section._id} className="border-b border-gray-200 last:border-none">
                            {/* Header của Section */}
                            <div
                                className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
                                onClick={() => toggleSection(section._id)}
                            >
                                <div className="flex items-center gap-3">
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    <h3 className="font-bold text-gray-900">{section.title}</h3>
                                </div>
                                <span className="text-sm text-gray-500">{section.lessons.length} bài học</span>
                            </div>

                            {/* Danh sách bài học (Lessons) */}
                            {isExpanded && (
                                <div className="bg-white">
                                    {section.lessons.map((lesson) => (
                                        <div key={lesson._id} className="flex items-center justify-between p-3 pl-10 hover:bg-gray-50 transition border-b border-gray-100 last:border-none group">
                                            <div className="flex items-center gap-3">
                                                <Tv className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-700 group-hover:text-purple-600 cursor-pointer">
                                                    {lesson.title}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {lesson.isPreview ? (
                                                    <span className="text-xs text-purple-600 font-bold cursor-pointer underline">Học thử</span>
                                                ) : (
                                                    <Lock className="w-3 h-3 text-gray-400" />
                                                )}
                                                {lesson.duration && (
                                                    <span className="text-xs text-gray-500">
                                                        {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}