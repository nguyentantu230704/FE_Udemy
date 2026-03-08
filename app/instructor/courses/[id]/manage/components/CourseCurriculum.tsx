import { Plus, Trash2, Video, HelpCircle, FileText, X, PlayCircle, Eye, UploadCloud, FileVideo, Trash, PlusCircle, Loader2 } from 'lucide-react';
import { ICourse } from '@/types';

interface Props {
    course: ICourse;
    openDeleteConfirm: (type: 'section' | 'lesson', id: string, title: string) => void;
    previewLessonId: string | null;
    setPreviewLessonId: (val: string | null) => void;
    getSmartLessonType: (lesson: any) => string;
    getLessonTypeLabel: (lesson: any) => string;
    getLessonVideoUrl: (videoData: any) => string;
    activeSectionId: string | null;
    setActiveSectionId: (val: string | null) => void;
    handleAddLesson: (e: React.FormEvent) => void;
    handleCancelAddLesson: () => void;
    lessonTitle: string;
    setLessonTitle: (val: string) => void;
    lessonType: string;
    setLessonType: (val: any) => void;
    lessonFile: File | null;
    setLessonFile: (val: File | null) => void;
    lessonInputRef: React.RefObject<HTMLInputElement | null>;
    textContent: string;
    setTextContent: (val: string) => void;
    quizQuestions: any[];
    handleQuizChange: (index: number, field: string, value: any, optIndex?: number) => void;
    handleDeleteQuestion: (index: number) => void;
    handleAddQuestion: () => void;
    uploadingLesson: boolean;
    isAddingSection: boolean;
    setIsAddingSection: (val: boolean) => void;
    newSectionTitle: string;
    setNewSectionTitle: (val: string) => void;
    handleAddSection: () => void;
}

export default function CourseCurriculum({
    course, openDeleteConfirm, previewLessonId, setPreviewLessonId,
    getSmartLessonType, getLessonTypeLabel, getLessonVideoUrl,
    activeSectionId, setActiveSectionId, handleAddLesson, handleCancelAddLesson,
    lessonTitle, setLessonTitle, lessonType, setLessonType,
    lessonFile, setLessonFile, lessonInputRef,
    textContent, setTextContent, quizQuestions, handleQuizChange, handleDeleteQuestion, handleAddQuestion,
    uploadingLesson, isAddingSection, setIsAddingSection, newSectionTitle, setNewSectionTitle, handleAddSection
}: Props) {
    return (
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
                            <button onClick={() => openDeleteConfirm('section', section._id, section.title)} className="text-red-500 hover:bg-red-50 p-2 rounded transition" title="Xóa chương">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2 pl-4 border-l-2 border-gray-200 ml-2 mb-4">
                            {section.lessons && section.lessons.length > 0 ? (
                                section.lessons.map((lesson, lIndex) => {
                                    const videoUrl = getLessonVideoUrl(lesson.video);
                                    const isPreviewing = previewLessonId === lesson._id;
                                    const currentType = getSmartLessonType(lesson);

                                    return (
                                        <div key={lesson._id || lIndex} className="bg-white p-3 rounded border border-gray-100 shadow-sm relative group">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    {currentType === 'video' ? <Video className="w-4 h-4 text-purple-600" />
                                                        : currentType === 'quiz' ? <HelpCircle className="w-4 h-4 text-orange-500" />
                                                            : currentType === 'document' ? <FileText className="w-4 h-4 text-red-500" /> // <--- Icon màu đỏ cho PDF
                                                                : <FileText className="w-4 h-4 text-blue-500" />}
                                                    <span className="text-sm font-medium">{lesson.title}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-400 capitalize">{getLessonTypeLabel(lesson)}</span>
                                                    <button onClick={() => setPreviewLessonId(isPreviewing ? null : lesson._id)} className={`p-1.5 rounded-full transition ${isPreviewing ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-500'}`} title="Xem trước">
                                                        {isPreviewing ? <X className="w-4 h-4" /> : (currentType === 'video' ? <PlayCircle className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
                                                    </button>
                                                    <button onClick={() => openDeleteConfirm('lesson', lesson._id, lesson.title)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition" title="Xóa bài học">
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {isPreviewing && (
                                                <div className="mt-3 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 animate-in slide-in-from-top-2 fade-in">
                                                    {currentType === 'video' && videoUrl ? (
                                                        <video controls className="w-full aspect-video max-h-[400px]" controlsList="nodownload"><source src={videoUrl} type="video/mp4" /></video>
                                                    ) : currentType === 'video' && !videoUrl ? (
                                                        <div className="p-4 text-center text-sm text-red-500">Video lỗi hoặc chưa tải lên.</div>
                                                    ) : null}

                                                    {currentType === 'text' && (
                                                        <div className="p-4 prose max-w-none text-sm bg-white">
                                                            <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">Nội dung bài học:</h4>
                                                            <div className="whitespace-pre-wrap text-gray-600">{lesson.content || "Chưa có nội dung."}</div>
                                                        </div>
                                                    )}

                                                    {currentType === 'document' && (
                                                        <div className="p-8 bg-white flex flex-col items-center justify-center">
                                                            <FileText className="w-12 h-12 text-red-500 mb-3" />
                                                            <p className="text-gray-800 font-bold mb-1">Tài liệu PDF đính kèm</p>
                                                            <p className="text-sm text-gray-500 mb-4">Bạn có thể bấm vào nút bên dưới để xem hoặc tải xuống.</p>
                                                            {lesson.document?.url ? (
                                                                <a href={lesson.document.url} target="_blank" rel="noopener noreferrer" className="bg-purple-100 text-purple-700 font-bold px-6 py-2 rounded-lg hover:bg-purple-200 transition">
                                                                    Mở tài liệu
                                                                </a>
                                                            ) : (
                                                                <p className="text-red-500 text-sm">Chưa có file tài liệu.</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {currentType === 'quiz' && (
                                                        <div className="p-4 bg-white">
                                                            <h4 className="font-bold text-gray-800 mb-3 border-b pb-1 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Danh sách câu hỏi ({lesson.quizQuestions?.length || 0})</h4>
                                                            <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                                                {lesson.quizQuestions?.map((q: any, i: number) => (
                                                                    <div key={i} className="text-sm border border-gray-100 p-3 rounded bg-gray-50">
                                                                        <p className="font-bold text-purple-700 mb-2">Câu {i + 1}: {q.question}</p>
                                                                        <ul className="pl-4 list-disc space-y-1 text-gray-600">
                                                                            {q.options?.map((opt: string, optIdx: number) => (
                                                                                <li key={optIdx} className={optIdx === q.correctAnswer ? "text-green-600 font-bold" : ""}>{opt} {optIdx === q.correctAnswer && "(Đúng)"}</li>
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
                                            {['video', 'text', 'quiz', 'document'].map((t) => (
                                                <label key={t} className={`flex items-center gap-2 px-4 py-2 rounded border cursor-pointer transition ${lessonType === t ? 'bg-purple-100 border-purple-500 text-purple-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                    <input type="radio" name="type" value={t} checked={lessonType === t} onChange={() => {
                                                        setLessonType(t as any);
                                                        setLessonFile(null); // <--- Thêm dòng này để reset bộ nhớ file
                                                    }} className="hidden" />
                                                    <span className="capitalize">{t === 'document' ? 'PDF' : t}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Giao diện upload cho Video HOẶC PDF */}
                                    {(lessonType === 'video' || lessonType === 'document') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {lessonType === 'video' ? 'Video bài giảng' : 'Tài liệu PDF'}
                                            </label>
                                            <div onClick={() => lessonInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition ${lessonFile ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}`}>
                                                {!lessonFile ? (
                                                    <>
                                                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                                                            <UploadCloud className="w-8 h-8 text-gray-500" />
                                                        </div>
                                                        <p className="font-medium text-gray-700">
                                                            {lessonType === 'video' ? 'Tải video lên (.mp4)' : 'Tải tài liệu lên (.pdf)'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="bg-purple-100 p-3 rounded-full mb-3">
                                                            {lessonType === 'video' ? <FileVideo className="w-8 h-8 text-purple-600" /> : <FileText className="w-8 h-8 text-purple-600" />}
                                                        </div>
                                                        <p className="font-bold text-gray-800 line-clamp-1 text-center">{lessonFile.name}</p>
                                                    </>
                                                )}
                                                <input
                                                    ref={lessonInputRef}
                                                    type="file"
                                                    accept={lessonType === 'video' ? "video/*" : ".pdf,application/pdf"}
                                                    className="hidden"
                                                    onChange={e => setLessonFile(e.target.files?.[0] || null)}
                                                />
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
                                            {/* GHI CHÚ: NẾU BẠN CÓ CODE AI QUIZ, HÃY CHÈN COMPONENT ĐÓ VÀO ĐÂY */}
                                            {quizQuestions.map((q, qIndex) => (
                                                <div key={qIndex} className="p-4 bg-white rounded border border-gray-200 relative shadow-sm">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="font-bold text-sm text-purple-700">Câu hỏi {qIndex + 1}</span>
                                                        {quizQuestions.length > 1 && <button type="button" onClick={() => handleDeleteQuestion(qIndex)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash className="w-4 h-4" /></button>}
                                                    </div>
                                                    <input type="text" className="w-full p-2 border rounded mb-3 text-sm focus:ring-1 focus:ring-purple-500" placeholder="Nhập câu hỏi..." value={q.question} onChange={e => handleQuizChange(qIndex, 'question', e.target.value)} required />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {q.options.map((opt: string, oIndex: number) => (
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

            <div className="mt-6">
                {isAddingSection && (
                    <div className="flex gap-2 items-center bg-gray-100 p-4 rounded border border-gray-200">
                        <input type="text" placeholder="Tên chương mới..." className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} />
                        <button onClick={handleAddSection} className="bg-gray-900 text-white px-4 py-2 rounded font-bold hover:bg-gray-800 transition">Lưu</button>
                        <button onClick={() => setIsAddingSection(false)} className="text-gray-500 px-2 hover:text-gray-700 transition">Hủy</button>
                    </div>
                )}
            </div>
        </div>
    );
}