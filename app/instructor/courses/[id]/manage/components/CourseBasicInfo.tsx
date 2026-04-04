import { Image as ImageIcon, Loader2, Edit3, Save, CheckCircle } from 'lucide-react';
import CourseObjectives from '@/components/instructor/CourseObjectives';
import { ICourse } from '@/types';

interface Props {
    course: ICourse;
    updatingThumbnail: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    savingInfo: boolean;
    handleSaveInfo: () => void;
    formData: any;
    setFormData: (val: any) => void;
    categories: any[];
    objectives: string[];
    setObjectives: (val: string[]) => void;
}

export default function CourseBasicInfo({
    course, updatingThumbnail, fileInputRef, handleThumbnailChange,
    isEditing, setIsEditing, savingInfo, handleSaveInfo,
    formData, setFormData, categories, objectives, setObjectives
}: Props) {
    return (
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
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                Giá bán (VND) <span className="text-purple-500 lowercase font-medium ml-1">(Nhập 0 để miễn phí)</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    min="0"
                                    step="50000"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                />
                            ) : (
                                <p className={`text-lg font-bold ${course.price === 0 ? 'text-green-600 uppercase' : 'text-purple-600'}`}>
                                    {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} đ`}
                                </p>
                            )}
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
                                <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500" />
                                <CourseObjectives objectives={objectives} setObjectives={setObjectives} />
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600 whitespace-pre-line">{course.description || "Chưa có mô tả"}</p>
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}