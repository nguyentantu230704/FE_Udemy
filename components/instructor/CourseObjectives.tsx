'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, GripVertical } from 'lucide-react';

interface Props {
    objectives: string[];
    setObjectives: (objectives: string[]) => void;
}

export default function CourseObjectives({ objectives, setObjectives }: Props) {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (!newItem.trim()) return;
        setObjectives([...objectives, newItem]);
        setNewItem('');
    };

    const handleRemove = (index: number) => {
        const newDocs = [...objectives];
        newDocs.splice(index, 1);
        setObjectives(newDocs);
    };

    // Hàm xử lý khi nhấn Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="mt-6 border-t border-gray-100 pt-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
                Bạn sẽ học được gì?
            </label>
            <p className="text-xs text-gray-500 mb-3">
                Nhập các mục tiêu chính của khóa học (Mỗi mục tiêu một dòng).
            </p>

            {/* Input thêm mới */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ví dụ: Hiểu rõ về React Hooks..."
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 font-bold text-sm"
                >
                    <Plus className="w-4 h-4" /> Thêm
                </button>
            </div>

            {/* Danh sách hiện tại */}
            <div className="space-y-2">
                {objectives.map((obj, index) => (
                    <div key={index} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-100 group">
                        <div className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{obj}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {objectives.length === 0 && (
                    <div className="text-center py-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-400 text-sm italic">Chưa có mục tiêu nào được thêm.</p>
                    </div>
                )}
            </div>
        </div>
    );
}