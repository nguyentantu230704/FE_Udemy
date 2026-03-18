import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Edit3, Loader2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '@/utils/axiosClient';

// 💡 Cập nhật interface theo đúng chuẩn MongoDB trả về
interface Note {
    _id: string;
    time: number;
    content: string;
    createdAt: string;
}

interface Props {
    lessonId: string;
    getCurrentTime: () => number;
    seekTo: (time: number) => void;
}

export default function NotesTab({ lessonId, getCurrentTime, seekTo }: Props) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    // State cho việc Thêm mới
    const [newNote, setNewNote] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [capturedTime, setCapturedTime] = useState(0);
    const [saving, setSaving] = useState(false);

    // State cho việc Sửa (Edit)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [updating, setUpdating] = useState(false);

    // --- 1. LẤY DANH SÁCH GHI CHÚ TỪ API ---
    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const { data } = await axiosClient.get(`/notes/${lessonId}`);
                if (data.success) {
                    setNotes(data.data);
                }
            } catch (error) {
                console.error("Lỗi tải ghi chú:", error);
                toast.error("Không thể tải ghi chú của bạn.");
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) fetchNotes();
    }, [lessonId]);

    // Hàm chuyển đổi giây sang mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // --- 2. XỬ LÝ THÊM GHI CHÚ ---
    const handleStartTyping = () => {
        const time = getCurrentTime();
        setCapturedTime(time);
        setIsTyping(true);
    };

    const handleSaveNote = async () => {
        if (!newNote.trim()) return;
        setSaving(true);
        try {
            const { data } = await axiosClient.post('/notes', {
                lessonId,
                time: capturedTime,
                content: newNote
            });

            if (data.success) {
                // Thêm note mới vào mảng và sắp xếp lại theo thời gian
                setNotes(prev => [...prev, data.data].sort((a, b) => a.time - b.time));
                setNewNote('');
                setIsTyping(false);
                toast.success('Đã lưu ghi chú!');
            }
        } catch (error) {
            toast.error('Lỗi khi lưu ghi chú');
        } finally {
            setSaving(false);
        }
    };

    // --- 3. XỬ LÝ SỬA GHI CHÚ ---
    const handleStartEdit = (note: Note) => {
        setEditingId(note._id);
        setEditContent(note.content);
    };

    const handleUpdateNote = async (id: string) => {
        if (!editContent.trim()) return;
        setUpdating(true);
        try {
            const { data } = await axiosClient.put(`/notes/${id}`, {
                content: editContent
            });

            if (data.success) {
                setNotes(prev => prev.map(n => n._id === id ? { ...n, content: data.data.content } : n));
                setEditingId(null);
                toast.success('Đã cập nhật ghi chú!');
            }
        } catch (error) {
            toast.error('Lỗi khi cập nhật');
        } finally {
            setUpdating(false);
        }
    };

    // --- 4. XỬ LÝ XÓA GHI CHÚ ---
    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa ghi chú này?")) return;
        try {
            const { data } = await axiosClient.delete(`/notes/${id}`);
            if (data.success) {
                setNotes(prev => prev.filter(n => n._id !== id));
                toast.success('Đã xóa ghi chú');
            }
        } catch (error) {
            toast.error('Lỗi khi xóa ghi chú');
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="p-6 md:p-8 bg-white border-t border-gray-100 min-h-[400px]">
            <div className="flex items-center gap-2 mb-6">
                <Edit3 className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Ghi chú của tôi ({notes.length})</h3>
            </div>

            {/* --- KHU VỰC THÊM GHI CHÚ MỚI --- */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8">
                {isTyping ? (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold text-sm bg-purple-100 w-fit px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4" /> Tại {formatTime(capturedTime)}
                        </div>
                        <textarea
                            autoFocus
                            rows={3}
                            placeholder="Nhập nội dung ghi chú..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                        <div className="flex gap-2 mt-3 justify-end">
                            <button onClick={() => { setIsTyping(false); setNewNote(''); }} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">Hủy</button>
                            <button onClick={handleSaveNote} disabled={saving} className="px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md flex items-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu Ghi chú'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleStartTyping}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition flex flex-col items-center gap-2 font-medium"
                    >
                        <Plus className="w-6 h-6" /> Thêm ghi chú mới tại thời điểm này
                    </button>
                )}
            </div>

            {/* --- DANH SÁCH GHI CHÚ --- */}
            <div className="space-y-4">
                {notes.length === 0 ? (
                    <p className="text-center text-gray-500 py-6 italic">Bạn chưa có ghi chú nào cho bài học này.</p>
                ) : (
                    notes.map((note) => (
                        <div key={note._id} className="group flex gap-4 p-4 border border-gray-100 hover:border-purple-200 hover:shadow-md rounded-xl transition bg-white">

                            {/* Nút tua video */}
                            <button
                                onClick={() => seekTo(note.time)}
                                className="mt-1 h-fit flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-bold hover:bg-purple-600 hover:text-white transition shrink-0"
                            >
                                <Clock className="w-3 h-3" /> {formatTime(note.time)}
                            </button>

                            {/* Nội dung hoặc Form Sửa */}
                            <div className="flex-1">
                                {editingId === note._id ? (
                                    <div className="animate-in fade-in">
                                        <textarea
                                            autoFocus
                                            rows={2}
                                            className="w-full p-2 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm mb-2"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleUpdateNote(note._id)} disabled={updating} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded font-bold hover:bg-purple-700 flex items-center gap-1">
                                                {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Lưu
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded font-bold hover:bg-gray-300">
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{note.content}</p>
                                )}
                            </div>

                            {/* Các nút hành động (ẩn/hiện khi hover) */}
                            {editingId !== note._id && (
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0 transition-opacity">
                                    <button onClick={() => handleStartEdit(note)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition h-fit" title="Sửa ghi chú">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(note._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition h-fit" title="Xóa ghi chú">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}